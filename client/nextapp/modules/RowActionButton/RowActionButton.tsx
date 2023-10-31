import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NextLink from 'next/link'

import clsx from 'clsx'
import Tippy from '@tippyjs/react'

const RowActionButtonVariant = ['delete', 'download', 'link', 'upload'] as const

type RowActionButtonProps = {
  variant: (typeof RowActionButtonVariant)[number]
  linkTitle?: string
  className?: string
  tooltipText: string
  url?: string
} & React.ComponentPropsWithRef<'button'>

const renderIcon = (variant: (typeof RowActionButtonVariant)[number]) => {
  switch (variant) {
    case 'delete':
      return <FontAwesomeIcon icon="trash" />
    case 'download':
      return <FontAwesomeIcon icon="download" />
    case 'link':
      return <FontAwesomeIcon icon="share-from-square" />
    case 'upload':
      return <FontAwesomeIcon icon="file-arrow-up" />

    default:
  }
}

export const RowActionButton = ({
  variant,
  className,
  tooltipText,
  url,
  onClick,
  linkTitle,
  ...rest
}: RowActionButtonProps) => {
  const baseClass = `m-1 h-7 w-7 rounded-full text-white transition-all duration-150 disabled:bg-grey-light flex items-center justify-center`

  return (
    <Tippy content={tooltipText}>
      {(url && variant === 'link') || variant === 'download' ? (
        <NextLink href={url || ''}>
          <a
            title={linkTitle}
            className={clsx(
              baseClass,
              variant === 'link' &&
                '!hover:bg-white  bg-primary-light-petrol hover:bg-secondary-dark-petrol',
              variant === 'download' && [
                'bg-primary-indigo-blue hover:bg-secondary-dark-indigo-blue ',
              ],
            )}
          >
            {renderIcon(variant)}
          </a>
        </NextLink>
      ) : (
        <button
          {...rest}
          type="button"
          className={clsx(
            className,
            baseClass,
            variant === 'delete' && ['bg-primary-red hover:bg-secondary-dark-red'],
            variant === 'upload' && ['bg-primary-rose hover:bg-secondary-dark-rose'],
          )}
          onClick={onClick}
        >
          {renderIcon(variant)}
        </button>
      )}
    </Tippy>
  )
}
