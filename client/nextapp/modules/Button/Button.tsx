import * as React from 'react'
import clsx from 'clsx'
import NextLink from 'next/link'

export type ButtonStyle = 'Main' | 'Secondary' | 'Tertiary' | 'Link'

export type Props = {
  children?: React.ReactNode | JSX.Element
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  disabled?: boolean
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
  buttonStyle: ButtonStyle
  title?: string
  href?: string
}

export const Button = ({
  className,
  disabled,
  buttonStyle,
  onClick,
  title,
  children,
  type,
  href = '',
  ...rest
}: Props) => {
  const getStyleClassesButton = (buttonStyle: ButtonStyle) => {
    switch (buttonStyle) {
      case 'Main':
        return clsx(
          `button
           text-primary-white
           decoration-primary-white
           bg-y-indigo-to-petrol
           rounded-xl
           shadow-subtle`,
          disabled &&
            `bg-grey-medium
               cursor-not-allowed`,
        )
      case 'Secondary':
        return clsx(
          `button
           text-primary-white
           decoration-primary-white
           rounded-xl
           shadow-subtle`,
          disabled
            ? `bg-grey-medium
               cursor-not-allowed`
            : `bg-primary-light-petrol
               hover:bg-primary-dark-petrol`,
        )
      case 'Link':
        return clsx(
          'button',
          disabled
            ? `bg-transparent
               cursor-not-allowed`
            : `hover:border-secondary-soft-black
               hover:bg-secondary-soft-black
               hover:text-primary-white
               hover:decoration-primary-white`,
        )
      default:
        return ''
    }
  }

  if (href) {
    return (
      <NextLink href={href}>
        <a
          title={title}
          className={clsx(className && className, getStyleClassesButton(buttonStyle))}
        >
          {children}
        </a>
      </NextLink>
    )
  }

  return (
    <button
      onClick={onClick}
      type={type}
      title={title}
      disabled={disabled}
      className={clsx(getStyleClassesButton(buttonStyle), 'inline-block', className && className)}
      {...rest}
    >
      {children}
    </button>
  )
}
