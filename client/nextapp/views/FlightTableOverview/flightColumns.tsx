import { format, parseISO, isValid } from 'date-fns'
import { Column } from 'react-table'
import { FlightSchemaTable } from '@schema/FlightSchema'
import EditableTableCell from 'modules/EditableTableCell'

export const flightColumns: Column<FlightSchemaTable>[] = [
  { Header: 'flightId', accessor: 'flightId' },

  {
    Header: 'planeId',
    accessor: 'planeId',
  },
  {
    Header: 'MissionId',
    accessor: 'missionId',
    Cell: (props: any) => {
      return <EditableTableCell name={`flight-${props.row.values.flightId}#${props.row.index}`} />
    },
    Aggregated: () => {
      return null
    },
    filter: 'fuzzyText',
  },
  {
    Header: 'Start Time',
    accessor: 'startTime',
    Cell: (props: any) => {
      if (isValid(parseISO(props.row.values.startTime))) {
        return <span> {format(parseISO(props.row.values.startTime), 'dd-MM-yyyy')}</span>
      } else {
        return null
      }
    },
    defaultCanFilter: false,
  },

  {
    Header: 'Pilot',
    accessor: 'pilot',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped) {
        return props.row.values.pilot
      }
      return (
        <EditableTableCell
          name={`pilot-${props.row.values.flightId}#${props.row.index}`}
          value={props.row.values.pilot}
        />
      )
    },
  },
  { Header: 'Average Speed', accessor: 'averageSpeed' },
  { Header: 'Temperature', accessor: 'temperature' },
  { Header: 'Latitude', accessor: 'latitude' },
  { Header: 'Longitude', accessor: 'longitude' },
  {
    Header: 'Notes',
    accessor: 'notes',

    Cell: (props: any) => {
      if (props.cell.isGrouped) {
        return props.row.values.pilot
      }
      return (
        <EditableTableCell
          name={`notes-${props.row.values.flightId}#${props.row.index}`}
          value={props.row.values.notes}
        />
      )
    },
  },
  { Header: 'CreatedAt', accessor: 'createdAt' },
  { Header: 'Observer', accessor: 'observer' },
  // {
  //   Header: 'Total Distance',
  //   accessor: 'distance',
  //   aggregate: 'sum',
  //   Aggregated: ({ value }) => <span>{`${value} (sum)`}</span>,
  // },
]
