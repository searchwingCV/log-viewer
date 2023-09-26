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
          variant === 'delete' && ['bg-primary-red hover:bg-secondary-dark-red'],
          variant === 'link' && [
            '!hover:bg-white bg-primary-light-petrol  hover:bg-secondary-dark-petrol',
          ],
          variant === 'download' && ['bg-primary-indigo-blue hover:bg-secondary-dark-indigo-blue'],
          variant === 'upload' && ['bg-primary-rose hover:bg-secondary-dark-rose'],
        )}
        onClick={onClick}
      >
        {renderIcon(variant)}
      </button>
    </Tippy>
  )
}
