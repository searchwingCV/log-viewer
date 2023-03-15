import { useState } from 'react'
import NextLink from 'next/link'
import { animated, useSpring } from '@react-spring/web'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'

export type Props = {
  name: string
  iconName: string
  isActive?: boolean
  href: string
  isExtended?: boolean
}

export const NavItem = ({ name, iconName, isActive, href, isExtended }: Props) => {
  const [isHovered, setIsHovered] = useState(false)

  const growShrink = useSpring({
    transform: isHovered ? 'scale(1.2)' : 'scale(1.0)',
  })

  return (
    <li
      className={clsx(
        `h-[57px]
         w-[245px]
         rounded-xl
         p-4
         text-lg
         tracking-wide
         text-primary-white
         transition-colors
         ease-in-out`,
      )}
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
      }}
    >
      <NextLink id={name} href={href}>
        <div className={clsx(isExtended ? 'flex items-center' : 'relative ')}>
          <animated.div
            className={clsx(
              `basis-6
               pr-4`,
              !isExtended &&
                `absolute
                 -right-4`,
              isHovered ? 'text-primary-white' : 'text-[#db97a4]',
            )}
            style={growShrink}
          >
            <FontAwesomeIcon icon={iconName as any} />
          </animated.div>
          {isExtended ? <span>{name}</span> : null}
        </div>
      </NextLink>
    </li>
  )
}
