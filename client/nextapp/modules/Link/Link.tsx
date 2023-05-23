import type { ReactNode } from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import LinkWrapper from 'modules/LinkWrapper'

export type LinkProps = {
  children: ReactNode
  href: string
  className?: string
  disabled?: boolean
  id?: string
  isWhite?: boolean
  title?: string
  icon?: string
  isIconRight?: boolean
}

// TODO: see if we have to use these links in rich-text modules as Concept wants
// TODO: see wth Concept if we can limit the types of icons used by editors.
export const Link = ({
  children,
  href,
  disabled,
  className,
  title,
  icon,
  isIconRight,
  isWhite,
}: LinkProps) => {
  if (!href) return null

  const getStyle = () =>
    clsx(
      `text-base
       leading-8
       font-outfit
       hover:underline
       underline-offset-4	
       `,
      icon && 'inline-flex',
      isWhite ? 'text-primary-white' : 'text-grey-dark',
      disabled &&
        `pointer-events-none 
         text-grey-dark`,
      icon && 'group',
      className && className,
    )

  return (
    <LinkWrapper href={href} className={getStyle()} title={title}>
      <>
        {icon ? (
          <span
            className={clsx(
              `flex
               items-center
               px-2
               group-hover:px-3
             `,
              isIconRight && 'order-2',
            )}
          >
            <FontAwesomeIcon icon={icon as IconProp} />
          </span>
        ) : null}
        <span>{children}</span>
      </>
    </LinkWrapper>
  )
}
