import { useForm } from 'react-hook-form'
import type { AxiosError } from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import { useMutation } from '@tanstack/react-query'
import { CreateDroneSerializer, DroneStatus } from '@schema'
import Button from '~/modules/Button'
import { InputReactHookForm } from '~/modules/Input/InputReactHookForm'
import { SelectReactHookForm } from '~/modules/Select/SelectReactHookForm'
import { postDrone } from '~/api/drone/postDrone'
import { useRouter } from 'next/router'

export const AddDroneView = () => {
  const router = useRouter()
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
    onSuccess: async (data) => {
      toast('Data changed.', {
        type: 'success',
      })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await reset()
      await router.push('/drone-overview')
    },
    onError: async (data: AxiosError) => {
      //TODO: better error messages
      toast('error submitting data' as string, {
        type: 'error',
      })

      //TODO find out why error message disappears immediately without a timeout
      await new Promise((resolve) => setTimeout(resolve, 100))
    },
  })

  const onSubmit = handleSubmit(async (data, e) => {
    e?.preventDefault()
    addDrone.mutate(data)
  })

  return (
    <>
      <ToastContainer />
      <form className="w-[600px] [&>div]:mt-8" onSubmit={onSubmit}>
        <ToastContainer autoClose={5000} />
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
          rules={{}}
          errors={errors}
          placeholder="Description"
        ></InputReactHookForm>
        <InputReactHookForm<CreateDroneSerializer>
          name="sysThismav"
          register={register}
          rules={{}}
          type="number"
          errors={errors}
          placeholder="Systhismav"
        ></InputReactHookForm>
        <SelectReactHookForm
          register={register}
          rules={{}}
          errors={errors}
          name="status"
          options={(Object.keys(DroneStatus) as Array<keyof typeof DroneStatus>).map((key) => {
            return { name: DroneStatus[key], value: DroneStatus[key] }
          })}
          placeholder="Status"
        ></SelectReactHookForm>
        <Button buttonStyle="Main" className="mt-12 h-16 w-full" type="submit">
          Create new Drone
        </Button>
      </form>
    </>
  )
}
