import type { GetServerSideProps } from 'next'
import { QueryClient, dehydrate, useQueries } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import FlightDetailView from '~/views/FlightDetailView'
import {
  LOG_OVERALL_DATA,
  getLogOverallDataMock,
  fetchLogPropertyOverallData,
} from '~/api/flight/getLogOverallData'

const FlightDetailScreen = ({}) => {
  const router = useRouter()
  const { id } = router.query

  const { data } = fetchLogPropertyOverallData(parseInt(id as string))

  console.log('data', data)

  if (!data) return null

  return (
    <>
      <FlightDetailView logOverallData={data} />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const id = query.id
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery([LOG_OVERALL_DATA, id], () => getLogOverallDataMock(id))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    //revalidate: 60 * 5, // 5 minutes
  }
}

export default FlightDetailScreen
