import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import clsx from 'clsx'
import Tippy from '@tippyjs/react'

const RowActionButtonVariant = ['delete', 'download', 'link', 'upload'] as const

type RowActionButtonProps = {
  variant: (typeof RowActionButtonVariant)[number]
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
  onClick,
  ...rest
}: RowActionButtonProps) => {
  return (
    <Tippy content={tooltipText}>
      <button
        {...rest}
        type="button"
        className={clsx(
          className,
          `m-1 h-7 w-7 rounded-full text-white transition-all duration-150   disabled:bg-grey-light`,
          variant === 'delete' && ['hover:bg-secondary-dark-red bg-primary-red'],
          variant === 'link' && [
            '!hover:bg-white hover:bg-secondary-dark-petrol  bg-primary-light-petrol',
          ],
          variant === 'download' && ['hover:bg-secondary-dark-indigo-blue bg-primary-indigo-blue'],
          variant === 'upload' && ['hover:bg-secondary-dark-rose bg-primary-rose'],
        )}
        onClick={onClick}
      >
        {renderIcon(variant)}
      </button>
    </Tippy>
  )
}
