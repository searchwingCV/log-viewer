import { Tooltip } from 'react-tippy'
import React, { memo, useEffect, useState } from 'react'
import clsx from 'clsx'
import { useFormContext, UseFormReturn, FieldValues } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface InputProps extends UseFormReturn<FieldValues, any> {
  name: string
  type?: 'text' | 'date'
  defaultValue?: string
}

const Input = memo(
  ({ register, name, defaultValue = '', setValue, type, getValues }: InputProps) => {
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
          <textarea
            {...register(name as `${string}` | `${string}.${string}` | `${string}.${number}`, {
              onChange: (e) => {
                if (e.target.value === defaultValue) {
                  setNewValue('')
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
              text-center
              placeholder-primary-rose
              focus:ring-0
              focus:ring-offset-0`,
              type === 'date' ? 'py-2 pl-2 pr-6' : 'p-2',
              newValue === 'delete'
                ? `bg-primary-red
                   text-primary-white`
                : newValue !== '' && newValue !== defaultValue
                ? `bg-primary-dark-petrol
                   text-primary-white`
                : `bg-grey-light
                   text-primary-rose`,
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
            className={`absolute
                        right-2
                        top-1/2
                        -translate-y-1/2
                        cursor-pointer
                       text-primary-red`}
          >
            <FontAwesomeIcon icon={'circle-xmark'} />
          </button>
        ) : null}
      </div>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.formState.isDirty === nextProps.formState.isDirty
  },
)
type TextInputCellProps = {
  name: string
  defaultValue?: string
}

export const TextInputCell = ({ name, defaultValue }: TextInputCellProps) => {
  const methods = useFormContext()

  return <Input {...methods} name={name} defaultValue={defaultValue} />
}
