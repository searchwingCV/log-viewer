import { GetStaticProps, GetStaticPaths } from 'next'
import { getFlights } from '~/api/flight/getFlights'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { Layout } from '~/modules/Layouts/Layout'

const FlightDetailScreen = ({}) => {
  const router = useRouter()
  const { id } = router.query

  return (
    <>
      <Layout>{`Welcome to the detail screen of flight ${id} `}</Layout>
    </>
  )
}

export const getStaticPaths = async () => {
  const data = await getFlights(1, 10)

  const paths = Array.from(Array(data.total).keys())
    .map((x) => x + 1)
    .map((item) => ({
      params: { id: item.toString() },
    }))

  return { paths, fallback: false }
}

// This also gets called at build time
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery([`flight-${params?.id}`], () =>
    params?.id && parseInt(params?.id as string) > 0
      ? getFlights(parseInt(params?.id as string), 10)
      : null,
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default FlightDetailScreen
