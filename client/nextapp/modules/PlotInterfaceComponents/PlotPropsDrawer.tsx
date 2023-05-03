import { useState } from 'react'
import Dexie from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ToastContainer, toast } from 'react-toastify'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import { GroupedProps } from '@schema'
import database, { logFileTimeSeriesTable, DexieLogFileTimeSeries } from '@idbSchema'
import CircleIconButton from '~/modules/CircleIconButton'
import { getLogPropertyTimeSeriesMock } from '~/api/flight/getLogTimeSeries'
import { Disclosure, DisclosurePanel } from './Disclosure'
import { PlotInput } from './PlotInput'
import Button from '../Button'

type Props = {
  groupedProperties: GroupedProps[]
}

export const PLOT_DRAWER_EXTENDED = 'PLOT_DRAWER_EXTENDED'

export const CurrentPlotSetup = ({
  activeTimeSeries,
}: {
  activeTimeSeries: DexieLogFileTimeSeries[]
}) => {
  const clearProperty = (timeseriesId: string) => {
    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.logFileTimeSeries.delete(timeseriesId)
  }

  const clearAllPlots = () => {
    //TODO: solve dexie ts error
    database.table('logFileTimeSeries').clear()
  }

  console.log(activeTimeSeries)

  return (
    <div
      className={`
                   px-4
                   pt-8
                   text-white`}
    >
      <Disclosure buttonContent={'Current Plot Setup'} isSpecialButton>
        <DisclosurePanel className="mb-8 pl-4">
          <div className="ml-2 mt-6 w-full">
            {!activeTimeSeries.length ? <div className="flex w-full">No Plots</div> : null}
            {activeTimeSeries?.map((currentChosenTimeSeries) => (
              <div className={`flex w-full justify-between`}>
                <PlotInput
                  initialValue={`${currentChosenTimeSeries.group}.${currentChosenTimeSeries.propName}`}
                />
                <button onClick={() => clearProperty(currentChosenTimeSeries.id)}>
                  <span
                    className={`
                              pr-4
                              text-primary-white
                              `}
                  >
                    <FontAwesomeIcon icon={'trash-can'}></FontAwesomeIcon>
                  </span>
                </button>
              </div>
            ))}

            <div className="-ml-3 mt-4 mr-4 grid grid-cols-2 gap-4">
              <Button
                buttonStyle="Tertiary"
                className={`bg-text-primary-rose flex w-full justify-center py-1 px-1`}
                onClick={clearAllPlots}
                disabled={!!!activeTimeSeries.length}
              >
                <div className="mr-1 text-primary-red">
                  <FontAwesomeIcon icon={'circle-xmark'}></FontAwesomeIcon>
                </div>
                Clear All
              </Button>
              <Button
                buttonStyle="Tertiary"
                className={`bg-text-primary-rose flex w-full justify-center py-1 px-1`}
              >
                <div className="mr-1 text-primary-green">
                  <FontAwesomeIcon icon={'plus-circle'}></FontAwesomeIcon>
                </div>{' '}
                Add Plot
              </Button>
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>
  )
}

