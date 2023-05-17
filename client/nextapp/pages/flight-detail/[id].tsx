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
            .orderBy('timestamp')
            .filter((data: DexieLogOverallData) => data.flightid === parseInt(id as string))
            .reverse()
            .toArray()
        : null,
    [id],
  )

  const { data } = useQuery(
    [LOG_OVERALL_DATA, parseInt(id as string)],
    () => getLogOverallDataMock(parseInt(id as string)),
    {
      onSuccess: (data) => {
        const { groupedProperties, ...rest } = data
        const dataForIDB = {
          ...rest,
          colorMatrix: colorArr.map((color) => ({
            color: color,
            taken: false,
          })),
          timestamp: new Date(),
          groupedProperties: groupedProperties.map((groupedProp) => {
            const { timeSeriesProperties } = groupedProp
            const newTimeSeriesProperties = timeSeriesProperties.map((timeseriesProp) => ({
              ...timeseriesProp,
              dexieKey: `${id}-${timeseriesProp.id}`,
              calculatorExpression: `${groupedProp.name.replace('[', '$').replace(']', '')}_${
                timeseriesProp.name
              }`,
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
      <FlightDetailView
        logOverallData={
          data ||
          activeOverallData?.find(
            (item: DexieLogOverallData) => item.flightid === parseInt(id as string),
          )
        }
      />
    </>
  )
}

FlightDetailScreen.getLayout = (page) => <Layout isHeaderMinimalist>{page}</Layout>

export default FlightDetailScreen
