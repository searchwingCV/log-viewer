import { format, parseISO, isValid, intervalToDuration } from 'date-fns'
import type { Column } from 'react-table'
import { FlightRating, FlightPurpose } from '@schema'
import {
  TextInputCell,
  SelectInputCell,
  determineWidth,
  TippyValueWrapper,
} from '~/modules/TableComponents'
import type { TableFlightSerializer } from './FlightTableOverview'

export const flightColumns = (
  missionOptions?: { name: string; value: number }[],
  droneOptions?: { name: string; value: number }[],
): Column<TableFlightSerializer>[] => [
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
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Temperature',
    accessor: 'temperatureCelsius',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },

  //from log
  {
    Header: 'Start Time',
    accessor: 'logStartTime',
    Cell: (props: any) => {
      if (isValid(parseISO(props.row.values.startTime))) {
        return (
          <TippyValueWrapper tableHeadName={props.column.Header}>
            <div>{format(parseISO(props.row.values.startTime), 'hh:ss:mm dd.MM.yyyy')}</div>
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
      if (isValid(parseISO(props.row.values.startTime))) {
        return (
          <TippyValueWrapper tableHeadName={props.column.Header}>
            <div>{format(parseISO(props.row.values.startTime), 'hh:ss:mm dd.MM.yyyy')}</div>
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
          <TippyValueWrapper tableHeadName={props.column.Header}>
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
            <TippyValueWrapper tableHeadName={props.column.Header}>
              {format(parseISO(props.row.values.createdAt), 'hh:ss:mm dd.MM.yyyy')}
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
            <TippyValueWrapper tableHeadName={props.column.Header}>
              {format(parseISO(props.row.values.createdAt), 'hh:ss:mm dd.MM.yyyy')}
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
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Start Longitude',
    accessor: 'startLongitude',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'End Latitude',
    accessor: 'endLatitude',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'End Longitude',
    accessor: 'endLongitude',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Energy consumed in Wh',
    accessor: 'energyConsumedWh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Min Power in W',
    accessor: 'minPowerW',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Max Power in W',
    accessor: 'maxPowerW',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Avg Power in W',
    accessor: 'avgPowerW',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Min Battery Voltage in V',
    accessor: 'minBatteryVoltage',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Max Battery Voltage in V',
    accessor: 'maxBatteryVoltage',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Delta Battery Voltage in V',
    accessor: 'deltaBatteryVoltage',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },

  {
    Header: 'Min Ground Speed in km/h',
    accessor: 'minGroundspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Max Ground Speed in km/h',
    accessor: 'maxGroundspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Avg Ground Speed in km/h',
    accessor: 'avgGroundspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Min Air Speed in km/h',
    accessor: 'minAirspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Max Air Speed in km/h',
    accessor: 'maxAirspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Avg Air Speed in km/h',
    accessor: 'avgAirspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },

  {
    Header: 'Avg Wind Speed in km/h',
    accessor: 'avgWindspeedKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Max Vertical Speed Upwards in km/h',
    accessor: 'maxVerticalSpeedUpKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Max Vertical Speed Downwards km/h',
    accessor: 'maxVerticalSpeedDownKmh',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Max Telemetry Distance in km',
    accessor: 'maxTelemetryDistanceKm',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Total Distance in km',
    accessor: 'distanceKm',
    width: determineWidth('number'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },

  {
    Header: 'Hardware Version',
    accessor: 'hardwareVersion',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
  {
    Header: 'Firmware Version',
    accessor: 'firmwareVersion',
    width: determineWidth('text'),
    Cell: (props: any) => {
      return (
        <TippyValueWrapper tableHeadName={props.column.Header}>
          {props.cell.value}
        </TippyValueWrapper>
      )
    },
  },
]
