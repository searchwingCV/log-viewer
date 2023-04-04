/* 
  The following Component is currently not used
 */
import { animated, useSpring } from '@react-spring/web'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { DRAWER_EXTENDED } from 'lib/reactquery/keys'
import CircleIconButton from '~/modules/CircleIconButton'
import { NavItem } from './components/NavItem'

type Props = {}

const navItemsPlaceholder = [
  { name: 'Speed', href: '/speed', iconName: 'eye' },
  { name: 'Data', href: '/data', iconName: 'file' },
  { name: 'Results', href: '/results', iconName: 'calendar' },
  { name: 'Pilots', href: '/pilots', iconName: 'user' },
  { name: 'Test', href: '/test', iconName: 'sticky-note' },
  { name: 'Potato', href: '/potato', iconName: 'stop-circle' },
  { name: 'Candle', href: '/candle', iconName: 'sun' },
  { name: 'Another Test Long', href: '/another-test', iconName: 'keyboard' },
  { name: 'Computer', href: '/computer', iconName: 'eye' },
  { name: 'Images', href: '/images', iconName: 'file' },
  { name: 'Something', href: '/something', iconName: 'calendar' },
]

export const SideNavigation = ({}: Props) => {
  const { data: isExtended } = useQuery([DRAWER_EXTENDED], () => {
    return false
  })

  const queryClient = useQueryClient()

  const handleToggleSideNav = () => {
    queryClient.setQueryData<boolean>([DRAWER_EXTENDED], (prev) => {
      return !prev
    })
  }

  const slideX = useSpring({
    transform: isExtended ? 'translate3d(0px,0,0)' : `translate3d(-200px,0,0)`,
  })

  const [{ x, y }, set] = useSpring(() => ({
    x: 0,
    y: 0,
  }))

  return (
    <animated.div
      className={`fixed
                  top-0
                  bottom-0
                  z-10
                  h-full
                  w-side-drawer`}
      style={slideX}
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
        <nav className="pt-40">
          <div
            className={`relative
                        overflow-hidden`}
            onMouseMove={({ clientX: x, clientY: y }) => {
              set({ x, y: Math.floor((y - 160) / 57) * 57 })
            }}
          >
            <animated.div
              style={{ y: y }}
              className={`absolute
                          top-0
                          z-20
                          ml-2
                          h-[57px]
                          w-[180px]
                          rounded-xl
                          bg-primary-white
                          opacity-20`}
            ></animated.div>
            <ul
              className={`relative
                          z-30
                          px-2`}
            >
              {navItemsPlaceholder.map((item) => (
                <NavItem
                  name={item.name}
                  iconName={item.iconName}
                  href={item.href}
                  key={item.name}
                  isExtended={isExtended}
                />
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </animated.div>
  )
}
