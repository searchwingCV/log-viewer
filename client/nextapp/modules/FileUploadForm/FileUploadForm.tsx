import { useState } from 'react'
import type { AxiosError } from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import { useMutation } from '@tanstack/react-query'
import Button from '@modules/Button'
import FileUpload from '@modules/FileUpload'

import { useGoToLastTablePage } from '@lib/hooks/useGoToLastTablePage'

interface FileUploadType {
  file?: Blob[]
}

export const FileUploadForm = () => {
  const goToLastTableName = useGoToLastTablePage({ tableName: 'flights' })

  const [selectedLogFile, setSelectedLogFile] = useState<Blob[] | undefined>(undefined)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FileUploadType>({
    criteriaMode: 'all',
    mode: 'onBlur',
  })

  //   const addFlight = useMutation(postFlight, {
  //     onSuccess: async (data) => {
  //       toast('Meta data for new flight posted.', {
  //         type: 'success',
  //         position: toast.POSITION.BOTTOM_CENTER,
  //       })

  //       await reset()
  //       await new Promise((resolve) => setTimeout(resolve, 2000))
  //     },
  //     onError: (error: AxiosError<any>) => {
  //       toast(<ApiErrorMessage error={error} />, {
  //         type: 'error',
  //         position: toast.POSITION.BOTTOM_CENTER,
  //         delay: 1,
  //       })
  //     },
  //   })

  const onSubmit = handleSubmit((data, e) => {
    e?.preventDefault()
    setSelectedLogFile(data?.file)

    const { file, ...rest } = data
    //addFlight.mutate(pickBy(rest) as CreateFlightSerializer)
  })

  return (
    <div className="mt-48 min-w-[500px] px-8">
      <h2 className="mb-16 text-center text-xl font-bold">UPLOAD NEW FILE</h2>

      <ToastContainer />
      <form
        className={`relative
                    `}
        onSubmit={onSubmit}
      >
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

        <Button
          buttonStyle="Main"
          className={`absolute
                        left-0
                        right-0
                        z-10
                        mt-12
                        h-16
                        w-full`}
          type="submit"
        >
          Upload new file
        </Button>
      </form>
    </div>
  )
}
