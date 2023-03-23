import 'regenerator-runtime/runtime'
import React, { useMemo } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { ToastContainer, toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import {
  useTable,
  Column,
  usePagination,
  useRowSelect,
  TableInstance,
  UsePaginationInstanceProps,
  UsePaginationState,
  useGroupBy,
  useSortBy,
  useExpanded,
  useFilters,
  useGlobalFilter,
  useColumnOrder,
} from 'react-table'
import { FormProvider, useForm } from 'react-hook-form'
import Select from 'modules/Select'
import Button from 'modules/Button'
import { FlightSchemaTable } from '@schema/FlightSchema'
import { putFlightsMock } from '~/api/flight/putFlights'
import {
  GlobalTextFilter,
  Pagination,
  SelectCheckbox,
  ColumnFilter,
  TableBody,
  TableHead,
} from '~/modules/TableComponents'

import { flightColumns } from './flightColumns'
import { fetchAllMissions } from '~/api/mission/getMissions'

export type PaginationTableInstance<T extends object> = TableInstance<T> &
  UsePaginationInstanceProps<T> & {
    state: UsePaginationState<T>
  }

export const FlightTableOverview = ({ data }: { data: FlightSchemaTable[] }) => {
  const { data: missions } = fetchAllMissions()
  const queryClient = useQueryClient()

  const updateFlights = useMutation(putFlightsMock, {
    onSettled: () => {
      queryClient.invalidateQueries(['ALL_FLIGHTS'])
    },
    onSuccess: (data) => {
      toast('Data changed.', {
        type: 'success',
      })
      methods.reset({})
      data.map((item) => methods.setValue(item, ''))
      queryClient.invalidateQueries(['ALL_FLIGHTS'])
    },
    onError: (data) => {
      toast('Error submitting data.', {
        type: 'error',
      })
      //TODO: implement scrolling to input if error from be
      //scrollInputIntoView(`input-${data[0]}`)
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
  const columns = useMemo<Column<FlightSchemaTable>[]>(
    () =>
      flightColumns(
        missions?.map((mission) => {
          return {
            value: mission.missionId,
            name: `${mission.missionAlias} - ${mission.missionId}`,
          }
        }),
      ),
    [missions],
  )
  const sortedData = useMemo(() => data.sort((a, b) => a.flightId - b.flightId), [])

  const onSubmit = methods.handleSubmit(async (formData) => {
    const changedKeys = Object.keys(formData).filter((item) => formData[item] !== '')
    const changedIds = changedKeys.map((key) => key.split('-')[1])
    const changedFlights = data.filter((flight) => {
      return changedIds.includes(flight.flightId.toString())
    })

    const newFlights = changedFlights.map((flight) => {
      const keysBelongingToFlight = changedKeys.filter((key) =>
        key.includes(flight.flightId.toString()),
      )
      const changedProps = keysBelongingToFlight
        .map((key) => {
          return { [key.split('-')[0]]: formData[key] === 'delete' ? '' : formData[key] }
        })
        .reduce((prev, cur) => {
          return { ...prev, ...cur }
        })
      const newFlight = { ...flight, ...changedProps }
      return newFlight
    })

    if (!newFlights.length) {
      toast('No new data inserted', { type: 'error' })
    } else {
      updateFlights.mutate({ flights: newFlights, changedIds: changedKeys })
    }
  })

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter, selectedRowIds, groupBy },
    setGlobalFilter,
    rows,
    setGroupBy,
    preGlobalFilteredRows,
    allColumns,
    setColumnOrder,
  } = useTable(
    {
      columns: columns,
      data: sortedData,
      defaultColumn,
      initialState: {},
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
          Header: ({ getToggleAllRowsSelectedProps }: any) => (
            <SelectCheckbox
              {...getToggleAllRowsSelectedProps()}
              className={`mt-4
                          ml-4`}
            />
          ),
          Cell: ({ row }: any) => (
            <div>
              <SelectCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ])
    },
  ) as PaginationTableInstance<FlightSchemaTable>

  const scrollInputIntoView = (id: string) => {
    var element = document.getElementById(id)

    if (element) {
      element.scrollIntoView()
    }
  }

  return (
    <div
      className={`relative
                  mb-40
                  px-6
                  pt-20
                  pb-12`}
    >
      <ToastContainer />
      <div
        className={`mb-8
                    grid
                    grid-cols-[minmax(700px,_1fr)_200px]
                    grid-rows-2
                    items-end
                    gap-y-2 gap-x-8`}
      >
        <GlobalTextFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        <Select
          name="groupby"
          placeholder="Group by"
          options={[
            { name: 'None', value: '' },
            { name: 'Pilot', value: 'pilot' },
            { name: 'missionId', value: 'missionId' },
          ]}
          onSetValue={setGroupBy}
          defaultValue="None"
          hasResetButton={true}
          resetButtonText={'Reset Group'}
        />
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <div className="overflow-x-scroll">
            <table {...getTableProps()} className={`roundex-xl`}>
              <TableHead
                headerGroups={headerGroups}
                allColumns={allColumns}
                setColumnOrder={setColumnOrder}
              ></TableHead>
              <TableBody<FlightSchemaTable>
                getTableBodyProps={getTableBodyProps}
                page={page}
                prepareRow={prepareRow}
                firstColumnAccessor={columns[0].accessor as string}
                hasRecords={!!rows?.length}
              ></TableBody>
            </table>
          </div>
          {!groupBy.length || groupBy?.[0] === '' ? (
            <Button
              disabled={!methods.formState.isDirty}
              buttonStyle="Main"
              type="submit"
              className={`sticky
                          left-[100vw]
                          bottom-8
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
      <Pagination
        gotoPage={gotoPage}
        previousPage={previousPage}
        nextPage={nextPage}
        canPreviousPage={canPreviousPage}
        pageSize={pageSize}
        canNextPage={canNextPage}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageOptions={pageOptions}
        setPageSize={setPageSize}
      />
    </div>
  )
}
