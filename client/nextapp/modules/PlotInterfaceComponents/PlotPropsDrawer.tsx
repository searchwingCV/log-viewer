import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Disclosure } from '@headlessui/react'
import { ToastContainer, toast } from 'react-toastify'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import database, { logFileTimeSeriesTable, DexieLogFileTimeSeries } from '@idbSchema'
import CircleIconButton from '~/modules/CircleIconButton'
import { getLogPropertyTimeSeriesMock } from '~/api/flight/getLogTimeSeries'

type Props = {
  groupedProperties: {
    name: string
    id: string
    timeSeriesProperties: { name: string; id: string }[]
  }[]
}

export const PLOT_DRAWER_EXTENDED = 'PLOT_DRAWER_EXTENDED'

export const PlotPropsDrawer = ({ groupedProperties }: Props) => {
  const router = useRouter()
  const { id: flightid } = router.query

  const activeTimeSeries = useLiveQuery(() =>
    // TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.logFileTimeSeries
      .filter((series: DexieLogFileTimeSeries) => series.flightId === (flightid as string))
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
      label: item.name,
      name: `${prop.name} ${item.id} ${item.name}`,
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
      <ToastContainer />
      <div
        className={`relative
                    h-full
                    bg-y-indigo-to-petrol `}
      >
        <CircleIconButton
          addClasses={`fixed
                       top-[100px]
                       -right-6
                       z-30`}
          iconClassName={isExtended ? 'chevron-left' : 'chevron-right'}
          onClick={() => {
            handleToggleSideNav()
          }}
        />

        {isExtended ? (
          <nav className="pt-40">
            <div
              className={`relative
                          overflow-hidden`}
            >
              <ul
                className={`relative
                            z-30
                            px-4`}
              >
                <input
                  className={`mt-8
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
                    <Disclosure>
                      {({ open: disclosureOpen }) => (
                        <>
                          <Disclosure.Button
                            className={`my-1
                                        flex
                                        w-full
                                        justify-between
                                        rounded-md
                                        bg-white
                                        bg-opacity-[10%]
                                        px-4
                                        py-2
                                        text-left
                                        text-sm
                                        text-white`}
                          >
                            {group.name}
                            {disclosureOpen ? (
                              <FontAwesomeIcon icon={'chevron-up'}></FontAwesomeIcon>
                            ) : (
                              <FontAwesomeIcon icon={'chevron-down'}></FontAwesomeIcon>
                            )}
                          </Disclosure.Button>

                          {group.items.map((item) => (
                            <Disclosure.Panel
                              className={`flex
                                          w-full
                                          justify-between
                                          pl-4`}
                            >
                              <button
                                className={clsx(
                                  `
                                  py-2
                                  text-left
                                  text-sm`,

                                  isActive(item.id)
                                    ? `pointer-events-none
                                       w-full
                                       text-grey-light
                                       underline
                                       underline-offset-4`
                                    : 'text-grey-light',
                                )}
                                onClick={() => fetchClickedProperty(item.id, item.groupId)}
                              >
                                <span>{item.label}</span>
                              </button>
                              <button onClick={() => clearProperty(item.id)}>
                                {isActive(item.id) ? (
                                  <span
                                    className={`pr-4
                                              text-grey-light`}
                                  >
                                    <FontAwesomeIcon icon={'trash-can'}></FontAwesomeIcon>
                                  </span>
                                ) : null}
                              </button>
                            </Disclosure.Panel>
                          ))}
                        </>
                      )}
                    </Disclosure>
                  ))}
              </ul>
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  )
}
