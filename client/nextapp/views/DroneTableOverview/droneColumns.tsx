import { format, parseISO, isValid } from 'date-fns'
import type { Column } from 'react-table'
import { type DroneSerializer, DroneStatus } from '@schema'
import {
  TextInputCell,
  determineWidth,
  SelectInputCell,
  TippyValueWrapper,
} from '~/modules/TableComponents'

export const droneColumns = (): Column<DroneSerializer>[] => [
  {
    Header: 'Drone Id',
    accessor: 'id',
    width: determineWidth('number'),
  },
  {
    Header: 'Name (not nullable)',
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
          headerName={props.column.Header}
          name={`name-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.name}
          hasNoDeleteValue
        />
      )
    },
    width: determineWidth('textInputSmall'),
  },

  {
    Header: 'Model (not nullable)',
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
          headerName={props.column.Header}
          name={`model-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.model}
          hasNoDeleteValue
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
          headerName={props.column.Header}
          name={`status-${props.row.values.id}-${props.row.index}`}
          options={(Object.keys(DroneStatus) as Array<keyof typeof DroneStatus>).map((key) => {
            return { name: DroneStatus[key], value: DroneStatus[key] }
          })}
          defaultValue={props.row.values.status || undefined}
          hasNoDeleteValue
        />
      )
    },
    width: determineWidth('selectInput'),
  },

  {
    Header: 'SysThismav (not nullable)',
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
          headerName={props.column.Header}
          name={`sysThismav-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.sysThismav}
          type="number"
          min={1}
          hasNoDeleteValue
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
          headerName={props.column.Header}
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
        return (
          <TippyValueWrapper tableHeadName={props.column.Header}>
            <div>{format(parseISO(props.row.values.createdAt), 'kk:ss:mm dd.MM.yyyy')}</div>
          </TippyValueWrapper>
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
          <TippyValueWrapper tableHeadName={props.column.Header}>
            <div>{format(parseISO(props.row.values.createdAt), 'kk:ss:mm dd.MM.yyyy')}</div>{' '}
          </TippyValueWrapper>
        )
      } else {
        return <div></div>
      }
    },
    width: determineWidth('date'),
  },
]
