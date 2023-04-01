import { animated, useSpring } from '@react-spring/web'
import { useQueryClient, useQuery } from 'react-query'
import { DRAWER_EXTENDED } from 'lib/reactquery/keys'
import CircleIconButton from '~/modules/CircleIconButton'

type Props = {
  children: React.ReactNode
}

export const SideDrawer = ({ children }: Props) => {
  const { data: isExtended } = useQuery(DRAWER_EXTENDED, () => {
    return false
  })
  const queryClient = useQueryClient()

  const closeDrawer = () => {
    queryClient.setQueryData<boolean>(DRAWER_EXTENDED, () => {
      return false
    })
  }

  const slideX = useSpring({
    transform: isExtended ? 'translate3d(0px,0,0)' : `translate3d(-280px,0,0)`,
  })

  return (
    <animated.div
      className={`w-side-drawer
                  fixed
                  top-0
                  bottom-0
                  z-10
                  h-full
                  `}
      style={slideX}
    >
      {isExtended ? (
        <CircleIconButton
          addClasses={`fixed
                     top-[50px]
                     -right-6
                     z-30`}
          iconClassName={isExtended ? 'chevron-left' : 'chevron-right'}
          onClick={() => {
            closeDrawer()
          }}
        />
      ) : null}
      <div
        className={`h-screen
                    overflow-y-scroll`}
      >
        <div className={`relative`}>{children}</div>
      </div>
    </animated.div>
  )
}
