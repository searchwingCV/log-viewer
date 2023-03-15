import { NextPageWithLayout } from './_app'
import { Layout } from '~/modules/Layout/Layout'
import FlightTableOverview from '~/views/FlightTableOverview'
import { flightData } from '~/modules/TableComponents'

const FlightOverviewPage: NextPageWithLayout = () => {
  return <FlightTableOverview data={flightData} />
}

FlightOverviewPage.getLayout = (page) => <Layout>{page}</Layout>

export default FlightOverviewPage
