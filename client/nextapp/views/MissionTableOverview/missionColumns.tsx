import { format, parseISO, isValid } from 'date-fns'
import { Column } from 'react-table'

import { MissionSerializer } from '@schema'
import { DateInputCell, TextInputCell, determineWidth } from '~/modules/TableComponents'

export const missionColumns = (): Column<MissionSerializer>[] => [
  {
    Header: 'Mission Id',
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