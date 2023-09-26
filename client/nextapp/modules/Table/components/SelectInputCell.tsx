import React, { memo, useState, useEffect } from 'react'
import clsx from 'clsx'
import { useFormContext, type UseFormReturn, type FieldValues } from 'react-hook-form'
import Tippy from '@tippyjs/react'

type SelectInputCellProps = {
  name: string
  options: { name: string; value: any }[]
  defaultValue?: string | number | boolean
  required?: boolean
  hasNoDeleteValue?: boolean
  headerName: string
  isForeignKeyPicker?: boolean //in this case we have to return a number
}

interface InputProps extends UseFormReturn<FieldValues, any>, SelectInputCellProps {}

const Select = memo(
  ({
    register,
    name,
    options,
    defaultValue = '',
    getValues,
    hasNoDeleteValue,
    headerName,
    isForeignKeyPicker,
  }: InputProps) => {
    const [selectedValue, setValue] = useState(getValues(name))

    useEffect(() => {
      if (getValues(name) === '') {
        setValue('')
      }
    }, [getValues, name])

    return (
      <div
        className={`pointer-events-none
                    relative
                    flex`}
      >
        <Tippy
          content={`${headerName}: ${
            options.find((item) => item.value === (selectedValue || defaultValue))?.name
          }`}
          trigger="mouseenter"
          className="w-full"
        >
          <div className="w-full">
            <select
              {...register(name, {
                onChange: (e) => {
                  setValue(
                    isForeignKeyPicker && e.target.value
                      ? parseInt(e.target.value)
                      : e.target.value,
                  )
                },
              })}
              className={clsx(
                `
                pointer-events-auto
                w-full
                rounded-md
                p-2
                text-center
                placeholder-primary-rose
                focus:ring-0
                focus:ring-offset-0
                `,
                getValues(name) === 'delete'
                  ? `bg-primary-red
                   text-primary-white`
                  : getValues(name) && getValues(name) !== defaultValue
                  ? `odd:bg-secondary-dark-petrol
                   text-primary-white`
                  : `bg-grey-light
                   text-primary-rose`,
              )}
            >
              <option></option>
              {!hasNoDeleteValue ? (
                <option key="delete" value="delete">
                  delete / no value
                </option>
              ) : null}
              {options.map((option: { name: string; value: string | number }) => {
                return (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={defaultValue === option.value}
                  >
                    {defaultValue === option.value ? '* ' : ''}
                    {option.value === '' ? '' : option.name}
                  </option>
                )
              })}
            </select>
            {!getValues(name) && getValues(name) !== defaultValue ? (
              <span
                className={`absolute
                          left-1/2
                          top-1/2
                          h-[18px]
                          w-[90px]
                          -translate-x-1/2
                          -translate-y-1/2
                          transform
                          overflow-hidden
                          truncate
                          text-ellipsis
                          break-words`}
              >
                {options ? options.find((item) => item.value === defaultValue)?.name : ''}
              </span>
            ) : null}
          </div>
        </Tippy>
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.formState.isDirty === nextProps.formState.isDirty,
)

Select.displayName = 'Select'

export const SelectInputCell = ({
  name,
  options,
  defaultValue,
  required,
  hasNoDeleteValue,
  headerName,
  isForeignKeyPicker,
}: SelectInputCellProps) => {
  const methods = useFormContext()

  return (
    <Select
      {...methods}
      name={name}
      options={options}
      defaultValue={defaultValue}
      required={required}
      hasNoDeleteValue={hasNoDeleteValue}
      headerName={headerName}
      isForeignKeyPicker={isForeignKeyPicker}
    />
  )
}
