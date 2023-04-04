import { GetStaticProps, GetStaticPaths } from 'next'
import { getFlightsMock } from '~/api/flight/getFlights'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { Layout } from 'modules/Layout/Layout'
import { getFlightMock } from '~/api/flight/getFlightDetail'

const FlightCompareScreen = ({}) => {
  const router = useRouter()
  const { firstid, secondid } = router.query

  return (
    <>
      <Layout>{`Welcome to the detail screen of flight ${firstid} and ${secondid}`}</Layout>
    </>
  )
}

export async function getStaticPaths() {
  const data = getFlightsMock()

  const paths = data.map((item) => ({
    params: { firstid: item.flightId, secondid: item.flightId },
  }))

  return { paths, fallback: 'blocking' }
}

// This also gets called at build time
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(
    [`flight-${params?.id}`],
    () => params?.id && getFlightMock(params?.id as string),
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default FlightCompareScreen
