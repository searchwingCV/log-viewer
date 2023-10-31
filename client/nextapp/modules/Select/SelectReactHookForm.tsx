/*  
  TODO: Make SelectReactHookForn and Select become one component to remove duplicate code
*/
import * as React from 'react'
import clsx from 'clsx'
import { ErrorMessage } from '@hookform/error-message'
import type {
  RegisterOptions,
  UseFormRegister,
  Path,
  FieldValues,
  FieldErrors,
} from 'react-hook-form'

type SelectProps = {
  name: string
  type?: 'text' | 'email' | 'tel'
  placeholder?: string
  hint?: string
  disabled?: boolean
  alternate?: boolean
  required?: boolean
  options: { name: string; value: string | number }[]
  hideLabel?: boolean
  children?: React.ReactNode
  className?: string
  defaultValue?: string | null
}

export type FormSelectProps<TFormValues extends FieldValues> = {
  name: Path<TFormValues>
  register: UseFormRegister<TFormValues>
  rules?: RegisterOptions
  errors: FieldErrors<TFormValues>
} & Omit<SelectProps, 'name'>

export const SelectReactHookForm = <TFormValues extends FieldValues>({
  children,
  name,
  placeholder,
  errors,
  register,
  rules,
  options,
  disabled = false,
  defaultValue,
  ...rest
}: FormSelectProps<TFormValues>) => {
  const [value, setValue] = React.useState(defaultValue || '')

  return (
    <div>
      <div className={clsx('relative h-16')}>
        <select
          className={clsx(
            `!focus:outline-none
             appearane-none
             peer
             absolute
             bottom-0
             top-6
             z-10
             h-10
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
          {...rest}
          {...(register &&
            register(name, {
              onChange: (e) => {
                setValue(e.target.value)
              },

              ...(rules || {}),
            }))}
        >
          <option></option>
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
          {!rules?.required ? `(Optional)` : ''}
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
        ></div>{' '}
      </div>
      {!disabled && (
        <ErrorMessage
          errors={errors}
          name={name as any}
          render={({ message }) => (
            <p
              className={`pt-1
                          text-xs
                          text-primary-red`}
            >
              {message}
            </p>
          )}
        />
      )}
    </div>
  )
}
