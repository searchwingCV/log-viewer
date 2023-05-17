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
  id?: string
  isSpecial?: boolean
}

export const Button = ({
  className,
  disabled,
  buttonStyle,
  onClick,
  title,
  children,
  type,
  id,
  isSpecial,
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
           rounded-xl
           shadow-subtle`,
          disabled
            ? `bg-grey-dark
               cursor-not-allowed
             `
            : isSpecial
            ? 'bg-x-pink-to-blue'
            : 'bg-y-indigo-to-petrol',
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
      case 'Tertiary':
        return clsx(
          `button
             text-white
             text-xs
             decoration-primary-white
             rounded-lg
             shadow-subtle
             bg-opacity-[20%]
             bg-white`,
          disabled
            ? `  opacity-30
                 cursor-not-allowed`
            : `
                 hover:bg-opacity-[40%]`,
        )
      case 'Link':
        return clsx(
          `underline
           underline-offset-8
           text-grey-dark`,

          disabled
            ? `bg-transparent
               cursor-not-allowed`
            : ``,
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
      id={id}
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
