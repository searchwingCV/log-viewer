import React, { memo, useEffect, useState } from 'react'
import clsx from 'clsx'
import { useFormContext, type UseFormReturn, type FieldValues } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'

type TextInputCellProps = {
  name: string
  defaultValue?: string
  type?: 'text' | 'number'
  min?: number
  max?: number
  headerName: string
  hasNoDeleteValue?: boolean
}

interface InputProps extends UseFormReturn<FieldValues, any>, TextInputCellProps {}

const Input = memo(
  ({
    register,
    name,
    defaultValue = '',
    setValue,
    type,
    getValues,
    min,
    max,
    headerName,
    hasNoDeleteValue,
  }: InputProps) => {
    const [newValue, setNewValue] = useState(getValues(name))

    useEffect(() => {
      if (getValues(name) === '') {
        setNewValue('')
      }
    }, [getValues, name])

    return (
      <div
        className={`relative
                    flex
                    w-full`}
        id={`input-${name}`}
      >
        <Tippy
          className="w-full"
          content={newValue ? `${headerName}: ${newValue}` : `${headerName}: ${defaultValue}`}
          trigger="mouseenter"
        >
          <div className="w-full">
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
              {...register(name, {
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
          </div>
        </Tippy>

        {defaultValue !== '' && !hasNoDeleteValue ? (
          <button
            onClick={() => {
              setValue(name, 'delete', { shouldDirty: true })
              setNewValue('delete')
            }}
            type="button"
            className={clsx(
              `absolute
               top-1/2
               -translate-y-1/2
               cursor-pointer
             text-primary-red`,
              type === 'number' ? `left-2` : `right-2`,
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

Input.displayName = 'Input'

export const TextInputCell = ({
  name,
  defaultValue,
  type,
  min,
  max,
  headerName,
  hasNoDeleteValue,
}: TextInputCellProps) => {
  const methods = useFormContext()

  return (
    <Input
      {...methods}
      name={name}
      defaultValue={defaultValue}
      type={type}
      min={min}
      max={max}
      headerName={headerName}
      hasNoDeleteValue={hasNoDeleteValue}
    />
  )
}
