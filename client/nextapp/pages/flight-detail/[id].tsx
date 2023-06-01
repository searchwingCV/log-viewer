import { useLiveQuery } from 'dexie-react-hooks'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import database, { type DexieLogOverallData, OverallDataForFlightTable } from '@idbSchema'
import { colorArr } from 'modules/PlotInterfaceComponents/colorArray'
import FlightDetailView from 'views/FlightDetailView'
import { LOG_OVERALL_DATA, getLogOverallDataMock } from 'api/flight/getLogOverallData'
import { Layout } from 'modules/Layouts/Layout'
import type { NextPageWithLayout } from '../_app'

const FlightDetailScreen: NextPageWithLayout = ({}) => {
  const router = useRouter()
  const { id } = router.query

  const activeOverallData = useLiveQuery(
    () =>
      id
        ? //TODO: solve dexie ts error
          // @ts-expect-error: Dexie not working with TS right now
          database.overallDataForFlight
            ?.orderBy('timestamp')
            ?.filter((data: DexieLogOverallData) => data.id === id)
            ?.reverse()
            ?.toArray()
        : null,
    [id],
  )

  const { data } = useQuery(
    [LOG_OVERALL_DATA, parseInt(id as string)],
    () => getLogOverallDataMock(parseInt(id as string)),
    {
      onSuccess: (data) => {
        const { groupedProperties, flightid, ...rest } = data
        const dataForIDB = {
          ...rest,
          id: flightid,
          flightid: flightid,
          colorMatrix: colorArr.map((color) => ({
            color: color,
            taken: false,
          })),
          isIndividualFlight: true,
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
          .catch((e) => console.error(e))
      },
      enabled:
        activeOverallData !== undefined &&
        activeOverallData !== null &&
        activeOverallData?.find(
          (item: DexieLogOverallData) => item.flightid === parseInt(id as string),
        ) === undefined,
    },
  )
  if (!data && !activeOverallData?.length) return null

  return (
    <>
      <FlightDetailView />
    </>
  )
}

FlightDetailScreen.getLayout = (page) => <Layout isHeaderMinimalist>{page}</Layout>

export default FlightDetailScreen
