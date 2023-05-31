import React, { useEffect } from 'react'
import type { GetServerSideProps } from 'next'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { getMissions, ALL_MISSIONS_KEY, useFetchAllMissionsQuery } from '~/api/mission/getMissions'
import { Layout } from '~/modules/Layouts/Layout'
import MissionTableOverview from '~/views/MissionTableOverview'
import type { NextPageWithLayout } from './_app'

const MissionOverviewPage: NextPageWithLayout = () => {
  const router = useRouter()

  const { page: queryPage, pagesize: queryPageSize, backFromAddForm } = router.query

  const { data, refetch } = useFetchAllMissionsQuery(
    parseInt(queryPage as string) || 1,
    parseInt(queryPageSize as string) || 10,
  )

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
  return <MissionTableOverview data={data.items} totalNumber={data.total} />
}

MissionOverviewPage.getLayout = (page) => <Layout>{page}</Layout>

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery([ALL_MISSIONS_KEY, 1, 10], () => getMissions(1, 10))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    // revalidate: 60 * 5, // 5 minutes
  }
}

export default MissionOverviewPage
