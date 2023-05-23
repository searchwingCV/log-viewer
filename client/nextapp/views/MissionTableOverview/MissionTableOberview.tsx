//TODO: Refactor code of FlightTableOverview, MissionTableOverview & DroneTableOverview to avoid duplicate code
import 'regenerator-runtime/runtime'
import useElementSize from '@charlietango/use-element-size'
import React, { useMemo } from 'react'
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
import type { MissionSerializer, MissionUpdate } from '@schema'
import { patchMissions } from '~/api/mission/patchMissions'
import { ALL_MISSIONS_KEY } from '~/api/mission/getMissions'
import {
  ColumnFilter,
  TableBody,
  TableHead,
  DrawerExtensionTypes,
  TableFrame,
} from '~/modules/TableComponents'
import { missionColumns } from './missionColumns'

export type PaginationTableInstance<T extends object> = TableInstance<T> &
  UsePaginationInstanceProps<T> & {
    state: UsePaginationState<T>
  }

export const MissionTableOverview = ({
  data,
  totalNumber,
}: {
  data: MissionSerializer[]
  totalNumber: number
}) => {
  const [ref, size] = useElementSize()
  const router = useRouter()
  const { pagesize: queryPageSize } = router.query
  const queryClient = useQueryClient()

  const updateMissions = useMutation(patchMissions, {
    onSuccess: async () => {
      toast('Data changed.', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      methods.reset()

      await queryClient.invalidateQueries([ALL_MISSIONS_KEY])

      await queryClient.invalidateQueries([ALL_MISSIONS_KEY, pageCount, pageSize])
    },
    onError: async (error) => {
      toast(`Error submitting data.${error}`, {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      //TODO find out why error message disappears immediately without a timeout
      await new Promise((resolve) => setTimeout(resolve, 100))

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo<Column<MissionSerializer>[]>(() => missionColumns(), [data])

  const onSubmit = methods.handleSubmit((formData) => {
    const changedKeys = Object.keys(formData).filter((item) => formData[item] !== '')
    const changedIds = changedKeys.map((key) => key.split('-')[1])
    const changedMissions = data.filter((mission) => {
      return changedIds.includes(mission.id.toString())
    })

    const newMissions: MissionUpdate[] = changedMissions.map((mission) => {
      const keysBelongingToMission = changedKeys.filter((key) => {
        const missionid = key.split('-')[1]
        return mission.id.toString() === missionid
      })
      const changedProps = keysBelongingToMission
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

      const { id } = mission
      const newMission = { ...changedProps, id }

      return newMission
    })

    if (!newMissions.length) {
      toast(
        'No new data inserted. Non-nullable fields will not change if empty string was inserted.',
        { type: 'error', position: toast.POSITION.BOTTOM_CENTER },
      )
    } else {
      updateMissions.mutate(newMissions)
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
  ) as PaginationTableInstance<MissionSerializer>

  return (
    <TableFrame<MissionSerializer>
      pageCount={pageCount}
      pageSize={pageSize}
      totalNumber={totalNumber}
      pageOptions={pageOptions}
      pageIndex={pageIndex}
      tableType={'mission'}
      drawerExtensionType={DrawerExtensionTypes.MISSION_DRAWER_EXTENDED}
      groupByOptions={[
        { name: 'None', value: '' },
        { name: 'Partner Organization', value: 'partnerOrganization' },
        { name: 'Mission Id', value: 'id' },
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
              <TableBody<MissionSerializer>
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
