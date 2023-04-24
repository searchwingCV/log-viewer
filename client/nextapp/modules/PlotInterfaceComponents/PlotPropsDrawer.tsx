/* 
  The following Component is currently not used
 */
import { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Disclosure, Combobox } from '@headlessui/react'
import { animated, useSpring } from '@react-spring/web'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import CircleIconButton from '~/modules/CircleIconButton'

type Props = {}

const DRAWER_EXTENDED = 'drawer-extended'

const mockLogProps = [
  {
    name: 'XKF1[0]',
    id: 'xkf10',
    items: [
      { name: 'VE', id: 've-xkf10' },
      { name: 'VN', id: 'vn-xkf10' },
    ],
  },

  {
    name: 'BAT',
    id: 'bat',
    items: [
      { name: 'Curr (A)', id: 'curr-bat' },
      { name: 'Temp (°C)', id: 'temp-bat' },
    ],
  },
  {
    name: 'BARO',
    id: 'baro',
    items: [
      { name: 'I (instance)', id: 'i-baro' },
      { name: 'Gnd Temp (°C)', id: 'gnd-temp-baro' },
    ],
  },
]

export const PlotPropsDrawer = ({}: Props) => {
  const { data: isExtended } = useQuery([DRAWER_EXTENDED], () => {
    return true
  })

  const groups = mockLogProps.map((prop) => ({
    name: prop.name,
    id: prop.id,
    items: prop.items.map((item) => ({
      label: item.name,
      name: `${prop.name} ${item.id}`,
      id: item.id,
      groupName: prop.name,
    })),
  }))

  const filterableLogProps = useMemo(() => {
    return mockLogProps
      .map((propGroup) => {
        const { items, name, id } = propGroup

        const comboBoxItems = items.map((prop) => ({
          label: prop.name,
          name: `${prop.name} ${prop.id}`,
          id: prop.id,
          groupName: name,
        }))

        return comboBoxItems
      })
      .flat()
  }, [])

  const [selectedProps, setSelectedProps] = useState(filterableLogProps[0].name)
  const [query, setQuery] = useState('')
  const queryClient = useQueryClient()

  const filteredLogProps =
    query === ''
      ? filterableLogProps
      : filterableLogProps.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase())
        })

  const handleToggleSideNav = () => {
    queryClient.setQueryData<boolean>([DRAWER_EXTENDED], (prev) => {
      return !prev
    })
  }

  console.log('dlll', filterableLogProps, groups)

  return (
    <div
      className={clsx(
        `fixed
                    top-0
                    bottom-0
                    z-10
                    h-full
                    w-side-drawer`,

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
                            px-2`}
              >
                <input
                  onChange={(event) => setQuery(event.target.value)}
                  displayValue={(prop: {
                    name: string
                    id: string
                    items: {
                      name: string
                      id: string
                    }[]
                  }) => prop.name}
                />

                {groups
                  .filter(
                    (group) =>
                      group.items.filter((item) =>
                        item.name.toLowerCase().includes(query.toLowerCase()),
                      ).length > 1,
                  )
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

                          {/* <Combobox.Options>
                                      {filteredLogProps.map((prop) => (
                                        <Combobox.Option key={prop.id} value={prop.name}>
                                          <Combobox.Option
                                            key={prop.id}
                                            value={prop.name}
                                            className="text-white"
                                          >
                                            {`${prop.groupName}  - ${prop.label}`}
                                          </Combobox.Option>
                                        </Combobox.Option>
                                      ))}
                                    </Combobox.Options> */}
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
