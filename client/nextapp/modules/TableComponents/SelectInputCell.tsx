import { Tooltip } from 'react-tippy'
import React, { memo, useState, useEffect } from 'react'
import clsx from 'clsx'
import { useFormContext, UseFormReturn, FieldValues } from 'react-hook-form'

interface InputProps extends UseFormReturn<FieldValues, any> {
  name: string
  options: { name: string; value: string | number }[]
  defaultValue?: string
}

const Select = memo(
  ({ register, name, options, defaultValue = '', getValues }: InputProps) => {
    const [selectedValue, setValue] = useState(getValues(name))

    useEffect(() => {
      if (getValues(name) === '') {
        setValue('')
      }
    }, [getValues(name)])

    return (
      <div
        className={`pointer-events-none
                    relative
                    flex`}
      >
        {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore */}
        <Tooltip
          content={`${
            options.find((item) => item.value === (selectedValue || defaultValue))?.name
          }`}
          position="top"
          trigger="mouseenter"
          className="w-full"
        >
          <select
            {...register(name as `${string}` | `${string}.${string}` | `${string}.${number}`, {
              onChange: (e) => {
                setValue(e.target.value)
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
                ? `text-primary-white
                   odd:bg-primary-dark-petrol`
                : `bg-grey-light
                   text-primary-rose`,
            )}
          >
            <option></option>

            {defaultValue !== '' ? (
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
                          top-1/2
                          left-1/2
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
        </Tooltip>
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.formState.isDirty === nextProps.formState.isDirty,
)

type SelectInputCellProps = {
  name: string
  options: { name: string; value: string | number }[]
  defaultValue?: string
}

export const SelectInputCell = ({ name, options, defaultValue }: SelectInputCellProps) => {
  const methods = useFormContext()

  return <Select {...methods} name={name} options={options} defaultValue={defaultValue} />
}
