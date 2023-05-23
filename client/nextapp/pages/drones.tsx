import React, { useEffect } from 'react'
import type { GetServerSideProps } from 'next'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { getDrones, ALL_DRONES_KEY, useFetchAllDronesQuery } from '~/api/drone/getDrones'
import DroneTableOverview from '~/views/DroneTableOverview'
import { Layout } from '~/modules/Layouts/Layout'
import type { NextPageWithLayout } from './_app'

const DroneTablePage: NextPageWithLayout = () => {
  const router = useRouter()
  const { page: queryPage, pagesize: queryPageSize, backFromAddForm } = router.query
  const { data, refetch } = useFetchAllDronesQuery(
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

  return <DroneTableOverview data={data.items} totalNumber={data.total} />
}

DroneTablePage.getLayout = (page) => <Layout>{page}</Layout>

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery([ALL_DRONES_KEY, 1, 10], () => getDrones(1, 10))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default DroneTablePage
