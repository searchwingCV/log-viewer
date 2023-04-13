//TODO: Refactor code of FlightTableOverview, MissionTableOverview & DroneTableOverview to avoid duplicate code
import 'regenerator-runtime/runtime'
import React, { useMemo } from 'react'
import useElementSize from '@charlietango/use-element-size'
import useMedia from '@charlietango/use-media'
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
import { DroneSerializer, DroneUpdate } from '@schema'
import { patchDrones } from '~/api/drone/patchDrones'

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
import { droneColumns } from './droneColumns'
import { ALL_DRONES_KEY } from '~/api/drone/getDrones'
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
  const matches = useMedia({ minWidth: 1920 })

  const router = useRouter()
  const { pagesize: queryPageSize } = router.query
  const queryClient = useQueryClient()
  const [ref, size] = useElementSize()

  const { data: sideNavExtended } = useQuery([DrawerExtensionTypes.DRONE_DRAWER_EXTENDED])

  const slideX = useSpring({
    transform: sideNavExtended ? 'translate3d(20px,0,0)' : `translate3d(-240px,0,0)`,
    minWidth: sideNavExtended ? 'calc(100vw - 270px)' : `calc(100vw - 0px)`,
  })
  const updateDrones = useMutation(patchDrones, {
    onSettled: (data) => {
      queryClient.invalidateQueries([ALL_DRONES_KEY])
    },
    onSuccess: (data) => {
      toast('Data changed.', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      methods.reset()

      queryClient.invalidateQueries([ALL_DRONES_KEY])
    },
    onError: (data) => {
      toast('Error submitting data.', {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
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
  const columns = useMemo<Column<DroneSerializer>[]>(() => droneColumns(), [data])

  const onSubmit = methods.handleSubmit(async (formData) => {
    const changedKeys = Object.keys(formData).filter((item) => formData[item] !== '')
    const changedIds = changedKeys.map((key) => key.split('-')[1])
    const changedDrones = data.filter((drone) => {
      return changedIds.includes(drone.id.toString())
    })

    const newDrones: DroneUpdate[] = changedDrones.map((drone) => {
      const keysBelongingToDrones = changedKeys.filter((key) => key.includes(drone.id.toString()))
      const changedProps = keysBelongingToDrones
        .map((key) => {
          return { [key.split('-')[0]]: formData[key] === 'delete' ? undefined : formData[key] }
        })
        .reduce((prev, cur) => {
          return { ...prev, ...cur }
        })

      const { id } = drone
      const newDrone = { ...changedProps, id }

      return newDrone
    })

    if (!newDrones.length) {
      toast('No new data inserted', { type: 'error', position: toast.POSITION.BOTTOM_CENTER })
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
  ) as PaginationTableInstance<DroneSerializer>

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
                  min-h-screen
                 `}
    >
      <ToastContainer />
      <CustomizeColumnsDrawer
        allColumns={allColumns}
        setColumnOrder={setColumnOrder}
        drawerKey={DrawerExtensionTypes.DRONE_DRAWER_EXTENDED}
      />

      <animated.div
        className={clsx(` ml-side-drawer-width
                          flex
                          h-screen
                          flex-col
                          items-center
                          overflow-x-hidden
                          px-12
                          `)}
        style={slideX}
      >
        <div
          style={{
            maxWidth: matches ? size.width + 40 : '100%',
          }}
          className={`relative
                      mb-40
                      pl-2
                      pr-8
                      pt-20
                      pb-12
                      `}
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
                { name: 'Partner Organizat+ion', value: 'partnerOrganization' },
              ]}
              onSetValue={setGroupBy}
              defaultValue="None"
              hasResetButton={true}
              resetButtonText={'Reset Group'}
            />
          </div>
          <div className="flex">
            <ToggleCustomizeOrder drawerKey={DrawerExtensionTypes.DRONE_DRAWER_EXTENDED} />
            <div className="py-8 px-4">
              <Button
                isSpecial={true}
                buttonStyle="Main"
                className="w-[200px] px-6 py-4"
                onClick={async () => {
                  await router.push('/add/drone')
                }}
              >
                Add new drone +
              </Button>
            </div>
          </div>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              <div className="overflow-x-scroll">
                <table {...getTableProps()} className={`roundex-xl`} ref={ref}>
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
