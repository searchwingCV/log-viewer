//TODO: Refactor code of FlightTableOverview, MissionTableOverview & DroneTableOverview to avoid duplicate code
import 'regenerator-runtime/runtime'
import React, { useMemo } from 'react'
import type { AxiosError } from 'axios'
import useElementSize from '@charlietango/use-element-size'
import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import {
  useTable,
  type Column,
  usePagination,
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
import type { DroneSerializer, DroneUpdate } from '@schema'
import { ApiErrorMessage } from '@lib/ErrorMessage'
import { patchDrones } from '~/api/drone/patchDrones'
import { ALL_DRONES_KEY } from '~/api/drone/getDrones'
import {
  ColumnFilter,
  TableBody,
  TableHead,
  TableFrame,
  DrawerExtensionTypes,
} from '~/modules/TableComponents'
import { droneColumns } from './droneColumns'
export type PaginationTableInstance<T extends object> = TableInstance<T> &
  UsePaginationInstanceProps<T> & {
    state: UsePaginationState<T>
  }

export const DroneTableOverview = ({
  data,
  totalNumber,
}: {
  data: DroneSerializer[]
  totalNumber: number
}) => {
  const router = useRouter()
  const { pagesize: queryPageSize } = router.query
  const queryClient = useQueryClient()
  const [ref, size] = useElementSize()

  const updateDrones = useMutation(patchDrones, {
    onSettled: async () => {
      await queryClient.invalidateQueries([ALL_DRONES_KEY])
    },
    onSuccess: async () => {
      toast('Data changed.', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      methods.reset()

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo<Column<DroneSerializer>[]>(() => droneColumns(), [data])

  const onSubmit = methods.handleSubmit((formData) => {
    const changedKeys = Object.keys(formData).filter((item) => formData[item] !== '')
    const changedIds = changedKeys.map((key) => key.split('-')[1])
    const changedDrones = data.filter((drone) => {
      return changedIds.includes(drone.id.toString())
    })

    const newDrones: DroneUpdate[] = changedDrones.map((drone) => {
      const keysBelongingToDrones = changedKeys.filter((key) => {
        const droneid = key.split('-')[1]
        return drone.id.toString() === droneid
      })

      const changedProps = keysBelongingToDrones
        .map((key) => {
          return {
            [key.split('-')[0]]:
              formData[key] === 'delete'
                ? ''
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
      const { id } = drone
      const newDrone = { ...changedProps, id }
      return newDrone
    })

    if (!newDrones.length) {
      toast(
        'No new data inserted. Non-nullable fields will not change if empty string was inserted.',
        { type: 'error', position: toast.POSITION.BOTTOM_CENTER },
      )
    } else {
      updateDrones.mutate(newDrones)
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
  ) as PaginationTableInstance<DroneSerializer>

  return (
    <TableFrame<DroneSerializer>
      pageCount={pageCount}
      pageSize={pageSize}
      totalNumber={totalNumber}
      pageOptions={pageOptions}
      pageIndex={pageIndex}
      tableType={'drone'}
      drawerExtensionType={DrawerExtensionTypes.DRONE_DRAWER_EXTENDED}
      groupByOptions={[
        { name: 'None', value: '' },
        { name: 'Status', value: 'status' },
      ]}
      allColumns={allColumns}
      setColumnOrder={setColumnOrder}
      setGlobalFilter={setGlobalFilter}
      globalFilter={globalFilter}
      setGroupBy={setGroupBy}
      width={size.width}
    >
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <div className="overflow-x-scroll">
            <table {...getTableProps()} className={`rounded-xl`} ref={ref}>
              <TableHead
                headerGroups={headerGroups}
                allColumns={allColumns}
                setColumnOrder={setColumnOrder}
              ></TableHead>
              <TableBody<DroneSerializer>
                hasNoSelection
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
          {!groupBy.length || groupBy?.[0] === '' ? (
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
