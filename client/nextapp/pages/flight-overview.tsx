import type { GetStaticProps } from 'next'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { NextPageWithLayout } from './_app'
import { fetchAllFlights, getFlightsMock } from '~/api/flight/getFlights'
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

export const getStaticProps: GetStaticProps = async () => {
  //Incremental static regeneration with react-query's prefetch query
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(['ALL_FLIGHTS'], () => getFlightsMock())

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60 * 5, // 5 minutes
  }
}

export default FlightOverviewPage
