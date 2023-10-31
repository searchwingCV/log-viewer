import { useEffect, useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import type { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { type Column } from 'react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import type { DroneSerializer, DroneUpdate } from '@schema'
import { ALL_DRONES_KEY, getDrones, useFetchAllDronesQuery, patchDrones } from '@api/drone'
import { Layout } from '@modules/Layouts/Layout'
import { TableType } from '@lib/globalTypes'
import { ApiErrorMessage } from '@lib/ErrorMessage'
import { Table, droneColumns } from '@modules/Table'
import type { NextPageWithLayout } from './_app'

const DroneTablePage: NextPageWithLayout = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { page: queryPage, pagesize: queryPageSize, backwards } = router.query
  const { data, refetch } = useFetchAllDronesQuery(
    parseInt(queryPage as string) || 1,
    parseInt(queryPageSize as string) || 10,
  )

  const updateDrones = useMutation(patchDrones, {
    onSettled: async () => {
      await queryClient.invalidateQueries([ALL_DRONES_KEY])
    },
    onSuccess: async () => {
      toast('Data changed.', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      formMethods.reset()

      await queryClient.invalidateQueries([ALL_DRONES_KEY])
    },
    onError: (error: AxiosError<any>) => {
      toast(<ApiErrorMessage error={error} />, {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
        delay: 1,
      })
    },
  })

  useEffect(() => {
    const refetchData = async () => {
      await refetch()
    }
    if (backwards) {
      refetchData().catch((e) => console.error(e))
    }
  }, [backwards, refetch])

  const formMethods = useForm<DroneSerializer>({
    criteriaMode: 'all',
    mode: 'onSubmit',
    defaultValues: {},
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo<Column<DroneSerializer>[]>(() => droneColumns(), [data])
  const onUpdateDrones = (items: DroneUpdate[]) => updateDrones.mutate(items)

  if (!data || !data.items) {
    return null
  }

  return (
    <Table<DroneSerializer>
      data={data?.items}
      totalNumber={data?.total || 0}
      columns={columns}
      groupByOptions={[
        { name: 'None', value: '' },
        { name: 'Status', value: 'status' },
      ]}
      tableType={TableType.DRONE}
      patchInstances={onUpdateDrones}
      formMethods={formMethods}
    />
  )
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