export const PlotPropsDrawer = ({ groupedProperties }: Props) => {
  const router = useRouter()
  const { id: flightid } = router.query

  const activeTimeSeries = useLiveQuery(() =>
    // TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.logFileTimeSeries
      .filter((series: DexieLogFileTimeSeries) => series.flightId === (flightid as string))
      .reverse()
      .toArray(),
  )

  const fetchTimeSeriesOnClick = useMutation(getLogPropertyTimeSeriesMock, {
    onSuccess: async (data) => {
      const { id, ...rest } = data
      const dataForIDB = { ...rest, id: `${flightid}-${id}`, propId: id, flightId: flightid }
      await logFileTimeSeriesTable.add(dataForIDB)
    },
    onError: async (data) => {
      toast('error fetching timeseries data' as string, {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      // TODO find out why error message disappears immediately without a timeout
      await new Promise((resolve) => setTimeout(resolve, 100))
    },
  })

  const { data: isExtended } = useQuery([PLOT_DRAWER_EXTENDED], () => {
    return true
  })

  const groups = groupedProperties.map((prop) => ({
    name: prop.name,
    id: prop.id,
    items: prop.timeSeriesProperties.map((item) => ({
      label: `${item.propName} (${item.unit})`,
      name: `${prop.name} ${item.id} ${item.propName}`,
      id: item.id,
      groupName: prop.name,
      groupId: prop.id,
    })),
  }))

  const [query, setQuery] = useState('')
  const queryClient = useQueryClient()

  const handleToggleSideNav = () => {
    queryClient.setQueryData<boolean>([PLOT_DRAWER_EXTENDED], (prev) => {
      return !prev
    })
  }
  const fetchClickedProperty = (timeseriesId: string, group: string) => {
    fetchTimeSeriesOnClick.mutate({
      key: timeseriesId,
      group,
      flightid: parseInt(flightid as string),
    })
  }

  const clearProperty = (timeseriesId: string) => {
    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.logFileTimeSeries.delete(`${flightid}-${timeseriesId}`)
  }

  const isActive = (id: string) => {
    return activeTimeSeries?.map((item: DexieLogFileTimeSeries) => item.propId).includes(id)
  }

  return (
    <div
      className={clsx(
        `fixed
         top-0
         bottom-0
         z-10
         h-full
         w-side-drawer
         `,

        isExtended
          ? `translate-x-0
             translate-y-0`
          : 'translate-x-[-200px]',
      )}
    >
      <>
        <ToastContainer />
        <div
          className={`relative
                    h-full
                    bg-y-indigo-to-petrol `}
        >
          <CircleIconButton
            addClasses={`fixed
                       top-[100px]
                       -right-9
                       z-30`}
            iconClassName={isExtended ? 'chevron-left' : 'chevron-right'}
            onClick={() => {
              handleToggleSideNav()
            }}
          />

          {isExtended ? (
            <>
              <CurrentPlotSetup activeTimeSeries={activeTimeSeries} />
              <div className="px-4">
                <Disclosure buttonContent={'Plot individual fields'} isSpecialButton>
                  <DisclosurePanel>
                    <div
                      className={`relative
                        w-full
                        overflow-hidden
                        px-2`}
                    >
                      <ul
                        className={`relative
                          z-30
                         `}
                      >
                        <input
                          className={`mt-6
                            mb-4
                            w-full
                            rounded-md
                            py-2
                            pl-4
                            text-xs`}
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder="Search for individual property..."
                        />

                        {groups
                          .filter((group) => {
                            return (
                              group.items.filter((item) =>
                                item.name.toLowerCase().includes(query.toLowerCase()),
                              ).length > 0
                            )
                          })
                          .map((group) => (
                            <Disclosure buttonContent={group.name}>
                              <>
                                {group.items.map((item) => (
                                  <DisclosurePanel>
                                    <button
                                      className={clsx(
                                        `
                                    py-2
                                    pl-4
                                    text-left
                                    text-xs`,
                                        isActive(item.id)
                                          ? `pointer-events-none
                                    w-full
                                    text-grey-light
                                    `
                                          : 'text-grey-light',
                                      )}
                                      onClick={() => fetchClickedProperty(item.id, item.groupId)}
                                    >
                                      <span>{item.label}</span>
                                    </button>
                                    <button onClick={() => clearProperty(item.id)}>
                                      {isActive(item.id) ? (
                                        <span
                                          className={`pr-4 text-white
                                     `}
                                        >
                                          <FontAwesomeIcon icon={'trash-can'}></FontAwesomeIcon>
                                        </span>
                                      ) : null}
                                    </button>
                                  </DisclosurePanel>
                                ))}
                              </>
                            </Disclosure>
                          ))}
                      </ul>
                    </div>
                  </DisclosurePanel>
                </Disclosure>
              </div>
            </>
          ) : null}
        </div>
      </>
    </div>
  )
}
