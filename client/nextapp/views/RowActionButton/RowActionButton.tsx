import clsx from 'clsx'
import Tippy from '@tippyjs/react'

const RowActionButtonVariant = ['delete', 'download', 'link'] as const

type RowActionButtonProps = {
  variant: (typeof RowActionButtonVariant)[number]
  className?: string
  tooltipText: string
} & React.ComponentPropsWithRef<'button'>

export const RowActionButton = ({ variant, className, tooltipText }: RowActionButtonProps) => {
  return (
    <Tippy content={tooltipText}>
      <button
        className={clsx(
          className,
          `h-12 w-12 rounded-full text-white transition-all duration-150 hover:bg-opacity-80 disabled:bg-grey-light`,
          variant === 'delete' && ['bg-primary-red'],
          variant === 'download' && [''],
          variant === 'link' && ['text-black hover:text-gray-600 active:text-gray-800'],
        )}
      ></button>
    </Tippy>
  )
}
