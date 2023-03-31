/*  

  So far this component is not actively used

*/
import * as React from 'react'
import { useTranslation } from 'next-i18next'
import clsx from 'clsx'
import { ErrorMessage } from '@hookform/error-message'
import styles from './Input.module.css'
import { RegisterOptions, UseFormRegister, Path, FieldErrors, FieldValues } from 'react-hook-form'

export type InputProps = {
  children?: React.ReactNode
  classNameInputELement?: string
  classNameInputContainer?: string
  classNameInputWrapper?: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'radio'
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
  rules: RegisterOptions
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
  classNameInputELement = '',
  classNameInputContainer = '',
  classNameInputWrapper = '',
  register,
  rules,
  defaultValue = '',
  hasInitialValue,
  ...rest
}: FormInputProps<TFormValues>) => {
  const hasError = !!errors?.[name]
  const { t } = useTranslation()

  //To ensure autofilled value is detected, animation on autofill-pseudo element is set up
  const [isAutofillOnMountActive, setIsAutofillOnMountActive] = React.useState(false)
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
          onAnimationStart={(e) => {
            if ((e.target as HTMLInputElement).value) {
              setIsAutofillOnMountActive(true)
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
          onFocus={(e) => {
            setValue(e.target.value)
            setIsAutofillOnMountActive(false)
          }}
          {...rest}
          {...(register &&
            register(name, {
              onChange: (e) => {
                setValue(e.target.value)
                setIsAutofillOnMountActive(false)
              },

              ...rules,
            }))}
        ></input>
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
          {!rules.required ? ` (${t('Optional')})` : ''}
        </label>
        <div className={clsx(!hasError && styles.inputBorder)}></div>
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
              {t(message)}
            </p>
          )}
        />
      )}
    </div>
  )
}
