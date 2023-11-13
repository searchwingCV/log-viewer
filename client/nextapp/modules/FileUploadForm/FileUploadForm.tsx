import type { AxiosError } from 'axios'
import { animated, useSpring } from '@react-spring/web'
import clsx from 'clsx'
import { useForm, Controller } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import { useMutation } from '@tanstack/react-query'
import Button from '@modules/Button'
import FileUpload from '@modules/FileUpload'

import { AllowedFiles } from '@schema'
import { ApiErrorMessage } from '@lib/ErrorMessage'
import { SelectReactHookForm } from '@modules/Select'
import { uploadFileForFlight } from '@api/flight'

interface FileUploadType {
  file: Blob
  producePlots?: boolean
  fileType: AllowedFiles
}

type FileUploadFormProps = {
  flightId: number
  insideModal?: boolean
}
export const FileUploadForm = ({ flightId, insideModal }: FileUploadFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FileUploadType>({
    mode: 'onBlur',
  })

  const uploadFile = useMutation(uploadFileForFlight, {
    onSuccess: (data) => {
      reset()
      toast('New file created', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })
    },
    onError: (error: AxiosError<any>) => {
      toast(<ApiErrorMessage error={error} />, {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
        delay: 1,
      })
    },
  })

  const fileType = watch('fileType')
  const heightCollapse = useSpring({
    height: fileType === AllowedFiles.LOG ? '80px' : '0px',
    opacity: fileType === AllowedFiles.LOG ? '100%' : '0%',
  })

  const onSubmit = handleSubmit((data, e) => {
    e?.preventDefault()

    uploadFile.mutate({ ...data, flightId })
  })

  return (
    <div className={clsx('flex w-full justify-center', insideModal ? 'mt-0 pb-12' : 'mt-32')}>
      <div className="min-w-[500px]">
        <h2 className="mb-16 text-center text-xl">UPLOAD NEW FILE</h2>
        <ToastContainer />
        <form
          id="file-form"
          className={`relative
                    `}
        >
          <div className="mb-12">
            <Controller
              control={control}
              name="file"
              rules={{
                required: true,
              }}
              render={() => (
                <FileUpload<FileUploadType> errors={errors} setValue={setValue} name="file" />
              )}
            />
          </div>
          <div className="mb-4 mt-4">
            <SelectReactHookForm<FileUploadType>
              register={register}
              errors={errors}
              rules={{
                required: true,
              }}
              name="fileType"
              options={(Object.keys(AllowedFiles) as Array<keyof typeof AllowedFiles>).map(
                (key) => {
                  return { name: AllowedFiles[key], value: AllowedFiles[key] }
                },
              )}
              placeholder="File type"
            />
          </div>
          <animated.div style={heightCollapse}>
            <SelectReactHookForm<FileUploadType>
              register={register}
              errors={errors}
              name="producePlots"
              options={[
                {
                  name: 'Yes - process this file to create timeseries plots for this flight (only files of type log can be processed)',
                  value: 'true',
                },
                { name: "No - it's just a normal file", value: 'false' },
              ]}
              placeholder="Should this file be processed?"
            />
          </animated.div>

          <Button
            buttonStyle="Main"
            className={`absolute
                        left-0
                        right-0
                        z-10
                        mt-12
                        h-16
                        w-full`}
            form="file-form"
            type="submit"
            onClick={onSubmit}
            disabled={Object.keys(errors).length > 0 || !isDirty}
          >
            Upload new file
          </Button>
        </form>
      </div>
    </div>
  )
}
