import React from 'react'
import type { GetStaticProps } from 'next'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { getDrones, ALL_DRONES_KEY, fetchAllDronesQuery } from '~/api/drone/getDrones'
import DroneTableOverview from '~/views/DroneTableOverview'
import { Layout } from '~/modules/Layout/Layout'
import { NextPageWithLayout } from './_app'

const DroneTablePage: NextPageWithLayout = () => {
  const router = useRouter()
  const { page: queryPage, pagesize: queryPageSize } = router.query
  const { data } = fetchAllDronesQuery(
    parseInt(queryPage as string) || 1,
    parseInt(queryPageSize as string) || 10,
  )

  if (!data || !data.items) {
    return null
  }

  return <DroneTableOverview data={data.items} totalNumber={data.total} />
}

DroneTablePage.getLayout = (page) => <Layout>{page}</Layout>

export const getStaticProps: GetStaticProps = async () => {
  //Incremental static regeneration with react-query's prefetch query
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery([ALL_DRONES_KEY, 1, 10], () => getDrones(1, 10))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60 * 5, // 5 minutes
  }
}

export default DroneTablePage
