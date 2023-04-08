import type { GetStaticProps } from 'next'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { NextPageWithLayout } from '../_app'
import { fetchAllFlights, getFlights } from '~/api/flight/getFlights'
import { Layout } from '~/modules/Layout/Layout'
import FlightTableOverview from '~/views/FlightTableOverview'
import { MAX_NUM_ENTRIES_FETCHED } from '@lib/constants'

const FlightOverviewPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { page, size } = router.query
  const { data } = fetchAllFlights(parseInt(page as string) || 1, parseInt(size as string) || 20)

  if (!data || !data.items) {
    return null
  }
  return <FlightTableOverview data={data.items} totalNumber={data.total} />

  return null
}

FlightOverviewPage.getLayout = (page) => <Layout>{page}</Layout>

export const getStaticPaths = async () => {
  //we will fetch the first 100 entries and if the user has arrived at the 100 entry mark, we will fetch another
  const data = await getFlights(1)

  const totalNumber = data?.total
  const numberOfPages = Math.ceil(totalNumber / MAX_NUM_ENTRIES_FETCHED)

  const paths = Array.from({ length: numberOfPages }, (_, index) => index + 1).map((item) => ({
    params: { page: String(item) },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  //Incremental static regeneration with react-query's prefetch query

  const page = params?.page || 1

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(['ALL_FLIGHTS', page], () => getFlights(parseInt(page as string)))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60 * 5, // 5 minutes
  }
}

export default FlightOverviewPage
