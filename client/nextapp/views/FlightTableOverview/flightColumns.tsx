import { format, parseISO, isValid } from 'date-fns'
import { Column } from 'react-table'
import { FlightSchemaTable } from '@schema/FlightSchema'
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
  missionOptions?: { name: string; value: string }[],
): Column<FlightSchemaTable>[] => [
  {
    Header: 'Flight Id',
    accessor: 'flightId',
    width: determineWidth('number'),
  },

  {
    Header: 'Drone',
    accessor: 'planeId',
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.planeId}</div>
      }
      if (props.onlyGroupedFlatRows.length) {
        return props.row.values.mission
      }
      if (missionOptions && missionOptions.length) {
        return (
          <div>
            <SelectInputCell
              name={`planeId-${props.row.values.flightId}-${props.row.index}`}
              options={missionOptions}
              defaultValue={props.row.values.planeId || undefined}
            />
          </div>
        )
      }
      return <span>no planes yet</span>
    },
    width: determineWidth('selectInput'),
  },
  {
    accessor: 'missionId',
    Header: 'Mission',
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.missionId}</div>
      }

      if (props.onlyGroupedFlatRows.length) {
        return props.row.values.mission
      }
      if (missionOptions && missionOptions.length) {
        return (
          <SelectInputCell
            name={`missionId-${props.row.values.flightId}-${props.row.index}`}
            options={missionOptions}
            defaultValue={props.row.values.missionId || undefined}
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
          name={`pilot-${props.row.values.flightId}-${props.row.index}`}
          defaultValue={props.row.values.pilot}
        />
      )
    },
    width: determineWidth('textInputSmall'),
  },
  {
    Header: 'Description',
    accessor: 'description',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.description}</div>
      }

      return (
        <TextInputCell
          name={`description-${props.row.values.flightId}-${props.row.index}`}
          defaultValue={props.row.values.description}
        />
      )
    },
    width: determineWidth('textInputLong'),
  },

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
          name={`location-${props.row.values.flightId}-${props.row.index}`}
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
          name={`rating-${props.row.values.flightId}-${props.row.index}`}
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
          name={`rating-${props.row.values.flightId}-${props.row.index}`}
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
          name={`purpose-${props.row.values.flightId}-${props.row.index}`}
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
          name={`notes-${props.row.values.flightId}-${props.row.index}`}
          defaultValue={props.row.values.notes}
        />
      )
    },
    width: determineWidth('textInputLong'),
  },

  //weather api /computed

  {
    Header: 'Weather Conditions',
    accessor: 'weatherConditions',
    Cell: (props: any) => {
      if (props.row.values.weatherConditions && props.row.values.weatherConditions.length) {
        return props.row.values.weatherConditions.join(', ')
      }
      return null
    },

    width: determineWidth('text'),
  },
  {
    Header: 'Temperature',
    accessor: 'temperature',
    width: determineWidth('number'),
  },

  //from log
  {
    Header: 'Start Time',
    accessor: 'startTime',
    Cell: (props: any) => {
      if (isValid(parseISO(props.row.values.startTime))) {
        return <div>{format(parseISO(props.row.values.startTime), 'dd.MM.yyyy')}</div>
      } else {
        return <div></div>
      }
    },
    width: determineWidth('date'),
  },
  {
    Header: 'CreatedAt',
    accessor: 'createdAt',
    Cell: (props: any) => {
      if (isValid(parseISO(props.row.values.createdAt))) {
        return <div>{format(parseISO(props.row.values.createdAt), 'dd.MM.yyyy')}</div>
      } else {
        return <div></div>
      }
    },
    width: determineWidth('date'),
  },

  {
    Header: 'Energy consumed in Wh',
    accessor: 'energyConsumed',
    width: determineWidth('number'),
  },
  {
    Header: 'Min Power in W',
    accessor: 'minPower',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Power in W',
    accessor: 'maxPower',
    width: determineWidth('number'),
  },
  {
    Header: 'Avg Power in W',
    accessor: 'avgPower',
    width: determineWidth('number'),
  },
  {
    Header: 'Min Battery Voltage in V',
    accessor: 'minBatVoltage',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Battery Voltage in V',
    accessor: 'maxBatVoltage',
    width: determineWidth('number'),
  },
  {
    Header: 'Avg Battery Voltage in V',
    accessor: 'avgBatVoltage',
    width: determineWidth('number'),
  },
  {
    Header: 'Delta Battery Voltage in V',
    accessor: 'deltaBatVoltage',
    width: determineWidth('number'),
  },
  {
    Header: 'Min Battery Current in A',
    accessor: 'minBatCurrent',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Battery Current in A',
    accessor: 'maxBatCurrent',
    width: determineWidth('number'),
  },
  {
    Header: 'Avg Battery Current in A',
    accessor: 'avgBatCurrent',
    width: determineWidth('number'),
  },
  {
    Header: 'Min Ground Speed in km/h',
    accessor: 'minGroundSpeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Ground Speed in km/h',
    accessor: 'maxGroundSpeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Avg Ground Speed in km/h',
    accessor: 'avgGroundSpeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Min Air Speed in km/h',
    accessor: 'minAirSpeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Air Speed in km/h',
    accessor: 'maxAirSpeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Avg Air Speed in km/h',
    accessor: 'avgAirSpeed',
    width: determineWidth('number'),
  },

  {
    Header: 'Avg Wind Speed in km/h',
    accessor: 'avgWindSpeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Speed Upwards in km/h',
    accessor: 'maxSpeedUp',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Speed Downwards km/h',
    accessor: 'maxSpeedDown',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Speed Horizontal in km/h',
    accessor: 'maxSpeedHorizontal',
    width: determineWidth('number'),
  },
  {
    Header: 'Max Telemetary Distance in km',
    accessor: 'maxTelemetaryDistance',
    width: determineWidth('number'),
  },
  {
    Header: 'Total Distance in km',
    accessor: 'totalDistance',
    width: determineWidth('number'),
  },
  {
    Header: 'Flight Duration in hh:mm:ss',
    accessor: 'flightDuration',
    width: determineWidth('number'),
  },
  {
    Header: 'Log Duration in hh:mm:ss',
    accessor: 'logDuration',
    width: determineWidth('number'),
  },
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
