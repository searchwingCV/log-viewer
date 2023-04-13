//TODO: Refactor code of FlightTableOverview, MissionTableOverview & DroneTableOverview to avoid duplicate code
import 'regenerator-runtime/runtime'
import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { ToastContainer, toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import { animated, useSpring } from '@react-spring/web'

import {
  useTable,
  Column,
  usePagination,
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
import { MissionSerializer, MissionUpdate } from '@schema'
import { patchMissions } from '~/api/mission/patchMissions'
import { ALL_MISSIONS_KEY } from '~/api/mission/getMissions'

import {
  GlobalTextFilter,
  Pagination,
  ColumnFilter,
  TableBody,
  TableHead,
  CustomizeColumnsDrawer,
  ToggleCustomizeOrder,
  DrawerExtensionTypes,
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
  const router = useRouter()
  const { pagesize: queryPageSize } = router.query
  const queryClient = useQueryClient()

  const { data: sideNavExtended } = useQuery([DrawerExtensionTypes.MISSION_DRAWER_EXTENDED])

  const slideX = useSpring({
    transform: sideNavExtended ? 'translate3d(20px,0,0)' : `translate3d(-240px,0,0)`,
    minWidth: sideNavExtended ? 'calc(100vw - 270px)' : `calc(100vw - 0px)`,
  })
  const updateMissions = useMutation(patchMissions, {
    onSettled: (data) => {},
    onSuccess: (data) => {
      toast('Data changed.', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      methods.reset()

      queryClient.invalidateQueries([ALL_MISSIONS_KEY])
    },
    onError: async (data) => {
      toast('Error submitting data.', {
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
  const columns = useMemo<Column<MissionSerializer>[]>(() => missionColumns(), [data])

  const onSubmit = methods.handleSubmit(async (formData) => {
    const changedKeys = Object.keys(formData).filter((item) => formData[item] !== '')
    const changedIds = changedKeys.map((key) => key.split('-')[1])
    const changedMissions = data.filter((mission) => {
      return changedIds.includes(mission.id.toString())
    })

    const newMissions: MissionUpdate[] = changedMissions.map((mission) => {
      const keysBelongingToMission = changedKeys.filter((key) =>
        key.includes(mission.id.toString()),
      )
      const changedProps = keysBelongingToMission
        .map((key) => {
          return { [key.split('-')[0]]: formData[key] === 'delete' ? undefined : formData[key] }
        })
        .reduce((prev, cur) => {
          return { ...prev, ...cur }
        })

      const { id } = mission
      const newMission = { ...changedProps, id }

      return newMission
    })

    if (!newMissions.length) {
      toast('No new data inserted', { type: 'error', position: toast.POSITION.BOTTOM_CENTER })
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
    preGlobalFilteredRows,
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

  const scrollInputIntoView = (id: string) => {
    var element = document.getElementById(id)

    if (element) {
      element.scrollIntoView()
    }
  }

  return (
    <div
      className={`flex-column
                  flex
                  min-h-screen`}
    >
      <ToastContainer />
      <CustomizeColumnsDrawer
        allColumns={allColumns}
        setColumnOrder={setColumnOrder}
        drawerKey={DrawerExtensionTypes.MISSION_DRAWER_EXTENDED}
      />
      <animated.div
        className={clsx(` ml-side-drawer-width
                          h-screen
                          overflow-x-hidden
                          `)}
        style={slideX}
      >
        <div
          className={`relative
                      mb-40
                      pl-2
                      pr-8
                      pt-20
                      pb-12`}
        >
          <div
            className={`mb-8
                        grid
                        grid-cols-[minmax(700px,_1fr)_200px]
                        grid-rows-2
                        items-end
                        gap-y-2
                        gap-x-8`}
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
                { name: 'Partner Organization', value: 'partnerOrganization' },
              ]}
              onSetValue={setGroupBy}
              defaultValue="None"
              hasResetButton={true}
              resetButtonText={'Reset Group'}
            />
          </div>
          <ToggleCustomizeOrder drawerKey={DrawerExtensionTypes.MISSION_DRAWER_EXTENDED} />
          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              <div className="overflow-x-scroll">
                <table {...getTableProps()} className={`roundex-xl`}>
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
            pageSize={pageSize}
            pageCount={pageCount}
            pageIndex={pageIndex}
            pageOptions={pageOptions}
            totalNumber={totalNumber}
          />
        </div>
      </animated.div>
    </div>
  )
}
