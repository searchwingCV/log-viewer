import { format, parseISO, isValid } from 'date-fns'
import { Column } from 'react-table'
import { FlightSchemaTable } from '@schema/FlightSchema'
import { DateInputCell, TextInputCell } from '~/modules/TableComponents'
import { SelectInputCell } from '~/modules/TableComponents'

type ColumnType =
  | 'number'
  | 'text'
  | 'textInput'
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
    case 'textInput':
      return 'w-[250px]'
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
    width: determineWidth('number'),
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
          <div>
            <SelectInputCell
              name={`mission-${props.row.values.flightId}-${props.row.index}`}
              options={missionOptions}
              defaultValue={props.row.values.missionId || undefined}
            />
          </div>
        )
      }

      return <span>no missions yet</span>
    },
    width: determineWidth('selectInput'),
  },
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
    width: determineWidth('selectInput'),
  },
  {
    Header: 'Avg Speed',
    accessor: 'averageSpeed',
    width: determineWidth('number'),
  },
  {
    Header: 'Temperature',
    accessor: 'temperature',
    width: determineWidth('number'),
  },
  {
    Header: 'Latitude',
    accessor: 'latitude',
    width: determineWidth('number'),
  },
  {
    Header: 'Longitude',
    accessor: 'longitude',
    width: determineWidth('number'),
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
    width: determineWidth('textInput'),
  },
  {
    Header: 'CreatedAt',
    accessor: 'createdAt',
    width: determineWidth('dateInput'),
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return props.row.values.notes
      }

      return (
        <DateInputCell
          name={`createdAt-${props.row.values.flightId}-${props.row.index}`}
          defaultValue={props.row.values.createdAt}
        />
      )
    },
  },
  {
    Header: 'Observer',
    accessor: 'observer',
    width: determineWidth('numberInput'),
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return props.row.values.notes
      }

      return (
        <TextInputCell
          name={`observer-${props.row.values.flightId}-${props.row.index}`}
          defaultValue={props.row.values.observer}
          type="number"
        />
      )
    },
  },

  // {
  //   Header: 'Total Distance',
  //   accessor: 'distance',
  //   aggregate: 'sum',
  //   Aggregated: ({ value }) => <span>{`${value} (sum)`}</span>,
  // },
]
