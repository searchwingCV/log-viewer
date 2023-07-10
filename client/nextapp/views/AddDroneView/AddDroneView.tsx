import { useForm } from 'react-hook-form'
import type { AxiosError } from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import { useMutation } from '@tanstack/react-query'
import { type CreateDroneSerializer, DroneStatus } from '@schema'
import Button from '~/modules/Button'
import { InputReactHookForm } from '~/modules/Input/InputReactHookForm'
import { SelectReactHookForm } from '~/modules/Select/SelectReactHookForm'
import { postDrone } from '~/api/drone/postDrone'
import { ApiErrorMessage } from '@lib/ErrorMessage'
import { useGoToLastTablePage } from '@lib/hooks/useGoToLastTablePage'

export const AddDroneView = () => {
  const goToLastTableName = useGoToLastTablePage({ tableName: 'drones' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDroneSerializer>({
    criteriaMode: 'all',
    mode: 'onBlur',
  })

  const addDrone = useMutation(postDrone, {
    onSuccess: async () => {
      toast('Data changed.', {
        type: 'success',
      })

      await reset()
      await goToLastTableName()
    },
    onError: async (error: AxiosError<any>) => {
      await toast(<ApiErrorMessage error={error} />, {
        type: 'error',
        delay: 1,
      })
    },
  })

  const onSubmit = handleSubmit((data, e) => {
    e?.preventDefault()
    addDrone.mutate(data)
  })

  return (
    <>
      <ToastContainer />
      <form
        className={`w-[600px]
                    [&>div]:mt-8`}
        onSubmit={onSubmit}
      >
        <InputReactHookForm<CreateDroneSerializer>
          name="name"
          register={register}
          rules={{
            required: 'Name required',
          }}
          errors={errors}
          placeholder="Name"
        ></InputReactHookForm>
        <InputReactHookForm<CreateDroneSerializer>
          name="model"
          register={register}
          rules={{
            required: 'Model required',
          }}
          errors={errors}
          placeholder="Model"
        ></InputReactHookForm>
        <InputReactHookForm<CreateDroneSerializer>
          name="description"
          register={register}
          errors={errors}
          placeholder="Description"
        ></InputReactHookForm>
        <InputReactHookForm<CreateDroneSerializer>
          name="sysThismav"
          register={register}
          type="number"
          errors={errors}
          placeholder="Systhismav"
          rules={{
            required: 'SysThismav required',
          }}
        ></InputReactHookForm>
        <SelectReactHookForm
          register={register}
          errors={errors}
          name="status"
          options={(Object.keys(DroneStatus) as Array<keyof typeof DroneStatus>).map((key) => {
            return { name: DroneStatus[key], value: DroneStatus[key] }
          })}
          rules={{
            required: 'Status required',
          }}
          placeholder="Status"
        ></SelectReactHookForm>
        <Button
          buttonStyle="Main"
          className={`mt-12
                      h-16
                      w-full`}
          type="submit"
        >
          Create new Drone
        </Button>
      </form>
    </>
  )
}
