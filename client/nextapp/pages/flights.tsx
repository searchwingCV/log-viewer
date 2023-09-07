import React, { useEffect, useCallback, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { GetServerSideProps } from 'next'
import type { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { QueryClient, dehydrate, useQueries } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { type Column, type Row } from 'react-table'
import { useForm } from 'react-hook-form'
import type { FlightSerializer, FlightUpdate } from '@schema'
import type { TableFlightSerializer } from '@lib/globalTypes'
import { useFetchAllFlightsQuery, getFlights, ALl_FLIGHTS_KEY, patchFlights } from '@api/flight'
import { getDrones, ALL_DRONES_KEY } from '@api/drone'
import { getMissions, ALL_MISSIONS_KEY } from '@api/mission'
import { Layout } from '@modules/Layouts/Layout'
import { TableType } from '@lib/globalTypes'
import { ApiErrorMessage } from '@lib/ErrorMessage'
import { Table, flightColumns } from '@modules/Table'
import type { NextPageWithLayout } from './_app'

const FlightOverviewPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { page: queryPage, pagesize: queryPageSize, backFromAddForm } = router.query

  const { data, refetch } = useFetchAllFlightsQuery(
    parseInt(queryPage as string) || 1,
    parseInt(queryPageSize as string) || 10,
  )

  const queryClient = useQueryClient()

  const updateFlights = useMutation(patchFlights, {
    onSuccess: async () => {
      toast('Data changed.', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      formMethods.reset()

      await queryClient.invalidateQueries([ALl_FLIGHTS_KEY])
    },
    onError: (error: AxiosError<any>) => {
      toast(<ApiErrorMessage error={error} />, {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
        delay: 1,
      })
    },
  })

  const goToDetailView = async (selectedFlatRows: Row<TableFlightSerializer>[]) => {
    if (selectedFlatRows.length === 1) {
      await router.push(`/flight-detail/${selectedFlatRows[0]?.original?.id}`)
    } else if (selectedFlatRows.length > 1) {
      const originalRows = selectedFlatRows.filter((item) => !item.isGrouped)
      await router.push(
        `/compare-detail/${originalRows[0]?.original?.id}/${originalRows[1]?.original?.id}`,
      )
    }
  }

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

  const formMethods = useForm<TableFlightSerializer>({
    criteriaMode: 'all',
    mode: 'onSubmit',
  })

  const parseVerboseNamesForForeignKeys = useCallback(
    (data: FlightSerializer[]) => {
      const dataCopy = [...data]
      const parsedData = dataCopy.map((flight) => {
        const { fkDrone, fkMission, ...rest } = flight
        const verboseDroneName =
          drones?.find((drone) => drone.value === fkDrone)?.name || `${fkDrone}`
        const verboseMissionName = missions?.find((mission) => mission.value === fkMission)?.name

        return { fkDrone: verboseDroneName, fkMission: verboseMissionName, ...rest }
      })

      return parsedData
    },
    [drones, missions],
  )

  useEffect(() => {
    const refetchData = async () => {
      await refetch()
    }
    if (backFromAddForm) {
      refetchData().catch((e) => console.error(e))
    }
  }, [backFromAddForm, refetch])

  const verboseData: TableFlightSerializer[] | null = useMemo(() => {
    return data?.items ? parseVerboseNamesForForeignKeys(data.items) : null
  }, [data, parseVerboseNamesForForeignKeys])

  const columns = useMemo<Column<TableFlightSerializer>[]>(
    () => flightColumns(missions, drones),
    [missions, drones],
  )

  const onUpdateFlights = (items: FlightUpdate[]) => updateFlights.mutate(items)

  if (!verboseData || !data) {
    return null
  }

  return (
    <Table<TableFlightSerializer>
      data={verboseData}
      totalNumber={data?.total || 0}
      columns={columns}
      groupByOptions={[
        { name: 'None', value: '' },
        { name: 'Pilot', value: 'pilot' },
        { name: 'Mission Id', value: 'fkMission' },
        { name: 'Drone Id', value: 'fkDrone' },
      ]}
      tableType={TableType.FLIGHT}
      patchInstances={onUpdateFlights}
      hasSelectBox={true}
      onSelectRow={goToDetailView}
      formMethods={formMethods}
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
