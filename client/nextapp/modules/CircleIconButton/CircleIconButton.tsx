import { useState } from 'react'
import clsx from 'clsx'
import { animated, useSpring } from '@react-spring/web'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export type CircleIconButtonProps = {
  addClasses?: string
  iconClassName: string
  onClick: () => void
  disabled?: boolean
}

export const CircleIconButton = ({
  iconClassName,
  disabled,
  onClick,
  addClasses,
}: CircleIconButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const growShrink = useSpring({
    transform: isHovered ? 'scale(1.1)' : 'scale(1.0)',
  })

  return (
    <>
      <animated.button
        className={clsx(
          `h-12
           w-12
           rounded-full
         bg-primary-white
           shadow-subtle`,
          addClasses,
          disabled &&
            `pointer-events-none
             opacity-40`,
        )}
        onClick={onClick}
        style={growShrink}
        onMouseEnter={() => {
          setIsHovered(true)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
        }}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={iconClassName as any} />
      </animated.button>
    </>
  )
}
