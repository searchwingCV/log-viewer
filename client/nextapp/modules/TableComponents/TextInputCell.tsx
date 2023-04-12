import React, { memo, useEffect, useState } from 'react'
import { Tooltip } from 'react-tippy'
import clsx from 'clsx'
import { useFormContext, UseFormReturn, FieldValues } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type TextInputCellProps = {
  name: string
  defaultValue?: string
  type?: 'text' | 'number'
  min?: number
  max?: number
}

interface InputProps extends UseFormReturn<FieldValues, any>, TextInputCellProps {}

const Input = memo(
  ({ register, name, defaultValue = '', setValue, type, getValues, min, max }: InputProps) => {
    const [newValue, setNewValue] = useState(getValues(name))

    useEffect(() => {
      if (getValues(name) === '') {
        setNewValue('')
      }
    }, [getValues(name)])

    return (
      <div
        className={`relative
                    flex
                    w-full`}
        id={`input-${name}`}
      >
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore */}
        <Tooltip
          className="w-full"
          position="top"
          title={newValue || defaultValue}
          trigger="mouseenter"
        >
          <input
            onFocus={() => {
              if (defaultValue) {
                setValue(name, defaultValue)
                setNewValue(defaultValue)
              }
            }}
            min={min}
            max={max}
            type={type || 'text'}
            {...register(name as `${string}` | `${string}.${string}` | `${string}.${number}`, {
              onChange: (e) => {
                if (e.target.value === defaultValue) {
                  setNewValue('')
                  setValue(name, '')
                } else {
                  setNewValue(e.target.value)
                }
              },
            })}
            className={clsx(
              `
              max-h-[31px]
              w-full
              rounded-md
              pt-2
              pb-2
              pl-2
              text-center
              placeholder-primary-black
              focus:ring-0
              focus:ring-offset-0`,
              newValue === 'delete'
                ? `bg-primary-red
                   text-primary-white`
                : newValue !== '' && newValue !== defaultValue && newValue !== undefined
                ? `bg-primary-dark-petrol
                   text-primary-white`
                : `bg-grey-light`,
              type === 'number' ? 'pr-2' : 'pr-6',
            )}
            placeholder={defaultValue || ''}
          />
        </Tooltip>

        {defaultValue !== '' ? (
          <button
            onClick={() => {
              setValue(name, 'delete')
              setNewValue('delete')
            }}
            type="button"
            className={clsx(
              `absolute
               right-2
               top-1/2
               -translate-y-1/2
               cursor-pointer
             text-primary-red`,
            )}
          >
            <FontAwesomeIcon icon={'circle-xmark'} />
          </button>
        ) : null}
        {newValue === 'delete' && type === 'number' ? (
          <span
            className={clsx(
              `
                          absolute
                          top-1/2
                          left-1/2
                          h-[18px]
                          -translate-y-1/2
                          -translate-x-1/2
                          transform
                          overflow-hidden
                          truncate
                          text-ellipsis
                          break-words
                          bg-primary-red
                          text-primary-white`,
              type === 'number' ? ' w-[90px]' : 'w-[110px]',
            )}
          >
            delete
          </span>
        ) : null}
      </div>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.formState.isDirty === nextProps.formState.isDirty
  },
)

export const TextInputCell = ({ name, defaultValue, type, min, max }: TextInputCellProps) => {
  const methods = useFormContext()

  return (
    <Input {...methods} name={name} defaultValue={defaultValue} type={type} min={min} max={max} />
  )
}
