import { format, parseISO, isValid } from 'date-fns'
import { Column } from 'react-table'
import { DroneSerializer, DroneStatus } from '@schema'
import { TextInputCell, determineWidth, SelectInputCell } from '~/modules/TableComponents'

export const droneColumns = (): Column<DroneSerializer>[] => [
  {
    Header: 'Drone Id',
    accessor: 'id',
    width: determineWidth('number'),
  },
  {
    Header: 'Name',
    accessor: 'name',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.name}</div>
      }

      return (
        <TextInputCell
          name={`name-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.name}
        />
      )
    },
    width: determineWidth('textInputSmall'),
  },

  {
    Header: 'Model',
    accessor: 'model',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.model}</div>
      }

      return (
        <TextInputCell
          name={`model-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.model}
        />
      )
    },
    width: determineWidth('textInputSmall'),
  },
  {
    Header: 'Status',
    accessor: 'status',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.status}</div>
      }

      if (props.onlyGroupedFlatRows.length) {
        return props.row.values.status
      }

      return (
        <SelectInputCell
          name={`status-${props.row.values.id}-${props.row.index}`}
          options={(Object.keys(DroneStatus) as Array<keyof typeof DroneStatus>).map((key) => {
            return { name: DroneStatus[key], value: DroneStatus[key] }
          })}
          defaultValue={props.row.values.status || undefined}
        />
      )
    },
    width: determineWidth('selectInput'),
  },

  {
    Header: 'SysThismav',
    accessor: 'sysThismav',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.sysThismav}</div>
      }

      return (
        <TextInputCell
          name={`sysThismav-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.sysThismav}
          type="number"
          min={1}
        />
      )
    },
    width: determineWidth('numberInput'),
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
          name={`description-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.description}
        />
      )
    },
    width: determineWidth('textInputLong'),
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
]
