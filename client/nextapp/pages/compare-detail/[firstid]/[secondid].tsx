import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import type { DexieError } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { ToastContainer, toast } from 'react-toastify'
import { IndexDBErrorMessage } from '@lib/ErrorMessage'
import { colorArr } from 'modules/PlotInterfaceComponents/colorArray'
import FlightComparisonView from 'views/FlightComparisonView'
import { Layout } from '~/modules/Layouts/Layout'
import database, { type DexieLogOverallData, OverallDataForFlightTable } from '@idbSchema'
import {
  LOG_OVERALL_DATA_MULTIPLE,
  getMultipleLogOverallDataMock,
} from 'api/flight/getMultipleLogOverallData'
import type { LogOverallData } from '@schema'
import type { NextPageWithLayout } from '../../_app'

const FlightCompareScreen: NextPageWithLayout = ({}) => {
  const router = useRouter()
  const { firstid, secondid } = router.query

  const activeOverallData = useLiveQuery(
    () =>
      firstid && secondid
        ? //TODO: solve dexie ts error
          // @ts-expect-error: Dexie not working with TS right now
          database.overallDataForFlight
            .orderBy('timestamp')
            .filter(
              (data: DexieLogOverallData) =>
                data.flightid === parseInt(firstid as string) ||
                data.flightid === parseInt(secondid as string),
            )
            .reverse()
            .toArray()
        : null,
    [firstid, secondid],
  )

  const { data } = useQuery(
    [LOG_OVERALL_DATA_MULTIPLE, parseInt(firstid as string), parseInt(secondid as string)],
    () =>
      getMultipleLogOverallDataMock([parseInt(firstid as string), parseInt(secondid as string)]),
    {
      onSuccess: (data: LogOverallData[]) => {
        if (data?.length === 2 && firstid && secondid) {
          data?.map((flightData) => {
            const { groupedProperties, flightid, ...rest } = flightData
            const dataForIDB = {
              ...rest,
              colorMatrix: colorArr.map((color) => ({
                color: color,
                taken: false,
              })),
              id: `${flightid}-${firstid}-${secondid}`,
              flightid: flightid,
              isIndividualFlight: false,
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
          })
        }
      },
      enabled:
        (activeOverallData !== undefined &&
          activeOverallData !== null &&
          activeOverallData?.find(
            (item: DexieLogOverallData) => item.flightid === parseInt(firstid as string),
          ) === undefined) ||
        activeOverallData?.find(
          (item: DexieLogOverallData) => item.flightid === parseInt(secondid as string),
        ) === undefined,
    },
  )

  if (!data) {
    return null
  }

  return (
    <>
      <ToastContainer />
      <FlightComparisonView />
    </>
  )
}

FlightCompareScreen.getLayout = (page) => <Layout isHeaderMinimalist>{page}</Layout>

export default FlightCompareScreen
