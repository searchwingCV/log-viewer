/*  
  TODO: Make SelectReactHookForn and Select become one component to remove duplicate code
*/
import * as React from 'react'
import clsx from 'clsx'
import { Button } from 'modules/Button/Button'

type SelectProps = {
  name: string
  type?: 'text'
  placeholder?: string
  disabled?: boolean
  options: { name: string; value: string | number }[]
  children?: React.ReactNode
  className?: string
  defaultValue?: string | null
  onSetValue: (value: [string]) => void
  hasResetButton?: boolean
  classNameResetButtonContainer?: string
  resetButtonText?: string
}

export const Select = ({
  children,
  placeholder,
  options,
  disabled = false,
  defaultValue,
  onSetValue,
  hasResetButton,
  classNameResetButtonContainer,
  resetButtonText,
  ...rest
}: SelectProps) => {
  const [value, setValue] = React.useState(
    defaultValue && defaultValue !== 'None' ? defaultValue : '',
  )
  const handleClickReset = () => {
    setValue('')
    onSetValue([''])
  }

  return (
    <>
      <div className={clsx('relative flex h-16 flex-col')}>
        <div className={clsx(hasResetButton ? 'max-w-[calc(100%_-_250px)]' : 'w-full')}>
          <select
            className={clsx(
              `!focus:outline-none
              appearane-none
              peer
              absolute
              top-6
              bottom-0
              z-10
              h-10
              w-full
              border-0
              border-b
              border-solid
              bg-transparent
              pl-0
              pt-1
              pb-3
              caret-grey-dark
              !outline-none
              outline-0
              transition-all
              focus:ring-0`,
              disabled ? 'pointer-events-none' : 'border-grey-medium',
            )}
            {...rest}
            onChange={(e) => {
              setValue(e.target.value)
              onSetValue([e.target.value])
            }}
            value={value}
          >
            {options.map((option: { name: string; value: string | number }) => {
              return (
                <option key={option.value} value={option.value}>
                  {option.value === '' ? '' : option.name}
                </option>
              )
            })}
          </select>
          {children}
          <label
            className={clsx(
              `height-5
               absolute
               left-0
               z-0
               text-grey-dark
               transition-all
               peer-focus:top-0
               peer-focus:text-xs`,
              value
                ? `top-0
                   text-xs`
                : 'top-7',
              disabled && 'text-grey-medium',
            )}
          >
            {placeholder}
            {!value ? ' (unset)' : ''}
          </label>
          <div
            className={`absolute
                        bottom-0
                        left-0
                        h-px
                        w-0
                        bg-grey-medium
                        opacity-0
                        peer-hover:z-20
                        peer-hover:w-full
                        peer-hover:bg-primary-black
                        peer-hover:opacity-100
                        peer-hover:duration-500`}
          ></div>
        </div>
      </div>
      {hasResetButton ? (
        <div className={classNameResetButtonContainer}>
          <Button
            buttonStyle="Secondary"
            className={`h-[50px]
                        w-[200px]`}
            type="reset"
            onClick={handleClickReset}
          >
            {resetButtonText}
          </Button>
        </div>
      ) : null}
    </>
  )
}
