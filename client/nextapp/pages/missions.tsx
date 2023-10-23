import React, { useEffect, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { GetServerSideProps } from 'next'
import type { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import {
  type Column,
  type TableInstance,
  type UsePaginationInstanceProps,
  type UsePaginationState,
} from 'react-table'
import { useForm } from 'react-hook-form'
import { Layout } from '@modules/Layouts/Layout'
import { Table, missionColumns } from '@modules/Table'
import type { MissionSerializer, MissionUpdate } from '@schema'
import {
  getMissions,
  ALL_MISSIONS_KEY,
  useFetchAllMissionsQuery,
  patchMissions,
} from '@api/mission'
import { TableType } from '@lib/globalTypes'
import { ApiErrorMessage } from '@lib/ErrorMessage'
import type { NextPageWithLayout } from './_app'

export type PaginationTableInstance<T extends object> = TableInstance<T> &
  UsePaginationInstanceProps<T> & {
    state: UsePaginationState<T>
  }

const MissionOverviewPage: NextPageWithLayout = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { page: queryPage, pagesize: queryPageSize, backFromAddForm } = router.query

  const { data, refetch } = useFetchAllMissionsQuery(
    parseInt(queryPage as string) || 1,
    parseInt(queryPageSize as string) || 10,
  )

  const updateMissions = useMutation(patchMissions, {
    onSuccess: async () => {
      toast('Data changed.', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      await queryClient.invalidateQueries([ALL_MISSIONS_KEY])

      formMethods.reset()
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
    if (backFromAddForm) {
      refetchData().catch((e) => console.error(e))
    }
  }, [backFromAddForm, refetch])

  const formMethods = useForm<MissionSerializer>({
    criteriaMode: 'all',
    mode: 'onSubmit',
    defaultValues: {},
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo<Column<MissionSerializer>[]>(() => missionColumns(), [data])
  const onUpdateMissions = (items: MissionUpdate[]) => updateMissions.mutate(items)

  if (!data || !data.items) {
    return null
  }
  return (
    <Table<MissionSerializer>
      data={data?.items}
      totalNumber={data?.total || 0}
      columns={columns}
      groupByOptions={[
        { name: 'None', value: '' },
        { name: 'Partner Organization', value: 'partnerOrganization' },
        { name: 'Mission Id', value: 'id' },
      ]}
      tableType={TableType.MISSION}
      patchInstances={onUpdateMissions}
      formMethods={formMethods}
    />
  )
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
