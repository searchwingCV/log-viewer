import { useForm } from 'react-hook-form'
import type { AxiosError } from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import { useMutation } from '@tanstack/react-query'
import type { CreateMissionSerializer } from '@schema'
import { ApiErrorMessage } from '@lib/ErrorMessage'
import Button from '@modules/Button'
import { InputReactHookForm } from '@modules/Input'
import { postMission } from '@api/mission'
import { useGoToLastTablePage } from '@lib/hooks/useGoToLastTablePage'

export const AddMissionView = () => {
  const goToLastTableName = useGoToLastTablePage({ tableName: 'missions' })

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
    onSuccess: async () => {
      toast('Mission added.', {
        type: 'success',
      })
      reset()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await goToLastTableName()
    },

    onError: (error: AxiosError<any>) => {
      toast(<ApiErrorMessage error={error} />, {
        type: 'error',
        delay: 1,
      })
    },
  })

  const onSubmit = handleSubmit((data, e) => {
    e?.preventDefault()

    addMission.mutate(data)
  })

  return (
    <>
      <ToastContainer />
      <form
        className={`w-[600px]
                    [&>div]:mt-8`}
        onSubmit={onSubmit}
      >
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
          errors={errors}
          placeholder="Partner Organization"
        ></InputReactHookForm>
        <Button
          buttonStyle="Main"
          className={`mt-12
                      h-16
                      w-full`}
          type="submit"
        >
          Create new Mission
        </Button>
      </form>
    </>
  )
}
