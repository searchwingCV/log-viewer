import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { differenceInMilliseconds } from 'date-fns'
import type { DexieError } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { ToastContainer, toast } from 'react-toastify'
import { IndexDBErrorMessage } from '@lib/ErrorMessage'
import { colorArr } from '~/lib/constants'
import FlightComparisonView from 'views/FlightComparisonView'
import { Layout } from '~/modules/Layouts/Layout'
import database, { type DexieLogOverallData, OverallDataForFlightTable } from '@idbSchema'
import {
  LOG_OVERALL_DATA_MULTIPLE,
  getMultipleLogOverallDataMock,
} from 'api/flight/getMultipleLogOverallData'
import { getDatesBetween } from '@lib/functions/getDatesBetween'
import type { LogOverallData } from '@schema'
import type { NextPageWithLayout } from '../../_app'

const FlightCompareScreen: NextPageWithLayout = ({}) => {
  const router = useRouter()
  const { firstid, secondid } = router.query
  const ids = [
    `${firstid}-${
      parseInt(firstid as string) < parseInt(secondid as string) ? firstid : secondid
    }-${parseInt(firstid as string) > parseInt(secondid as string) ? firstid : secondid}`,
    `${secondid}-${
      parseInt(firstid as string) < parseInt(secondid as string) ? firstid : secondid
    }-${parseInt(firstid as string) > parseInt(secondid as string) ? firstid : secondid}`,
  ]
  const activeOverallData = useLiveQuery(() => {
    return firstid && secondid
      ? //TODO: solve dexie ts error
        // @ts-expect-error: Dexie not working with TS right now
        database.overallDataForFlight
          .orderBy('timestamp')
          .filter((data: DexieLogOverallData) => data.id === ids[0] || data.id === ids[1])
          .reverse()
          .toArray()
      : null
  }, [firstid, secondid])

  const { data } = useQuery(
    [LOG_OVERALL_DATA_MULTIPLE, parseInt(firstid as string), parseInt(secondid as string)],
    () =>
      getMultipleLogOverallDataMock([parseInt(firstid as string), parseInt(secondid as string)]),
    {
      onSuccess: (data: LogOverallData[]) => {
        const activeOverallDataIds = activeOverallData?.map(
          (activeData: DexieLogOverallData) => activeData.id,
        )

        if (data?.length === 2 && firstid && secondid) {
          const retrievedIds = data.map((data) => data.flightid)

          const retrievedFirstId = retrievedIds[0]
          const retrievedSecondId = retrievedIds[1]

          const retrievedFinalIds = [
            {
              flightid: retrievedFirstId,
              finalId: `${retrievedFirstId}-${
                retrievedFirstId < retrievedSecondId ? retrievedFirstId : retrievedSecondId
              }-${retrievedFirstId > retrievedSecondId ? retrievedFirstId : retrievedSecondId}`,
            },

            {
              flightid: retrievedSecondId,
              finalId: `${retrievedSecondId}-${
                retrievedFirstId < retrievedSecondId ? retrievedFirstId : retrievedSecondId
              }-${retrievedFirstId > retrievedSecondId ? retrievedFirstId : retrievedSecondId}`,
            },
          ]

          const totalMilliseconds = data
            ?.map((data) => ({
              flightid: data.flightid,
              totalMs: differenceInMilliseconds(new Date(data.until), new Date(data.from)),
            }))
            .sort((a, b) => b.totalMs - a.totalMs)

          const longerFlightId = totalMilliseconds[0].flightid

          data?.map((flightData) => {
            const retrievedId = retrievedFinalIds.find((id) => id.flightid === flightData.flightid)

            if (!activeOverallDataIds.includes(retrievedId?.finalId)) {
              const { groupedProperties, flightid, from, until, ...rest } = flightData

              const dataForIDB = {
                ...rest,
                totalMilliseconds: differenceInMilliseconds(
                  new Date(flightData.until),
                  new Date(flightData.from),
                ),
                isLongerFlight: flightid === longerFlightId,
                colorMatrix: colorArr
                  .map((color) => ({
                    color: color,
                    taken: false,
                  }))
                  .sort(() => Math.random() - 0.5),
                id: `${flightid}-${firstid}-${secondid}`,
                flightid: flightid,
                from,
                until,
                isIndividualFlight: false,
                timestamps: getDatesBetween(from, until),
                timestamp: new Date(),
                groupedProperties: groupedProperties.map((groupedProp) => {
                  const { timeSeriesProperties } = groupedProp
                  const newTimeSeriesProperties = timeSeriesProperties.map((timeseriesProp) => ({
                    ...timeseriesProp,
                    calculatorExpression: `${groupedProp.messageType
                      .replace('[', '$')
                      .replace(']', '')}_${timeseriesProp.messageField}`,
                  }))
                  return {
                    ...groupedProp,
                    timeSeriesProperties: newTimeSeriesProperties,
                  }
                }),
              }

              OverallDataForFlightTable.add(dataForIDB)
                .then(() => {
                  console.info('overall data for flight added')
                })
                .catch((e: DexieError) => {
                  toast(<IndexDBErrorMessage error={e} event="fetch overall log data" />, {
                    type: 'error',
                    delay: 1,
                    position: toast.POSITION.BOTTOM_CENTER,
                  })
                })
            }
          })
        }
      },
      enabled: Array.isArray(activeOverallData), //Dexie's useLiveQuery is done if an array is returned
    },
  )

  if (!data) {
    return null
  }

  return (
    <>
      <ToastContainer />
      <FlightComparisonView ids={ids} />
    </>
  )
}

FlightCompareScreen.getLayout = (page) => <Layout isHeaderMinimalist>{page}</Layout>

export default FlightCompareScreen
