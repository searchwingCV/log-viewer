import 'regenerator-runtime/runtime'
import React, { useEffect, useMemo } from 'react'
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
import { FlightSchema, FlightSchemaTable } from '@schema/FlightSchema'

import {
  flightData,
  GlobalTextFilter,
  Pagination,
  SelectCheckbox,
  ColumnFilter,
  TableBody,
  TableHead,
} from '~/modules/TableComponents'

import { flightColumns } from './flightColumns'

export type PaginationTableInstance<T extends object> = TableInstance<T> &
  UsePaginationInstanceProps<T> & {
    state: UsePaginationState<T>
  }

type Props = {
  data: FlightSchemaTable[]
}

export const FlightTableOverview = ({ data }: Props) => {
  const methods = useForm<FlightSchema>({
    criteriaMode: 'all',
    mode: 'onSubmit',
    defaultValues: {},
  })


  useEffect(() => {

    console.log(process.env.NEXT_PUBLIC_API_URL)
  }, [])
  const defaultColumn = useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: ColumnFilter,
    }),
    [],
  )
  const { t } = useTranslation()
  const columns = useMemo<Column<FlightSchemaTable>[]>(() => flightColumns, [])
  const sortedData = useMemo(() => flightData.sort((a, b) => a.flightId - b.flightId), [])

  const onSubmit = methods.handleSubmit(async (data) => {
    console.log(data)
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
    state: { pageIndex, pageSize, globalFilter, selectedRowIds },
    setGlobalFilter,
    rows,
    setGroupBy,
    preGlobalFilteredRows,
    allColumns,
    setSortBy,
    selectedFlatRows,
    getToggleHideAllColumnsProps,
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
        // Let's make a column for selection
        {
          id: 'selection',
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }: any) => (
            <SelectCheckbox
              {...getToggleAllRowsSelectedProps()}
              className={`mt-4
                          ml-4`}
            />
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
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

  return (
    <div
      className={`relative
                  py-20
                  px-6`}
    >
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
            { name: 'flightId', value: 'flightId' },
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
            <table
              {...getTableProps()}
              className={`roundex-xl
                          table-fixed`}
            >
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
          <Button
            //href="/"
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
