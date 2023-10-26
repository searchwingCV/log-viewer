/*TODO: We have to migrate to react-table v8 at some point. However, the documentation on migration 
  is still really bad. 
  https://tanstack.com/table/v8/docs/guide/migrating
*/

import 'regenerator-runtime/runtime'
import React, { useMemo } from 'react'
import useElementSize from '@charlietango/use-element-size'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import {
  useTable,
  type Column,
  type Row,
  usePagination,
  type TableInstance,
  type UsePaginationInstanceProps,
  type UsePaginationState,
  useGroupBy,
  useSortBy,
  useRowSelect,
  useExpanded,
  useFilters,
  useGlobalFilter,
  useColumnOrder,
} from 'react-table'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import Button from 'modules/Button'
import type { TableType } from '@lib/globalTypes'
import { ColumnFilter, TableBody, TableHead, SelectCheckbox } from '@modules/Table'

//TODO: Fix TS bug concerning dynamic imports and generics once Typescript fixes it https://github.com/microsoft/TypeScript/issues/30712
const TableFrame = dynamic(() => import('./components/TableFrame'), { ssr: false })

export type PaginationTableInstance<T extends { id: number }> = TableInstance<T> &
  UsePaginationInstanceProps<T> & {
    state: UsePaginationState<T>
  }

export function Table<T extends { id: number }>({
  data,
  totalNumber,
  columns,
  groupByOptions,
  tableType,
  patchInstances,
  hasSelectBox,
  onSelectRow,
  formMethods,
}: {
  data: T[]
  totalNumber: number
  columns: Column<T>[]
  groupByOptions: { name: string; value: string }[]
  tableType: TableType
  formMethods: UseFormReturn<T>
  patchInstances: (items: any) => void
  hasSelectBox?: boolean
  onSelectRow?: (row: Row<T>[]) => void
}) {
  const [ref, size] = useElementSize()
  const router = useRouter()
  const { pagesize: queryPageSize } = router.query

  const defaultColumn = useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: ColumnFilter,
    }),
    [],
  )

  const onSubmit = formMethods.handleSubmit((formData) => {
    const changedKeys = Object.keys(formData).filter((item) => formData[item as keyof T] !== '')
    const changedIds = changedKeys.map((key) => key.split('-')[1])
    const changedRowInstances = data.filter((tableRowInstance) => {
      return changedIds.includes(tableRowInstance.id.toString())
    })
    const newtableRowInstances = changedRowInstances.map((tableRowInstance) => {
      const keysBelongingTotableRowInstance = changedKeys.filter((key) => {
        const tableRowInstanceid = key.split('-')[1]
        return tableRowInstance.id.toString() === tableRowInstanceid
      })
      const changedProps = keysBelongingTotableRowInstance
        .map((key) => {
          return {
            [key.split('-')[0]]:
              formData[key as keyof T] === 'delete'
                ? ''
                : key.startsWith('fk') //fkKeys have to be numbers
                ? parseInt(
                    formData[key as keyof T] !== 'undefined'
                      ? (formData[key as keyof T] as string)
                      : '-1',
                  )
                : formData[key as keyof T] === 'true'
                ? true
                : formData[key as keyof T] === 'false'
                ? false
                : formData[key as keyof T],
          }
        })
        .reduce((prev, cur) => {
          return { ...prev, ...cur }
        })

      const { id } = tableRowInstance
      const newtableRowInstance = { ...changedProps, id }

      return newtableRowInstance
    })

    if (!newtableRowInstances.length) {
      toast(
        'No new data inserted. Non-nullable fields will not change if empty string was inserted.',
        { type: 'error', position: toast.POSITION.BOTTOM_CENTER },
      )
    } else {
      patchInstances(newtableRowInstances)
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
      data: data,
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
      hasSelectBox &&
        hooks.visibleColumns.push((columns: Column<T>[]) => [
          {
            id: 'selection',
            Header: () => (
              <a
                type="button"
                className={`
                         -mr-3
                         ml-1
                         mt-2
                         text-xs`}
                onClick={() => toggleAllPageRowsSelected(false)}
              >
                <span className="block">Reset</span>
                <span>Sel</span>
              </a>
            ),
            Cell: ({ row }: { row: any }) => {
              if (!row?.isGrouped) {
                return (
                  <span>
                    <SelectCheckbox {...row.getToggleRowSelectedProps()} />
                  </span>
                )
              }
              return null
            },
          },
          ...columns,
        ])
    },
  ) as PaginationTableInstance<T>

  return (
    //TODO: Fix TS bug concerning dynamic imports and generics once Typescript fixes it https://github.com/microsoft/TypeScript/issues/30712
    // eslint-disable-next-line
    // @ts-expect-error
    <TableFrame<T>
      pageCount={pageCount}
      pageSize={pageSize}
      totalNumber={totalNumber}
      pageOptions={pageOptions}
      pageIndex={pageIndex}
      tableType={tableType}
      groupByOptions={groupByOptions}
      allColumns={allColumns}
      setColumnOrder={setColumnOrder}
      setGlobalFilter={setGlobalFilter}
      globalFilter={globalFilter}
      setGroupBy={setGroupBy}
      width={size.width}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={onSubmit}>
          <div className="overflow-x-scroll">
            <table {...getTableProps()} className={`rounded-xl`} ref={ref}>
              <TableHead
                headerGroups={headerGroups}
                allColumns={allColumns}
                setColumnOrder={setColumnOrder}
              ></TableHead>
              <TableBody<T>
                hasNoSelection={!hasSelectBox}
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
                             bottom-20
                             left-[100vw]
                             w-[350px]
                             p-4`}
              isSpecial
              onClick={() => {
                onSelectRow && selectedFlatRows && onSelectRow(selectedFlatRows)
              }}
            >
              {'Go to detail view'}
            </Button>
          ) : !groupBy.length || groupBy?.[0] === '' ? (
            <Button
              disabled={!formMethods.formState.isDirty}
              buttonStyle="Main"
              type="submit"
              className={`sticky
                              bottom-20
                              left-[100vw]
                              w-[350px]
                              p-4`}
            >
              {'Submit Changes'}
            </Button>
          ) : (
            <div className="min-h-[40px]"></div>
          )}
        </form>
      </FormProvider>
    </TableFrame>
  )
}
