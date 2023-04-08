import { format, parseISO, isValid } from 'date-fns'
import { Column } from 'react-table'
// import { FlightSchemaTable } from '@schema/FlightSchema'

import { FlightSerializer } from '@schema/FlightSerializer'
import { DateInputCell, TextInputCell } from '~/modules/TableComponents'
import { SelectInputCell } from '~/modules/TableComponents'

type ColumnType =
  | 'number'
  | 'text'
  | 'textInputLong'
  | 'textInputSmall'
  | 'selectInput'
  | 'date'
  | 'dateInput'
  | 'numberInput'

export const determineWidth = (columnType: ColumnType) => {
  switch (columnType) {
    case 'number':
      return 'w-[80px]'
    case 'text':
      return 'w-[100px]'
    case 'date':
      return 'w-[120px]'
    case 'dateInput':
      return 'w-[200px]'
    case 'textInputLong':
      return 'w-[250px]'
    case 'textInputSmall':
      return 'w-[200px]'
    case 'numberInput':
      return 'w-[150px]'
    case 'selectInput':
      return 'w-[200px]'
    default:
      return 'w-[150px]'
  }
}

export const flightColumns = (
  missionOptions?: { name: string; value: number }[],
  droneOptions?: { name: string; value: number }[],
): Column<FlightSerializer>[] => [
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
        return (
          <div>
            <SelectInputCell
              name={`fkDronwe-${props.row.values.id}-${props.row.index}`}
              options={droneOptions}
              defaultValue={props.row.values.fkDrone || undefined}
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
        return (
          <SelectInputCell
            name={`fkMission-${props.row.values.id}-${props.row.index}`}
            options={missionOptions}
            defaultValue={props.row.values.fkMission || undefined}
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
        return <div>{props.row.values.pilot}</div>
      }

      return (
        <TextInputCell
          name={`pilot-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.pilot}
        />
      )
    },
    width: determineWidth('textInputSmall'),
  },
  // {
  //   Header: 'Description',
  //   accessor: 'description',
  //   Aggregated: () => {
  //     return null
  //   },
  //   Cell: (props: any) => {
  //     if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
  //       return <div>{props.row.values.description}</div>
  //     }

  //     return (
  //       <TextInputCell
  //         name={`description-${props.row.values.id}-${props.row.index}`}
  //         defaultValue={props.row.values.description}
  //       />
  //     )
  //   },
  //   width: determineWidth('textInputLong'),
  // },

  {
    Header: 'Location',
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
          name={`location-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.location}
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

      return (
        <SelectInputCell
          name={`rating-${props.row.values.id}-${props.row.index}`}
          options={[
            { name: 'Good flight', value: 'good' },
            { name: 'Problems', value: 'problems' },
            { name: 'Crash', value: 'crash' },
          ]}
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
          name={`rating-${props.row.values.id}-${props.row.index}`}
          options={[
            { name: 'Yes', value: 'yes' },
            { name: 'No', value: 'no' },
          ]}
          defaultValue={props.row.values.droneNeedsRepair || undefined}
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
          name={`purpose-${props.row.values.id}-${props.row.index}`}
          options={[
            { name: 'Mission', value: 'mission' },
            { name: 'Pilot Training', value: 'pilot-training' },
            { name: 'Test', value: 'test' },
          ]}
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
          name={`notes-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.notes}
        />
      )
    },
    width: determineWidth('textInputLong'),
  },

  //weather api /computed

  // {
  //   Header: 'Weather Conditions',
  //   accessor: 'weatherConditions',
  //   Cell: (props: any) => {
  //     if (props.row.values.weatherConditions && props.row.values.weatherConditions.length) {
  //       return props.row.values.weatherConditions.join(', ')
  //     }
  //     return null
  //   },

  //   width: determineWidth('text'),
  // },
  {
    Header: 'Wind',
    accessor: 'wind',
    width: determineWidth('text'),
  },
  {
    Header: 'Temperature',
    accessor: 'temperatureCelsius',
    width: determineWidth('number'),
  },

  //from log
  {
    Header: 'Start Time',
    accessor: 'logStartTime',
    Cell: (props: any) => {
      if (isValid(parseISO(props.row.values.startTime))) {
        return <div>{format(parseISO(props.row.values.startTime), 'hh:ss:mm dd.MM.yyyy')}</div>
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
        return <div>{format(parseISO(props.row.values.startTime), 'hh:ss:mm dd.MM.yyyy')}</div>
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
  },
  {
    Header: 'CreatedAt',
    accessor: 'createdAt',
    Cell: (props: any) => {
      if (isValid(parseISO(props.row.values.createdAt))) {
        return <div>{format(parseISO(props.row.values.createdAt), 'hh:ss:mm dd.MM.yyyy')}</div>
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
        return <div>{format(parseISO(props.row.values.createdAt), 'hh:ss:mm dd.MM.yyyy')}</div>
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
  },
  {
    Header: 'Start Longitufe',
    accessor: 'startLongitude',
    width: determineWidth('text'),
  },
  {
    Header: 'End Latitude',
    accessor: 'endLatitude',
    width: determineWidth('text'),
  },
  {
    Header: 'End Longitude',
    accessor: 'endLongitude',
    width: determineWidth('text'),
  },
  {
    Header: 'Energy consumed in Wh',
    accessor: 'energyConsumedWh',
    width: determineWidth('number'),
  },
  {
    Header: 'Min Power in W',
    accessor: 'minPowerW',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Power in W',
    accessor: 'maxPowerW',
    width: determineWidth('number'),
  },
  {
    Header: 'Avg Power in W',
    accessor: 'avgPowerW',
    width: determineWidth('number'),
  },
  {
    Header: 'Min Battery Voltage in V',
    accessor: 'minBatteryVoltage',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Battery Voltage in V',
    accessor: 'maxBatteryVoltage',
    width: determineWidth('number'),
  },
  // {
  //   Header: 'Avg Battery Voltage in V',
  //   accessor: 'avgBatteryVoltage',
  //   width: determineWidth('number'),
  // },
  {
    Header: 'Delta Battery Voltage in V',
    accessor: 'deltaBatteryVoltage',
    width: determineWidth('number'),
  },
  // {
  //   Header: 'Min Battery Current in A',
  //   accessor: 'minBatteryCurrent',
  //   width: determineWidth('number'),
  // },
  // {
  //   Header: 'Max Battery Current in A',
  //   accessor: 'maxBatCurrent',
  //   width: determineWidth('number'),
  // },
  // {
  //   Header: 'Avg Battery Current in A',
  //   accessor: 'avgBatCurrent',
  //   width: determineWidth('number'),
  // },
  {
    Header: 'Min Ground Speed in km/h',
    accessor: 'minGroundspeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Ground Speed in km/h',
    accessor: 'maxGroundspeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Avg Ground Speed in km/h',
    accessor: 'avgGroundspeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Min Air Speed in km/h',
    accessor: 'minAirspeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Air Speed in km/h',
    accessor: 'maxAirspeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Avg Air Speed in km/h',
    accessor: 'avgAirspeed',
    width: determineWidth('number'),
  },

  {
    Header: 'Avg Wind Speed in km/h',
    accessor: 'avgWindspeedKmh',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Vertical Speed Upwards in km/h',
    accessor: 'maxVerticalSpeedUp',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Vertical Speed Downwards km/h',
    accessor: 'maxVerticalSpeedDown',
    width: determineWidth('number'),
  },
  // {
  //   Header: 'Max Speed Horizontal in km/h',
  //   accessor: 'maxSpeedHorizontal',
  //   width: determineWidth('number'),
  // },
  {
    Header: 'Max Telemetry Distance in km',
    accessor: 'maxTelemetryDistanceKm',
    width: determineWidth('number'),
  },
  {
    Header: 'Total Distance in km',
    accessor: 'distanceKm',
    width: determineWidth('number'),
  },
  // {
  //   Header: 'Flight Duration in hh:mm:ss',
  //   accessor: 'flightDuration',
  //   width: determineWidth('number'),
  // },

  {
    Header: 'Hardware Version',
    accessor: 'hardwareVersion',
    width: determineWidth('text'),
  },
  {
    Header: 'Firmware Version',
    accessor: 'firmwareVersion',
    width: determineWidth('text'),
  },
]
