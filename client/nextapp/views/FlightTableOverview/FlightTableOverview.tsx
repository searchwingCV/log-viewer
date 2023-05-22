//TODO: Refactor code of FlightTableOverview, MissionTableOverview & DroneTableOverview to avoid duplicate code
import 'regenerator-runtime/runtime'
import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { ToastContainer, toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import { animated, useSpring } from '@react-spring/web'

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
import { ALl_FLIGHTS_KEY } from '~/api/flight/getFlights'
import { FlightSerializer, FlightUpdate } from '@schema'
import { patchFlights } from '~/api/flight/patchFlights'

import {
  GlobalTextFilter,
  Pagination,
  SelectCheckbox,
  ColumnFilter,
  TableBody,
  TableHead,
  CustomizeColumnsDrawer,
  ToggleCustomizeOrder,
  DrawerExtensionTypes,
} from '~/modules/TableComponents'

import { flightColumns } from './flightColumns'

export type PaginationTableInstance<T extends object> = TableInstance<T> &
  UsePaginationInstanceProps<T> & {
    state: UsePaginationState<T>
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

  const { data: sideNavExtended } = useQuery([DrawerExtensionTypes.FLIGHT_DRAWER_EXTENDED], () => {
    return false
  })

  const slideX = useSpring({
    transform: sideNavExtended ? 'translate3d(20px,0,0)' : `translate3d(-240px,0,0)`,
    minWidth: sideNavExtended ? 'calc(100vw - 270px)' : `calc(100vw - 0px)`,
  })
  const { pagesize: queryPageSize } = router.query

  const updateFlights = useMutation(patchFlights, {
    onSettled: () => {},
    onSuccess: (data) => {
      toast('Data changed.', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      methods.reset()

      queryClient.invalidateQueries([ALl_FLIGHTS_KEY])
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
  const columns = useMemo<Column<FlightSerializer>[]>(
    () => flightColumns(missionOptions, droneOptions),
    [missionOptions, droneOptions, data],
  )

  const onSubmit = methods.handleSubmit(async (formData) => {
    const changedKeys = Object.keys(formData).filter((item) => formData[item] !== '')
    const changedIds = changedKeys.map((key) => key.split('-')[1])
    const changedFlights = data.filter((flight) => {
      return changedIds.includes(flight.id.toString())
    })

    const newFlights: FlightUpdate[] = changedFlights.map((flight) => {
      const keysBelongingToFlight = changedKeys.filter((key) => key.includes(flight.id.toString()))
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
      toast('No new data inserted', { type: 'error', position: toast.POSITION.BOTTOM_CENTER })
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
    preGlobalFilteredRows,
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
  ) as PaginationTableInstance<FlightSerializer>

  const scrollInputIntoView = (id: string) => {
    var element = document.getElementById(id)

    if (element) {
      element.scrollIntoView()
    }
  }

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
        drawerKey={DrawerExtensionTypes.FLIGHT_DRAWER_EXTENDED}
      />
      <animated.div
        className={clsx(`ml-side-drawer-width
                         h-screen
                         overflow-x-hidden
                         px-12`)}
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
            className={`mb-4
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
                { name: 'Pilot', value: 'pilot' },
                { name: 'Mission Id', value: 'fkMission' },
                { name: 'Drone Id', value: 'fkDrone' },
              ]}
              onSetValue={setGroupBy}
              defaultValue="None"
              hasResetButton={true}
              resetButtonText={'Reset Group'}
            />
          </div>
          <div className="flex">
            <div
              className={`pr-4
                          pt-4`}
            >
              <Button
                isSpecial={true}
                buttonStyle="Main"
                className={`w-[200px]
                            px-6
                            py-3`}
                onClick={async () => {
                  await router.push(
                    `/add/flight?curentPageSize=${pageSize}&currentPageCount=${pageCount}&totalNumber=${totalNumber}`,
                  )
                }}
              >
                <FontAwesomeIcon icon={'plus-circle'} height="32" className="scale-150" />
                <span className="ml-3">Add new flight</span>
              </Button>
            </div>
            <ToggleCustomizeOrder drawerKey={DrawerExtensionTypes.FLIGHT_DRAWER_EXTENDED} />
          </div>
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
                  <TableBody<FlightSerializer>
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
                  onClick={() => {
                    goToDetailView()
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
