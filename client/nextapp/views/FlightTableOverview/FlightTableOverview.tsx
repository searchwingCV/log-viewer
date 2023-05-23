//TODO: Refactor code of FlightTableOverview, MissionTableOverview & DroneTableOverview to avoid duplicate code
import 'regenerator-runtime/runtime'
import React, { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import {
  useTable,
  type Column,
  usePagination,
  useRowSelect,
  type TableInstance,
  type UsePaginationInstanceProps,
  type UsePaginationState,
  useGroupBy,
  useSortBy,
  useExpanded,
  useFilters,
  useGlobalFilter,
  useColumnOrder,
} from 'react-table'
import { FormProvider, useForm } from 'react-hook-form'
import Button from 'modules/Button'
import { ALl_FLIGHTS_KEY } from '~/api/flight/getFlights'
import type { FlightSerializer, FlightUpdate } from '@schema'
import { patchFlights } from '~/api/flight/patchFlights'

import {
  SelectCheckbox,
  ColumnFilter,
  TableBody,
  TableHead,
  TableFrame,
  DrawerExtensionTypes,
} from 'modules/TableComponents'

import { flightColumns } from './flightColumns'

export type PaginationTableInstance<T extends object> = TableInstance<T> &
  UsePaginationInstanceProps<T> & {
    state: UsePaginationState<T>
  }

//we need an adjusted Type because the fk keys should be represented by a string to be more verbose by the table
export type TableFlightSerializer = Omit<FlightSerializer, 'fkMission' | 'fkDrone'> & {
  fkMission: string | undefined
  fkDrone: string | undefined
}

export const FlightTableOverview = ({
  data,
  totalNumber,
  missionOptions,
  droneOptions,
}: {
  data: FlightSerializer[]
  totalNumber: number
  missionOptions?: { name: string; value: number }[]
  droneOptions?: { name: string; value: number }[]
}) => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const parseVerboseNamesForForeignKeys = useCallback(
    (data: FlightSerializer[]) => {
      const dataCopy = [...data]

      const parsedData = dataCopy.map((flight) => {
        const { fkDrone, fkMission, ...rest } = flight

        const verboseDroneName =
          droneOptions?.find((drone) => drone.value === fkDrone)?.name || fkDrone
        const verboseMissionName = missionOptions?.find(
          (mission) => mission.value === fkMission,
        )?.name

        return { fkDrone: verboseDroneName, fkMission: verboseMissionName, ...rest }
      })

      return parsedData
    },

    [droneOptions, missionOptions],
  )

  //TODO: Figure out why TableFlightSerializer[] does not work as a type
  const verboseData: any = useMemo(() => {
    return parseVerboseNamesForForeignKeys(data)
  }, [data, parseVerboseNamesForForeignKeys])

  const { pagesize: queryPageSize } = router.query

  const updateFlights = useMutation(patchFlights, {
    onSuccess: async () => {
      toast('Data changed.', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      methods.reset()

      await queryClient.invalidateQueries([ALl_FLIGHTS_KEY])
    },
    onError: (error) => {
      toast(`Error submitting data.${error}`, {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
      })
    },
  })
  //TODO: find type
  const methods = useForm<any>({
    criteriaMode: 'all',
    mode: 'onSubmit',
    defaultValues: {},
  })

  const defaultColumn = useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: ColumnFilter,
    }),
    [],
  )

  const { t } = useTranslation()
  const columns = useMemo<Column<TableFlightSerializer>[]>(
    () => flightColumns(missionOptions, droneOptions),
    [missionOptions, droneOptions],
  )

  const onSubmit = methods.handleSubmit((formData) => {
    const changedKeys = Object.keys(formData).filter((item) => formData[item] !== '')
    const changedIds = changedKeys.map((key) => key.split('-')[1])
    const changedFlights = data.filter((flight) => {
      return changedIds.includes(flight.id.toString())
    })

    const newFlights: FlightUpdate[] = changedFlights.map((flight) => {
      const keysBelongingToFlight = changedKeys.filter((key) => {
        const flightid = key.split('-')[1]
        return flight.id.toString() === flightid
      })

      const changedProps = keysBelongingToFlight
        .map((key) => {
          return {
            [key.split('-')[0]]:
              formData[key] === 'delete'
                ? null
                : key.startsWith('fk') //fkKeys have to be numbers
                ? parseInt(formData[key])
                : formData[key] === 'true'
                ? true
                : formData[key] === 'false'
                ? false
                : formData[key],
          }
        })
        .reduce((prev, cur) => {
          return { ...prev, ...cur }
        })

      const { id } = flight
      const newFlight = { ...changedProps, id }
      return newFlight
    })

    if (!newFlights.length) {
      toast(
        'No new data inserted. Non-nullable fields will not change if empty string was inserted.',
        { type: 'error', position: toast.POSITION.BOTTOM_CENTER },
      )
    } else {
      updateFlights.mutate(newFlights)
    }
  })

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    pageOptions,
    pageCount,
    state: { pageIndex, pageSize, globalFilter, groupBy },
    setGlobalFilter,
    rows,
    setGroupBy,
    allColumns,
    setColumnOrder,
    selectedFlatRows,
    toggleAllPageRowsSelected,
  } = useTable(
    {
      columns: columns,
      data: verboseData,
      defaultColumn,
      initialState: {},
      pageCount: Math.ceil(totalNumber / (parseInt(queryPageSize as string) || 10)),
      manualPagination: true,
    },
    useFilters,
    useColumnOrder,
    useGlobalFilter,
    useGroupBy,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect,

    (hooks) => {
      hooks.visibleColumns.push((columns: any) => [
        {
          id: 'selection',
          Header: ({}: any) => (
            <a
              type="button"
              className={`
                         mt-2
                         ml-1
                         -mr-3
                         text-xs`}
              onClick={() => toggleAllPageRowsSelected(false)}
            >
              <span className="block">Reset</span>
              <span>Sel</span>
            </a>
          ),
          Cell: ({ row }: any) => {
            if (!row?.isGrouped) {
              return (
                <div>
                  <SelectCheckbox {...row.getToggleRowSelectedProps()} />
                </div>
              )
            }
            return null
          },
        },
        ...columns,
      ])
    },
  ) as PaginationTableInstance<TableFlightSerializer>

  const goToDetailView = async () => {
    if (selectedFlatRows.length === 1) {
      await router.push(`/flight-detail/${selectedFlatRows[0]?.original?.id}`)
    } else if (selectedFlatRows.length > 1) {
      const originalRows = selectedFlatRows.filter((item) => !item.isGrouped)
      await router.push(
        `/compare-detail/${originalRows[0]?.original?.id}/${originalRows[1]?.original?.id}`,
      )
    }
  }

  return (
    <TableFrame<TableFlightSerializer>
      pageCount={pageCount}
      pageSize={pageSize}
      totalNumber={totalNumber}
      pageOptions={pageOptions}
      pageIndex={pageIndex}
      tableType={'flight'}
      drawerExtensionType={DrawerExtensionTypes.FLIGHT_DRAWER_EXTENDED}
      groupByOptions={[
        { name: 'None', value: '' },
        { name: 'Pilot', value: 'pilot' },
        { name: 'Mission Id', value: 'fkMission' },
        { name: 'Drone Id', value: 'fkDrone' },
      ]}
      allColumns={allColumns}
      setColumnOrder={setColumnOrder}
      setGlobalFilter={setGlobalFilter}
      globalFilter={globalFilter}
      setGroupBy={setGroupBy}
    >
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <div className="overflow-x-auto">
            <table {...getTableProps()} className={`roundex-xl relative`}>
              <TableHead
                headerGroups={headerGroups}
                allColumns={allColumns}
                setColumnOrder={setColumnOrder}
                hasLongHeaderNames
              ></TableHead>
              <TableBody<TableFlightSerializer>
                getTableBodyProps={getTableBodyProps}
                page={page}
                prepareRow={prepareRow}
                firstColumnAccessor={columns[0].accessor as string}
                hasRecords={!!rows?.length}
                selectedOriginalRows={selectedFlatRows
                  ?.filter((item) => !item.isGrouped)
                  ?.map((item) => {
                    return { id: item.id, index: item.index }
                  })}
                numberOfRows={rows.length}
              ></TableBody>
            </table>
          </div>
          {selectedFlatRows.length ? (
            <Button
              buttonStyle="Main"
              type="button"
              className={`sticky
                             left-[100vw]
                             bottom-20
                             w-[350px]
                             p-4`}
              isSpecial
              onClick={async () => {
                await goToDetailView()
              }}
            >
              {t('Go to detail view')}
            </Button>
          ) : !groupBy.length || groupBy?.[0] === '' ? (
            <Button
              disabled={!methods.formState.isDirty}
              buttonStyle="Main"
              type="submit"
              className={`sticky
                              left-[100vw]
                              bottom-20
                              w-[350px]
                              p-4`}
            >
              {t('Submit Changes')}
            </Button>
          ) : (
            <div className="min-h-[40px]"></div>
          )}
        </form>
      </FormProvider>
    </TableFrame>
  )
}
