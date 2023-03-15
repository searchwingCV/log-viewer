import React, { memo, useState } from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useFormContext, UseFormReturn, FieldValues } from 'react-hook-form'

interface InputProps extends UseFormReturn<FieldValues, any> {
  name: string
  value?: string
}

const Input = memo(
  ({ register, name, value, setFocus }: InputProps) => {
    const [editButtonHidden, setEditButtonHidden] = useState(false)
    return (
      <div className="flex">
        <input
          {...register(name as `${string}` | `${string}.${string}` | `${string}.${number}`)}
          className={`
                      w-full
                      rounded-md
                      text-center
                      placeholder-primary-rose
                      focus:ring-0
                      focus:ring-offset-0`}
          placeholder={value || 'No value yet'}
          onBlur={() => {
            setEditButtonHidden(false)
          }}
        />

        <button
          type="button"
          className={clsx(
            editButtonHidden &&
              `pointer-events-none
               invisible
               w-0`,
          )}
          onClick={() => {
            setFocus(name as `${string}` | `${string}.${string}` | `${string}.${number}`)
            setEditButtonHidden(true)
          }}
        >
          <FontAwesomeIcon
            icon={'pencil'}
            className={`mt-1
                        ml-4`}
          />
        </button>
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.formState.isDirty === nextProps.formState.isDirty,
)

type EditableCellprops = {
  name: string
  value?: string
}

export const EditableTableCell = ({ name, value }: EditableCellprops) => {
  const methods = useFormContext()

  return <Input {...methods} name={name} value={value} />
}
