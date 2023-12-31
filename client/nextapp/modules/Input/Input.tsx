import * as React from 'react'
import clsx from 'clsx'
import { Button } from 'modules/Button/Button'

export type InputProps = {
  defaultValue?: string | null
  hasInitialValue?: boolean
  classNameInputContainer?: string
  onChangeInput?: (value: string) => void
  hasResetButton?: boolean
  classNameResetButtonContainer?: string
} & React.ComponentProps<'input'>

export const Input = ({
  required,
  maxLength,
  autoComplete,
  disabled,
  placeholder,
  classNameInputContainer = '',
  defaultValue = '',
  onChangeInput,
  hasResetButton,
  classNameResetButtonContainer,
}: InputProps) => {
  const [value, setValue] = React.useState(defaultValue)

  const handleClickReset = () => {
    setValue('')
    onChangeInput && onChangeInput('')
  }

  return (
    <>
      <div className={clsx('relative')}>
        <div
          className={clsx(
            classNameInputContainer && classNameInputContainer,
            `input-wrapper
             relative
             h-12`,
          )}
        >
          <input
            disabled={disabled}
            maxLength={maxLength}
            required={required}
            autoComplete={autoComplete}
            className={clsx(
              `!focus:outline-none
              appearane-none
              peer
              absolute
              bottom-0
              top-6
              z-10
              h-6
              w-full
              border-0
              border-b
              border-solid
              bg-transparent
              pb-3
              pl-0
              pt-1
              caret-grey-dark
              !outline-none
              outline-0
              transition-all
              focus:ring-0`,
              disabled ? 'pointer-events-none' : 'border-grey-medium',
            )}
            onChange={(e) => {
              setValue(e.target.value)
              onChangeInput && onChangeInput((e.target as HTMLInputElement).value)
            }}
            value={value || ''}
          ></input>

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
                : 'top-4',
              disabled && 'text-grey-medium',
            )}
          >
            {placeholder}
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
            className={`h-12
                        w-[200px]`}
            type="reset"
            onClick={handleClickReset}
          >
            Reset Search
          </Button>
        </div>
      ) : null}
    </>
  )
}
