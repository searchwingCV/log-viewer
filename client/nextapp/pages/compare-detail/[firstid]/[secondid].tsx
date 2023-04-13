import { GetStaticProps } from 'next'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { Layout } from '~/modules/Layouts/Layout'
import { getFlights } from '~/api/flight/getFlights'

const FlightCompareScreen = ({}) => {
  const router = useRouter()
  const { firstid, secondid } = router.query

  return (
    <>
      <Layout>{`Welcome to the detail screen of flight ${firstid} and ${secondid}`}</Layout>
    </>
  )
}

export const getStaticPaths = async () => {
  const data = await getFlights(1, 10)

  const idArray = Array.from(Array(data.total).keys()).map((x) => x + 1)

  const paths = idArray.flatMap((firstValue, i) =>
    idArray.slice(i + 1).map((secondValue) => ({
      params: {
        firstid: firstValue.toString(),
        secondid: secondValue.toString(),
      },
    })),
  )

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

export default FlightCompareScreen
