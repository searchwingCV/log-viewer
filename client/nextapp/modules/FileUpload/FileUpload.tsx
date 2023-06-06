import type { FieldValues, FieldErrors, UseFormSetValue, PathValue, Path } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
//import Dropzone, { type Accept } from 'react-dropzone'
import type { ChangeEventHandler } from 'react'
import Button from '../Button'

export interface FileInputProps {
  disabled?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: ChangeEventHandler<HTMLInputElement>
  fileType?: Accept
  hint?: string
}

export type InputProps<TFormValues extends FieldValues> = {
  name: Path<TFormValues>
  errors: FieldErrors<TFormValues>
  setValue: UseFormSetValue<TFormValues>
} & Omit<FileInputProps, 'name'>

export const FileUpload = <TFormValues extends FieldValues>({
  name,
  setValue,
  disabled,
  onChange,
  onBlur,
  errors,
  fileType,
  hint,
}: InputProps<TFormValues>) => {
  return (
    <div className="relative">
      <Dropzone
        noClick
        maxFiles={1}
        accept={fileType}
        disabled={disabled}
        onDrop={(acceptedFiles) => {
          setValue(name, acceptedFiles as unknown as PathValue<TFormValues, Path<TFormValues>>, {
            shouldValidate: true,
          })
        }}
      >
        {({ getRootProps, getInputProps, open, acceptedFiles }) => (
          <div
            className={`flex
                        h-[200px]
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-dashed`}
          >
            <div {...getRootProps()}>
              <input
                {...getInputProps({
                  id: 'spreadsheet',
                  onChange,
                  onBlur,
                })}
              />
              <div className="text-center">
                <Button
                  type="button"
                  buttonStyle="Secondary"
                  className={`h-[50px]
                              w-[200px]`}
                  onClick={open}
                >
                  Choose a file
                </Button>
                <div className="mt-4">or drag and drop</div>
                <div>{hint}</div>
              </div>
              <div className="text-center">
                {acceptedFiles.length ? (
                  <div
                    className={`mt-4
                                text-xl
                                font-bold
                                text-primary-green`}
                  >
                    {acceptedFiles[0].name}
                  </div>
                ) : (
                  'No file selected.'
                )}{' '}
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
                                  left-0
                                  pt-1 text-xs
                                  text-primary-red`}
                    >
                      {message}
                    </p>
                  )}
                />
              )}{' '}
            </div>
          </div>
        )}
      </Dropzone>
    </div>
  )
}
