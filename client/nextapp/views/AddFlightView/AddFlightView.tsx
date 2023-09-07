import { useState } from 'react'
import type { AxiosError } from 'axios'
import { animated, useSpring } from '@react-spring/web'
import { useForm, Controller } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import { pickBy } from 'lodash'
import { useMutation, useQueries } from '@tanstack/react-query'
import { FlightRating, FlightPurpose, type CreateFlightSerializer, AllowedFiles } from '@schema'
import Button from '@modules/Button'
import FileUpload from '@modules/FileUpload'
import { InputReactHookForm } from '@modules/Input/InputReactHookForm'
import { SelectReactHookForm } from '@modules/Select/SelectReactHookForm'
import { getDrones, ALL_DRONES_KEY } from '@api/drone'
import { getMissions, ALL_MISSIONS_KEY } from '@api/mission'
import { postFlight, putLogFile } from '@api/flight'
import { useGoToLastTablePage } from '@lib/hooks/useGoToLastTablePage'
import { ApiErrorMessage } from '@lib/ErrorMessage'

interface AddFlightForm extends CreateFlightSerializer {
  file?: Blob[]
}

// TODO: Add validation of files based on file_type AND extension

// export const validateLogFileType = (file: File) => {
//   const allowedFileTypes = (Object.keys(AllowedFiles) as Array<keyof typeof AllowedFiles>).map(
//     (key) => {
//       return AllowedFiles[key]
//     },
//   )
//   return !!allowedFileTypes.find((type) => file?.name?.endsWith(type))?.length
// }

export const determineFileType = (file: File) => {
  const allowedFileTypes = (Object.keys(AllowedFiles) as Array<keyof typeof AllowedFiles>).map(
    (key) => {
      return AllowedFiles[key]
    },
  )
  return allowedFileTypes.find((type) => type === file?.name?.split('.')[1])
}

