import { NextPageWithLayout } from './_app'
import { fetchAllFlights } from '~/api/flight/getFlights'
import { Layout } from '~/modules/Layout/Layout'
import FlightTableOverview from '~/views/FlightTableOverview'

const FlightOverviewPage: NextPageWithLayout = () => {
  const { data } = fetchAllFlights()
  if (!data) {
    return null
  }

  return <FlightTableOverview data={data} />
}

FlightOverviewPage.getLayout = (page) => <Layout>{page}</Layout>

export default FlightOverviewPage
