import React, { memo, useState } from 'react'
import clsx from 'clsx'
import Tippy from '@tippyjs/react'
import { useFormContext, UseFormReturn, FieldValues } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { format, parseISO, isValid } from 'date-fns'

type DateInputCellProps = {
  name: string
  defaultValue?: string
  hasNoDeleteValue?: boolean
  headerName: string
}

interface InputProps extends UseFormReturn<FieldValues, any>, DateInputCellProps {}

const Input = memo(
  ({
    register,
    name,
    defaultValue = '',
    setValue,
    getValues,
    hasNoDeleteValue,
    headerName,
  }: InputProps) => {
    const [newValue, setNewValue] = useState(getValues(name))
    const parsedDefault = isValid(parseISO(defaultValue))
      ? format(parseISO(defaultValue), 'yyyy-MM-dd')
      : undefined

    return (
      <div
        className={`relative
                    flex
                    w-full`}
        id={`input-${name}`}
      >
        <Tippy
          content={newValue ? `${headerName}: ${newValue}` : `${headerName}: ${defaultValue}`}
          trigger="mouseenter"
          className="w-full"
        >
          <>
            <input
              type={'date'}
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
              w-full
              rounded-md
              py-2
              pl-2
              pr-6
              text-center
              placeholder-primary-black
              focus:ring-0
              focus:ring-offset-0`,
                !!getValues(name) && newValue === 'delete'
                  ? `bg-primary-red
                 text-primary-white`
                  : !!getValues(name) && newValue && newValue !== parsedDefault
                  ? `bg-primary-dark-petrol
                 text-primary-white`
                  : `bg-grey-light`,
              )}
              placeholder={parsedDefault || ''}
            />
            {getValues(name) && defaultValue && newValue !== parsedDefault ? (
              <button
                onClick={() => {
                  setValue(name, parsedDefault, { shouldDirty: true })
                  setNewValue(parsedDefault)
                }}
                type="button"
                className={`absolute
                        left-2
                        top-1/2
                        z-[10]
                        h-5
                        w-5
                        -translate-y-1/2
                        scale-75
                        cursor-pointer
                        rounded-full
                        bg-primary-white`}
              >
                <FontAwesomeIcon icon={'undo'} />
              </button>
            ) : null}

            {hasNoDeleteValue && defaultValue !== '' ? (
              <button
                onClick={() => {
                  setValue(name, 'delete', { shouldDirty: true })
                  setNewValue('delete')
                }}
                type="button"
                className={`
                      absolute
                      right-2
                      top-1/2
                      -translate-y-1/2
                      cursor-pointer
                      text-primary-red`}
              >
                <FontAwesomeIcon icon={'circle-xmark'} />
              </button>
            ) : null}

            {newValue === 'delete' ? (
              <span
                className={`
                          absolute
                          top-1/2
                          left-10
                          h-[18px]
                          w-[110px]
                          -translate-y-1/2
                          transform
                          overflow-hidden
                          truncate
                          text-ellipsis
                          break-words
                          bg-primary-red
                          text-primary-white`}
              >
                delete
              </span>
            ) : null}
            {!getValues(name) && parsedDefault ? (
              <span
                className={`absolute
                        top-1/2
                        left-1/2
                        h-[18px]
                        w-[120px]
                        -translate-x-1/2
                        -translate-y-1/2
                        transform
                        overflow-hidden
                        truncate
                        text-ellipsis
                        break-words
                        bg-grey-light
                          `}
              >
                {isValid(parseISO(defaultValue))
                  ? format(parseISO(defaultValue), 'dd.MM.yyyy')
                  : undefined}
              </span>
            ) : null}
          </>
        </Tippy>
      </div>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.formState.isDirty === nextProps.formState.isDirty
  },
)

export const DateInputCell = ({
  name,
  defaultValue,
  hasNoDeleteValue,
  headerName,
}: DateInputCellProps) => {
  const methods = useFormContext()

  return (
    <Input
      {...methods}
      name={name}
      defaultValue={defaultValue}
      hasNoDeleteValue={hasNoDeleteValue}
      headerName={headerName}
    />
  )
}
