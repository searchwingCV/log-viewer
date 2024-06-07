import { useState } from 'react'
import { format, parseISO, isValid, intervalToDuration } from 'date-fns'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import type { Column } from 'react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import { FlightRating, FlightPurpose, FileService } from '@schema'
import { TextInputCell, SelectInputCell, determineWidth, TippyValueWrapper } from '@modules/Table'
import type { TableFlightSerializer } from '@lib/globalTypes'
import { FileUploadForm } from '@modules/FileUploadForm'
import { RowActionButton } from '@modules/RowActionButton/RowActionButton'
import ModalOverlay from '@modules/ModalOverlay'
import { deleteFlight, getFlights } from '@api/flight'
import { ApiErrorMessage } from '@lib/ErrorMessage'
import { ALl_FLIGHTS_KEY } from '@api/flight'
import { processFlight } from '@api/flight/processFlights'
import { numberOfFilesSavedForFlight } from '../functions'

export const flightColumns = (
  missionOptions?: { name: string; value: number }[],
  droneOptions?: { name: string; value: number }[],
  totalNumber?: number,
): Column<TableFlightSerializer>[] => [
  {
    Header: 'Actions',
    accessor: 'buttons',
    width: determineWidth('buttons'),
    Cell: (props: any) => {
      const router = useRouter()

      const [isModalOpenDelete, setIsModalOpenDelete] = useState(false)
      const [isModalOpenUpload, setIsModalOpenUpload] = useState(false)
      const [isModalOpenProcess, setIsModalOpenProcess] = useState(false)
      const queryClient = useQueryClient()
      const { page: queryPage, pagesize: queryPageSize } = router.query

      const deleteMutation = useMutation(deleteFlight, {
        onSuccess: async (data) => {
          toast('Flight deleted.', {
            type: 'success',
          })
          await queryClient.invalidateQueries([
            ALl_FLIGHTS_KEY,
            parseInt(queryPage as string) || 1,
            parseInt(queryPageSize as string) || 10,
          ])
        },
        onError: (error: AxiosError<any>) => {
          toast(<ApiErrorMessage error={error} />, {
            type: 'error',
          })
        },
      })
      const processMutation = useMutation(processFlight, {
        onSuccess: async (_) => {
          toast('Processing flight.', {
            type: 'success',
          })
          await queryClient.invalidateQueries([
            ALl_FLIGHTS_KEY,
            parseInt(queryPage as string) || 1,
            parseInt(queryPageSize as string) || 10,
          ])
        },
        onError: (error: AxiosError<any>) => {
          toast(<ApiErrorMessage error={error} />, {
            type: 'error',
          })
        },
      })
      return (
        <div className="flex justify-center">
          <RowActionButton
            variant="delete"
            tooltipText="Delete flight"
            onClick={() => setIsModalOpenDelete(true)}
          />
          <RowActionButton
            variant="link"
            tooltipText="Go to file manager page"
            linkTitle="go to flight filemanager page"
            url={`/filemanager/${props.row.original.id}?curentPageSize=${queryPageSize}&currentPageCount=${queryPage}&totalNumber=${totalNumber}`}
          />
          <RowActionButton
            variant="upload"
            onClick={() => setIsModalOpenUpload(true)}
            tooltipText="Upload a log file for creating plot data and a flight detail page"
          />
          <RowActionButton
            variant="process"
            tooltipText="Process a flight"
            onClick={() => setIsModalOpenProcess(true)}
          />
          <ModalOverlay
            modalTitle={'Are you sure you want to trigger a re-processing of this flight?'}
            isOpen={isModalOpenProcess}
            closeModal={() => setIsModalOpenProcess(false)}
            proceedAction={() => {
              processMutation.mutate({ flightId: props.row.values.id })
            }}
          >
            <div
              className={`text-sm
                        text-gray-500`}
            >
              <p>
                This will re-write the flight messages in the database, and re-calculate the flight properties.
              </p>
            </div>
          </ModalOverlay>
          <ModalOverlay
            modalTitle={'Are you sure you want to delete this flight?'}
            isOpen={isModalOpenDelete}
            linkProps={{
              link: `/filemanager/${props.row.original.id}?curentPageSize=${queryPageSize}&currentPageCount=${queryPage}&totalNumber=${totalNumber}`,
              linkText: 'See files',
            }}
            closeModal={() => setIsModalOpenDelete(false)}
            proceedAction={() => {
              deleteMutation.mutate({ flightId: props.row.values.id })
            }}
          >
            <div
              className={`text-sm
                        text-gray-500`}
            >
              <p>
                This action cannot be undone. All the files uploaded to this flight will also be
                deleted.
              </p>
              <p>
                {`Number of files that are going to be deleted: 
              ${numberOfFilesSavedForFlight(props.row.original)}`}
              </p>
            </div>
          </ModalOverlay>

          <ModalOverlay
            modalTitle={''}
            isOpen={isModalOpenUpload}
            closeModal={() => setIsModalOpenUpload(false)}
            hideCancelButton
          >
            <div
              className={`text-sm
                        text-gray-500`}
            >
              <FileUploadForm flightId={props.row.original.id} insideModal />
            </div>
          </ModalOverlay>
        </div>
      )
    },
  },

  {
    Header: 'Flight Id',
    accessor: 'id',
    width: determineWidth('number'),
  },
  {
    Header: 'Drone',
    accessor: 'fkDrone',
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.fkDrone}</div>
      }
      if (props.onlyGroupedFlatRows.length) {
        return props.row.values.fkDrone
      }
      if (droneOptions && droneOptions.length) {
        const fkNumber = props.row.values.fkDrone.split('- ').pop()

        return (
          <div>
            <SelectInputCell
              isForeignKeyPicker
              headerName={props.column.Header}
              name={`fkDrone-${props.row.values.id}-${props.row.index}`}
              options={droneOptions}
              defaultValue={parseInt(fkNumber) || undefined}
              required
              hasNoDeleteValue
            />
          </div>
        )
      }
      return <span>no planes yet</span>
    },
    width: determineWidth('selectInput'),
  },
  {
    accessor: 'fkMission',
    Header: 'Mission',
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.fkMission}</div>
      }

      if (props.onlyGroupedFlatRows.length) {
        return props.row.values.fkMission
      }
      if (missionOptions && missionOptions.length) {
        const fkNumber = props.row.values?.fkMission?.split('- ').pop()
        return (
          <SelectInputCell
            isForeignKeyPicker
            headerName={props.column.Header}
            name={`fkMission-${props.row.values.id}-${props.row.index}`}
            options={missionOptions}
            defaultValue={parseInt(fkNumber) || undefined}
            hasNoDeleteValue
          />
        )
      }

      return <span>no missions yet</span>
    },
    width: determineWidth('selectInput'),
  },

  {
    Header: 'Pilot',
    accessor: 'pilot',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.pilot}</div>
      }

      return (
        <TextInputCell
          headerName={props.column.Header}
          name={`pilot-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.pilot}
        />
      )
    },
    width: determineWidth('textInputSmall'),
  },

  {
    Header: 'Observer',
    accessor: 'observer',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.observer}</div>
      }

      return (
        <TextInputCell
          headerName={props.column.Header}
          name={`observer-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.observer}
        />
      )
    },
    width: determineWidth('textInputSmall'),
  },

  {
    Header: 'Location (not nullable)',
    accessor: 'location',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.location}</div>
      }

      return (
        <TextInputCell
          headerName={props.column.Header}
          name={`location-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.location}
          hasNoDeleteValue
        />
      )
    },
    width: determineWidth('textInputSmall'),
  },

  {
    Header: 'Rating',
    accessor: 'rating',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.rating}</div>
      }

      if (props.onlyGroupedFlatRows.length) {
        return props.row.values.rating
      }

      return (
        <SelectInputCell
          headerName={props.column.Header}
          name={`rating-${props.row.values.id}-${props.row.index}`}
          options={(Object.keys(FlightRating) as Array<keyof typeof FlightRating>).map((key) => {
            return { name: FlightRating[key], value: FlightRating[key] }
          })}
          hasNoDeleteValue
          defaultValue={props.row.values.rating || undefined}
        />
      )
    },
    width: determineWidth('selectInput'),
  },

  {
    Header: 'Drone needs repair?',
    accessor: 'droneNeedsRepair',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.droneNeedsRepair}</div>
      }

      return (
        <SelectInputCell
          headerName={props.column.Header}
          name={`droneNeedsRepair-${props.row.values.id}-${props.row.index}`}
          options={[
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ]}
          hasNoDeleteValue
          defaultValue={
            props.row.values.droneNeedsRepair === true
              ? true
              : props.row.values.droneNeedsRepair === false
              ? false
              : undefined
          }
        />
      )
    },
    width: determineWidth('selectInput'),
  },
  {
    Header: 'Purpose',
    accessor: 'purpose',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.purpose}</div>
      }

      return (
        <SelectInputCell
          headerName={props.column.Header}
          hasNoDeleteValue
          name={`purpose-${props.row.values.id}-${props.row.index}`}
          options={(Object.keys(FlightPurpose) as Array<keyof typeof FlightPurpose>).map((key) => {
            return { name: FlightPurpose[key], value: FlightPurpose[key] }
          })}
          defaultValue={props.row.values.purpose || undefined}
        />
      )
    },
    width: determineWidth('selectInput'),
  },
  {
    Header: 'Notes',
    accessor: 'notes',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return props.row.values.notes
      }
      return (
        <TextInputCell
          headerName={props.column.Header}
          name={`notes-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.notes}
        />
      )
    },
    width: determineWidth('textInputLong'),
  },

  //weather api /computed

  {
    Header: 'Wind',
    accessor: 'wind',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Temperature',
    accessor: 'temperatureCelsius',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },

  //from log
  {
    Header: 'Start Time',
    accessor: 'logStartTime',
    Cell: (props: any) => {
      if (isValid(parseISO(props.row.values.logStartTime))) {
        return (
          <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value}>
            <div>{format(parseISO(props.row.values.logStartTime), 'kk:ss:mm dd.MM.yyyy')}</div>
          </TippyValueWrapper>
        )
      } else {
        return <div></div>
      }
    },
    width: determineWidth('date'),
  },
  {
    Header: 'End Time',
    accessor: 'logEndTime',
    Cell: (props: any) => {
      if (isValid(parseISO(props.row.values.logEndTime))) {
        return (
          <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value}>
            <div>{format(parseISO(props.row.values.logEndTime), 'kk:ss:mm dd.MM.yyyy')}</div>
          </TippyValueWrapper>
        )
      } else {
        return <div></div>
      }
    },
    width: determineWidth('date'),
  },
  {
    Header: 'Log Duration in hh:mm:ss',
    accessor: 'logDuration',
    width: determineWidth('number'),
    Cell: (props: any) => {
      const interval = intervalToDuration({ start: 0, end: props.cell.value * 1000 })

      if (interval) {
        return (
          <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value}>
            {`${interval?.hours && (interval.hours === 0 ? '00' : interval.hours < 10 ? '0' : '')}${
              interval.hours
            }:${
              interval.minutes && (interval.minutes === 0 ? '00' : interval.minutes < 10 ? '0' : '')
            }${interval.minutes}:${
              interval.seconds && (interval.minutes === 0 ? '00' : interval.seconds < 10 ? '0' : '')
            }${interval.seconds}`}
          </TippyValueWrapper>
        )
      }

      return null
    },
  },
  {
    Header: 'CreatedAt',
    accessor: 'createdAt',
    Cell: (props: any) => {
      if (isValid(parseISO(props.row.values.createdAt))) {
        return (
          <div>
            {' '}
            <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value}>
              {format(parseISO(props.row.values.createdAt), 'kk:ss:mm dd.MM.yyyy')}
            </TippyValueWrapper>
          </div>
        )
      } else {
        return <div></div>
      }
    },
    width: determineWidth('date'),
  },
  {
    Header: 'UpdatedAt',
    accessor: 'updatedAt',
    Cell: (props: any) => {
      if (isValid(parseISO(props.row.values.createdAt))) {
        return (
          <div>
            {' '}
            <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value}>
              {format(parseISO(props.row.values.createdAt), 'kk:ss:mm dd.MM.yyyy')}
            </TippyValueWrapper>
          </div>
        )
      } else {
        return <div></div>
      }
    },
    width: determineWidth('date'),
  },
  {
    Header: 'Start Latitude',
    accessor: 'startLatitude',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Start Longitude',
    accessor: 'startLongitude',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'End Latitude',
    accessor: 'endLatitude',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'End Longitude',
    accessor: 'endLongitude',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Energy consumed in Wh',
    accessor: 'energyConsumedWh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Min Power in W',
    accessor: 'minPowerW',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Max Power in W',
    accessor: 'maxPowerW',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Avg Power in W',
    accessor: 'avgPowerW',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Min Battery Voltage in V',
    accessor: 'minBatteryVoltage',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Max Battery Voltage in V',
    accessor: 'maxBatteryVoltage',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Delta Battery Voltage in V',
    accessor: 'deltaBatteryVoltage',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },

  {
    Header: 'Min Ground Speed in km/h',
    accessor: 'minGroundspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Max Ground Speed in km/h',
    accessor: 'maxGroundspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Avg Ground Speed in km/h',
    accessor: 'avgGroundspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Min Air Speed in km/h',
    accessor: 'minAirspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Max Air Speed in km/h',
    accessor: 'maxAirspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Avg Air Speed in km/h',
    accessor: 'avgAirspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },

  {
    Header: 'Avg Wind Speed in km/h',
    accessor: 'avgWindspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Max Vertical Speed Upwards in km/h',
    accessor: 'maxVerticalSpeedUpKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Max Vertical Speed Downwards km/h',
    accessor: 'maxVerticalSpeedDownKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Max Telemetry Distance in km',
    accessor: 'maxTelemetryDistanceKm',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Total Distance in km',
    accessor: 'distanceKm',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },

  {
    Header: 'Hardware Version',
    accessor: 'hardwareVersion',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
  {
    Header: 'Firmware Version',
    accessor: 'firmwareVersion',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return <TippyValueWrapper tableHeadName={props.column.Header} value={props.cell.value} />
    },
  },
]