export const AddFlightView = () => {
  const goToLastTableName = useGoToLastTablePage({ tableName: 'flights' })

  const [hasLogFile, setHasLogFile] = useState(false)
  const [selectedLogFile, setSelectedLogFile] = useState<Blob[] | undefined>(undefined)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<AddFlightForm>({
    criteriaMode: 'all',
    mode: 'onBlur',
  })

  //TODO: Turn into hook to avoid duplicate code
  const selectFieldData = useQueries({
    queries: [
      {
        queryKey: [ALL_DRONES_KEY, 1, 100],
        queryFn: () => getDrones(1, 100),
        staleTime: 10 * (60 * 1000), // 10 mins
      },
      {
        queryKey: [ALL_MISSIONS_KEY, 1, 100],
        queryFn: () => getMissions(1, 100),
        staleTime: 10 * (60 * 1000), // 10 mins
      },
    ],
  })

  const drones = selectFieldData?.[0]?.data?.items?.map((drone) => {
    return {
      value: drone.id,
      name: `${drone.name} - ${drone.id}`,
    }
  })

  const missions = selectFieldData?.[1]?.data?.items?.map((mission) => {
    return {
      value: mission.id,
      name: `${mission.name} - ${mission.id} || ${mission.startDate} - ${mission.endDate} in ${mission.location}`,
    }
  })

  const addFlight = useMutation(postFlight, {
    onSuccess: async (data) => {
      toast('Meta data for new flight posted.', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })

      await reset()
      if (!hasLogFile) {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        await goToLastTableName()
      } else {
        if (selectedLogFile) {
          putFile.mutate({
            file: selectedLogFile[0],
            fileType: AllowedFiles.LOG,
            flightId: data.id,
          })
        }
      }
    },
    onError: (error: AxiosError<any>) => {
      toast(<ApiErrorMessage error={error} />, {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
        delay: 1,
      })
    },
  })

  const putFile = useMutation(putLogFile, {
    onSuccess: async () => {
      toast('Log file for new flight submitted', {
        type: 'success',
        position: toast.POSITION.BOTTOM_CENTER,
      })

      await reset()
      if (hasLogFile) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        await goToLastTableName()
      }
    },

    onError: (error: AxiosError<any>) => {
      toast(<ApiErrorMessage error={error} />, {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
        delay: 1,
      })
    },
  })

  const heightCollapse = useSpring({
    height: hasLogFile ? '200px' : '0px',
    opacity: hasLogFile ? '100%' : '0%',
  })

  const onSubmit = handleSubmit((data, e) => {
    e?.preventDefault()
    if (hasLogFile) {
      setSelectedLogFile(data?.file)
    }
    const { file, ...rest } = data
    addFlight.mutate(pickBy(rest) as CreateFlightSerializer)
  })

  if (drones) {
    return (
      <>
        <ToastContainer />
        <form
          className={`relative w-[600px]
                      [&>div]:mt-8`}
          onSubmit={onSubmit}
        >
          <SelectReactHookForm<AddFlightForm>
            register={register}
            rules={{
              required: 'Drone is required',
            }}
            errors={errors}
            name="fkDrone"
            options={drones}
            placeholder="Drone"
          ></SelectReactHookForm>
          {missions ? (
            <SelectReactHookForm<AddFlightForm>
              register={register}
              errors={errors}
              name="fkMission"
              options={missions}
              placeholder="Mission"
            ></SelectReactHookForm>
          ) : null}
          <InputReactHookForm<AddFlightForm>
            name="location"
            register={register}
            rules={{
              required: 'Location required',
            }}
            errors={errors}
            placeholder="Location"
          ></InputReactHookForm>
          <InputReactHookForm<AddFlightForm>
            name="pilot"
            register={register}
            errors={errors}
            placeholder="Pilot"
          ></InputReactHookForm>
          <InputReactHookForm<AddFlightForm>
            name="observer"
            register={register}
            errors={errors}
            placeholder="Observer"
          ></InputReactHookForm>
          <InputReactHookForm<AddFlightForm>
            name="notes"
            register={register}
            errors={errors}
            placeholder="Notes"
          ></InputReactHookForm>
          <SelectReactHookForm<AddFlightForm>
            register={register}
            errors={errors}
            name="droneNeedsRepair"
            options={[
              { name: 'Yes', value: 'yes' },
              { name: 'No', value: 'no' },
            ]}
            placeholder="Drone Needs Repair?"
          ></SelectReactHookForm>
          <SelectReactHookForm<AddFlightForm>
            register={register}
            errors={errors}
            name="rating"
            options={(Object.keys(FlightRating) as Array<keyof typeof FlightRating>).map((key) => {
              return { name: FlightRating[key], value: FlightRating[key] }
            })}
            placeholder="Rating"
          ></SelectReactHookForm>
          <SelectReactHookForm<AddFlightForm>
            register={register}
            options={(Object.keys(FlightPurpose) as Array<keyof typeof FlightPurpose>).map(
              (key) => {
                return { name: FlightPurpose[key], value: FlightPurpose[key] }
              },
            )}
            errors={errors}
            name="purpose"
            placeholder="Purpose"
          ></SelectReactHookForm>

          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              className={`mr-4
                          h-5 w-5`}
              onChange={() => setHasLogFile(!hasLogFile)}
            />
            <span> Attach a log file </span>
          </div>

          <animated.div style={heightCollapse}>
            <Controller
              control={control}
              name="file"
              rules={{
                required: hasLogFile ? 'File is required' : false,
                // TODO: For now, no validation, in the future we need to change this

                // validate: {
                //   fileType: (file: any) =>
                //     !hasLogFile ||
                //     (file && validateLogFileType(file[0] as File)) ||
                //     'File must be a MAVLink binary log file with .bin or .log extensions',
                // },
              }}
              render={() => (
                <FileUpload<AddFlightForm>
                  errors={errors}
                  setValue={setValue}
                  name="file"
                  disabled={!hasLogFile}
                  hint={'File must be a MAVLink binary log file'}
                />
              )}
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
            type="submit"
          >
            Create new Flight
          </Button>
        </form>
      </>
    )
  }
  return null
}
