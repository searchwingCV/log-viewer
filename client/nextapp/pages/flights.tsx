import React, { useEffect } from 'react'
import type { GetServerSideProps } from 'next'
import { QueryClient, dehydrate, useQueries } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useFetchAllFlightsQuery, getFlights, ALl_FLIGHTS_KEY } from '~/api/flight/getFlights'
import { getDrones, ALL_DRONES_KEY } from '~/api/drone/getDrones'
import { getMissions, ALL_MISSIONS_KEY } from '~/api/mission/getMissions'
import { Layout } from '~/modules/Layouts/Layout'
import FlightTableOverview from '~/views/FlightTableOverview'
import type { NextPageWithLayout } from './_app'

const FlightOverviewPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { page: queryPage, pagesize: queryPageSize, backFromAddForm } = router.query

  const { data, refetch } = useFetchAllFlightsQuery(
    parseInt(queryPage as string) || 1,
    parseInt(queryPageSize as string) || 10,
  )

  //TODO: Turn into hook to avoid duplicate code
  const selectFieldData = useQueries({
    queries: [
      {
        queryKey: [ALL_DRONES_KEY, 1, 100],
        queryFn: () => getDrones(1, 100),
        staleTime: 10 * (60 * 1000), // 10 mins
      },
      {
        queryKey: [ALL_MISSIONS_KEY, 1, 100],
        queryFn: () => getMissions(1, 100),
        staleTime: 10 * (60 * 1000), // 10 mins
      },
    ],
  })

  const drones = selectFieldData?.[0]?.data?.items?.map((drone) => {
    return {
      value: drone.id,
      name: `${drone.name} - ${drone.id}`,
    }
  })

  const missions = selectFieldData?.[1]?.data?.items?.map((mission) => {
    return {
      value: mission.id,
      name: `${mission.name} - ${mission.id}`,
    }
  })

  useEffect(() => {
    const refetchData = async () => {
      await refetch()
    }
    if (backFromAddForm) {
      refetchData().catch((e) => console.error(e))
    }
  }, [backFromAddForm, refetch])

  if (!data || !data.items) {
    return null
  }
  return (
    <FlightTableOverview
      data={data.items}
      totalNumber={data.total}
      missionOptions={missions}
      droneOptions={drones}
    />
  )
}

FlightOverviewPage.getLayout = (page) => <Layout>{page}</Layout>

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery([ALl_FLIGHTS_KEY, 1, 10], () => getFlights(1, 10))
  //TODO: manage case where total number of saved drones and missions is more than 100
  //but in that case, it would mean: building a more elaborate select field
  await queryClient.prefetchQuery([ALL_DRONES_KEY, 1, 100], () => getDrones(1, 100))
  await queryClient.prefetchQuery([ALL_MISSIONS_KEY, 1, 100], () => getMissions(1, 100))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    //revalidate: 60 * 5, // 5 minutes
  }
}

export default FlightOverviewPage
