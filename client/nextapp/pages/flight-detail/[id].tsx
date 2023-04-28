import type { GetServerSideProps } from 'next'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import FlightDetailView from '~/views/FlightDetailView'
import {
  LOG_OVERALL_DATA,
  getLogOverallDataMock,
  fetchLogPropertyOverallData,
} from '~/api/flight/getLogOverallData'
import { Layout } from '~/modules/Layouts/Layout'
import type { NextPageWithLayout } from '../_app'

const FlightDetailScreen: NextPageWithLayout = ({}) => {
  const router = useRouter()
  const { id } = router.query
  const { data } = fetchLogPropertyOverallData(parseInt(id as string))

  if (!data) return null

  return (
    <>
      <FlightDetailView logOverallData={data} />
    </>
  )
}

FlightDetailScreen.getLayout = (page) => <Layout isHeaderMinimalist>{page}</Layout>

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const id = query.id
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery([LOG_OVERALL_DATA, id], () =>
    getLogOverallDataMock(parseInt(id as string)),
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default FlightDetailScreen
