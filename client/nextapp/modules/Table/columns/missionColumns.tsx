import { format, parseISO, isValid } from 'date-fns'
import type { Column } from 'react-table'
import type { MissionSerializer } from '@schema'
import { DateInputCell, TextInputCell, determineWidth, TippyValueWrapper } from '@modules/Table'

export const missionColumns = (): Column<MissionSerializer>[] => [
  {
    Header: 'Mission Id',
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
    Header: 'Partner Organization',
    accessor: 'partnerOrganization',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.partnerOrganization}</div>
      }

      return (
        <TextInputCell
          headerName={props.column.Header}
          name={`partnerOrganization-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.partnerOrganization}
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
          headerName={props.column.Header}
          name={`description-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.description}
        />
      )
    },
    width: determineWidth('textInputLong'),
  },
  {
    Header: 'Start Date',
    accessor: 'startDate',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.startDate}</div>
      }

      return (
        <DateInputCell
          name={`startDate-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.startDate}
          headerName={props.column.Header}
        />
      )
    },
    width: determineWidth('dateInput'),
  },
  {
    Header: 'End Date',
    accessor: 'endDate',
    Aggregated: () => {
      return null
    },
    Cell: (props: any) => {
      if (props.cell.isGrouped || props.onlyGroupedFlatRows.length) {
        return <div>{props.row.values.endDate}</div>
      }

      return (
        <DateInputCell
          name={`endDate-${props.row.values.id}-${props.row.index}`}
          defaultValue={props.row.values.endDate}
          headerName={props.column.Header}
        />
      )
    },
    width: determineWidth('dateInput'),
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
