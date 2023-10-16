/*TODO: We have to migrate to react-table v8 at some point. However, the documentation on migration 
  is still really bad. 
  https://tanstack.com/table/v8/docs/guide/migrating
*/
import { useMemo } from 'react'
import { format, parseISO, isValid, intervalToDuration } from 'date-fns'
import {
  useTable,
  type Column,
  type Row,
  usePagination,
  type TableInstance,
  type UsePaginationInstanceProps,
  type UsePaginationState,
  useGroupBy,
  useSortBy,
  useRowSelect,
  useExpanded,
  useFilters,
  useGlobalFilter,
  useColumnOrder,
} from 'react-table'
import clsx from 'clsx'
import { Button } from 'modules/Button/Button'
import { RowActionButton } from '@modules/RowActionButton'

interface IFlightFile {
  id: number
  downloadLink: string
  name: string
  uploaded: string
  size: string
  deleteLink: string
}

export type FileListProps = {
  files: IFlightFile[]
}

export const FileList = ({ files }: FileListProps) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Id',
        accessor: 'id',
        width: 'w-[60px]',
      },
      {
        Header: 'Name',
        accessor: 'name',
        width: 'w-[200px]',
      },

      {
        Header: 'Uploaded',
        accessor: 'uploaded',
        width: 'w-[200px]',
        Cell: (props: any) => {
          if (isValid(parseISO(props.row.values.uploaded))) {
            return <span>{format(parseISO(props.row.values.uploaded), 'kk:ss:mm dd.MM.yyyy')}</span>
          } else {
            return <div></div>
          }
        },
      },
      {
        Header: 'Size',
        accessor: 'size',
        width: 'w-[80px]',
      },
      {
        Header: 'Download',
        accessor: 'downloadLink',
        width: 'w-[100px]',

        Cell: (props: any) => {
          return (
            <RowActionButton
              tooltipText={'Download file'}
              url={props.row.values?.downloadLink}
              variant="download"
            />
          )
        },
      },
      {
        Header: 'Delete',
        accessor: 'deleteLink',
        width: 'w-[80px]',
        Cell: (props: any) => {
          return (
            <RowActionButton
              tooltipText={'Delete file'}
              url={props.row.values?.deleteLink}
              variant="delete"
            />
          )
        },
      },
    ],
    [],
  )

  const table = useTable({ columns: columns as Column<IFlightFile>[], data: files }, useSortBy)

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = table

  return (
    <div className=" relative overflow-x-auto rounded-md">
      <table {...getTableProps()} className="w-full border-separate border-spacing-0 ">
        <thead
          className="h-12
                     bg-primary-light-petrol text-white"
        >
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.getHeaderGroupProps().key}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={clsx(
                    'text-center',
                    column.width,
                    column.isSorted ? (column.isSortedDesc ? 'desc' : 'asc') : '',
                  )}
                  key={column.getHeaderProps(column.getSortByToggleProps()).key}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()} key={row.getRowProps().key}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      key={cell.getCellProps().key}
                      className={clsx(
                        cell.column.width,
                        `border-b border-grey-medium
                      
                    p-3 text-center

                      
                      
                      `,
                      )}
                    >
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
