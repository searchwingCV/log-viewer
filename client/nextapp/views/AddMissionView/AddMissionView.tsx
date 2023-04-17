import { useForm } from 'react-hook-form'
import type { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { ToastContainer, toast } from 'react-toastify'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateMissionSerializer, DroneStatus } from '@schema'
import Button from '~/modules/Button'
import { InputReactHookForm } from '~/modules/Input/InputReactHookForm'
import { SelectReactHookForm } from '~/modules/Select/SelectReactHookForm'
import { postMission } from '~/api/mission/postMission'

export const AddMissionView = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMissionSerializer>({
    criteriaMode: 'all',
    mode: 'onBlur',
  })

  const addMission = useMutation(postMission, {
    onSettled: () => {},
    onSuccess: async (data) => {
      toast('Mission added.', {
        type: 'success',
      })
      reset()

      await new Promise((resolve) => setTimeout(resolve, 1000))
      await router.push('/mission-overview')
    },
    onError: async (data: AxiosError) => {
      toast(
        (JSON.stringify((data?.response?.data as any).detail) || 'error submitting data') as string,
        {
          type: 'error',
        },
      )
      //TODO find out why error message disappears immediately without a timeout
      await new Promise((resolve) => setTimeout(resolve, 100))
    },
  })

  const onSubmit = handleSubmit(async (data, e) => {
    e?.preventDefault()

    addMission.mutate(data)
  })

  return (
    <>
      <ToastContainer />
      <form className="w-[600px] [&>div]:mt-8" onSubmit={onSubmit}>
        <InputReactHookForm<CreateMissionSerializer>
          name="name"
          register={register}
          rules={{
            required: 'Name required',
          }}
          errors={errors}
          placeholder="Name"
        ></InputReactHookForm>
        <InputReactHookForm<CreateMissionSerializer>
          name="description"
          register={register}
          rules={{
            required: 'Description required',
          }}
          errors={errors}
          placeholder="Description"
        ></InputReactHookForm>
        <InputReactHookForm<CreateMissionSerializer>
          name="location"
          register={register}
          rules={{}}
          errors={errors}
          placeholder="Location"
        ></InputReactHookForm>
        <InputReactHookForm<CreateMissionSerializer>
          name="startDate"
          register={register}
          rules={{
            required: 'Start Date required',
          }}
          type="date"
          errors={errors}
          placeholder="Start Date"
        ></InputReactHookForm>
        <InputReactHookForm<CreateMissionSerializer>
          name="endDate"
          register={register}
          rules={{
            required: 'End Date required',
          }}
          type="date"
          errors={errors}
          placeholder="End Date"
        ></InputReactHookForm>
        <InputReactHookForm<CreateMissionSerializer>
          name="partnerOrganization"
          register={register}
          rules={{}}
          errors={errors}
          placeholder="Partner Organization"
        ></InputReactHookForm>
        <Button buttonStyle="Main" className="mt-12 h-16 w-full" type="submit">
          Create new Mission
        </Button>
      </form>
    </>
  )
}
