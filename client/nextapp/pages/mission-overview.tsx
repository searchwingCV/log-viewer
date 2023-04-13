import React from 'react'
import type { GetStaticProps } from 'next'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { getMissions, ALL_MISSIONS_KEY, fetchAllMissionsQuery } from '~/api/mission/getMissions'
import { Layout } from '~/modules/Layouts/Layout'
import { NextPageWithLayout } from './_app'
import { MissionTableOverview } from '~/views/MissionTableOverview/MissionTableOberview'

const MissionOverviewPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { page: queryPage, pagesize: queryPageSize } = router.query
  const { data } = fetchAllMissionsQuery(
    parseInt(queryPage as string) || 1,
    parseInt(queryPageSize as string) || 10,
  )

  if (!data || !data.items) {
    return null
  }
  return <MissionTableOverview data={data.items} totalNumber={data.total} />
}

MissionOverviewPage.getLayout = (page) => <Layout>{page}</Layout>

export const getStaticProps: GetStaticProps = async () => {
  //Incremental static regeneration with react-query's prefetch query
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery([ALL_MISSIONS_KEY, 1, 10], () => getMissions(1, 10))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60 * 5, // 5 minutes
  }
}

export default MissionOverviewPage
