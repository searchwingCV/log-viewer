/*  
  TODO: Make InputReactHookForm and Input become one component to remove duplicate code
*/
import * as React from 'react'
import clsx from 'clsx'
import { ErrorMessage } from '@hookform/error-message'
import type {
  RegisterOptions,
  UseFormRegister,
  Path,
  FieldErrors,
  FieldValues,
} from 'react-hook-form'

export type InputProps = {
  children?: React.ReactNode
  classNameInputELement?: string
  classNameInputContainer?: string
  classNameInputWrapper?: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'radio' | 'date'
  maxLength?: number
  required?: boolean
  autoComplete?: string
  placeholder?: string
  disabled?: boolean
  defaultValue?: string | null
  hasInitialValue?: boolean
}

export type FormInputProps<TFormValues extends FieldValues> = {
  name: Path<TFormValues>
  register: UseFormRegister<TFormValues>
  rules?: RegisterOptions
  errors: FieldErrors<TFormValues>
} & Omit<InputProps, 'name'>

export const InputReactHookForm = <TFormValues extends FieldValues>({
  children,
  required,
  name,
  errors,
  maxLength,
  autoComplete,
  disabled,
  placeholder,
  classNameInputContainer = '',
  classNameInputWrapper = '',
  register,
  rules,
  defaultValue = '',
  type,
  ...rest
}: FormInputProps<TFormValues>) => {
  //To ensure autofilled value is detected, animation on autofill-pseudo element is set up
  const [value, setValue] = React.useState(defaultValue)

  return (
    <div className={clsx(classNameInputWrapper, 'relative')}>
      <div
        className={clsx(
          classNameInputContainer && classNameInputContainer,
          `input-wrapper
           relative h-16`,
        )}
      >
        <input
          type={type}
          onAnimationStart={(e) => {
            if ((e.target as HTMLInputElement).value) {
              setValue((e.target as HTMLInputElement).value)
            }
          }}
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
          onFocus={(e) => {
            setValue(e.target.value)
          }}
          {...rest}
          {...(register &&
            register(name, {
              onChange: (e) => {
                setValue(e.target.value)
              },

              ...(rules || {}),
            }))}
        ></input>
        {children}
        {type === 'date' ? (
          <label
            className={clsx(
              `height-5
               absolute
               left-0
               z-0
               text-grey-dark
               transition-all
               
               `,

              disabled && 'text-grey-medium',
            )}
          >
            {placeholder}
            {!rules?.required ? ` (Optional)` : ''}
          </label>
        ) : (
          <label
            className={clsx(
              `height-5
               absolute
               left-0
               z-0
               text-grey-dark
               transition-all
               peer-focus:top-0
               peer-focus:text-xs
               `,
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
        )}

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
      {!disabled && (
        <ErrorMessage
          errors={errors}
          name={name as any}
          render={({ message }) => (
            <p
              className={`error-message
                          absolute
                          top-full
                          pt-1
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
