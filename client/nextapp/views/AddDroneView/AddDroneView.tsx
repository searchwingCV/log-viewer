import { useForm } from 'react-hook-form'
import clsx from 'clsx'
import { CreateDroneSerializer } from '@schema'
import Button from '~/modules/Button'
import { InputReactHookForm } from '~/modules/Input/InputReactHookForm'
export const AddDroneView = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateDroneSerializer>({
    criteriaMode: 'all',
    mode: 'onSubmit',
  })

  const onSubmit = handleSubmit(async (data) => {
    console.log(data)
  })

  return (
    <div className="flex h-full justify-center pt-[200px]">
      <form className="w-[400px]">
        <InputReactHookForm<CreateDroneSerializer>
          name="name"
          register={register}
          rules={{
            required: true,
          }}
          errors={errors}
          placeholder="Name"
        ></InputReactHookForm>
        <InputReactHookForm<CreateDroneSerializer>
          name="model"
          register={register}
          rules={{
            required: true,
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
        <Button buttonStyle="Main" className="mt-8 h-12 w-full" type="submit">
          Create new Drone
        </Button>
      </form>
    </div>
  )
}
