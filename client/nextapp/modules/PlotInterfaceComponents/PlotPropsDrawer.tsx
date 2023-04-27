/* 
  The following Component is currently not used
 */
import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Disclosure } from '@headlessui/react'
import { ToastContainer, toast } from 'react-toastify'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import { logFileTimeSeriesTable } from '@idbSchema'
import CircleIconButton from '~/modules/CircleIconButton'
import { getLogPropertyTimeSeriesMock } from '~/api/flight/getLogTimeSeries'

type Props = {
  groupedProperties: {
    name: string
    id: string
    timeSeriesProperties: { name: string; id: string }[]
  }[]
}

const DRAWER_EXTENDED = 'drawer-extended'

export const PlotPropsDrawer = ({ groupedProperties }: Props) => {
  const router = useRouter()

  const fetchTimeSeriesOnClick = useMutation(getLogPropertyTimeSeriesMock, {
    onSuccess: async (data) => {
      //await logFileTimeSeriesTable.add(data)
      console.log('success', data)
    },
    onError: async (data) => {
      toast('error fetching timeseries data' as string, {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
      })
      //TODO find out why error message disappears immediately without a timeout
      await new Promise((resolve) => setTimeout(resolve, 100))
    },
  })

  const { id: flightid } = router.query

  const { data: isExtended } = useQuery([DRAWER_EXTENDED], () => {
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
    queryClient.setQueryData<boolean>([DRAWER_EXTENDED], (prev) => {
      return !prev
    })
  }
  const fetchClickedProperty = async (timeseriesId: string, group: string) => {
    fetchTimeSeriesOnClick.mutate({
      key: timeseriesId,
      group,
      flightid: parseInt(flightid as string),
    })
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

        isExtended ? 'translate-x-0 translate-y-0' : 'translate-x-[-200px]',
      )}
    >
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
                  className="mt-8 w-full rounded-sm p-1"
                  onChange={(event) => setQuery(event.target.value)}
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
                          <Disclosure.Button className="my-1 flex w-full justify-between rounded-xl px-4 py-2 text-left text-sm text-white">
                            {group.name}
                            {disclosureOpen ? (
                              <FontAwesomeIcon icon={'chevron-up'}></FontAwesomeIcon>
                            ) : (
                              <FontAwesomeIcon icon={'chevron-down'}></FontAwesomeIcon>
                            )}
                          </Disclosure.Button>

                          {group.items.map((item) => (
                            <Disclosure.Panel className="pl-4 text-gray-500">
                              <button onClick={() => fetchClickedProperty(item.id, item.groupId)}>
                                {item.label}
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
