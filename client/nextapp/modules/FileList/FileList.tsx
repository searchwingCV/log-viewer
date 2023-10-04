/*TODO: We have to migrate to react-table v8 at some point. However, the documentation on migration 
  is still really bad. 
  https://tanstack.com/table/v8/docs/guide/migrating
*/
import { useMemo } from 'react'
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

interface IFlightFile {
  id: number
  downloadLink: string
  name: string
  uploaded: string
  size: string
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
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Download',
        accessor: 'downloadLink',
      },
      {
        Header: 'Uploaded',
        accessor: 'uploaded',
      },
      {
        Header: 'Size',
        accessor: 'size',
      },
    ],
    [],
  )

  const table = useTable({ columns: columns as Column<IFlightFile>[], data: files }, useSortBy)

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = table

  return (
    <div className="container">
      {/* Apply the table props */}
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.getHeaderGroupProps().key}>
              {headerGroup.headers.map((column) => (
                // Aplicamos las propiedades de ordenación a cada columna
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={column.isSorted ? (column.isSortedDesc ? 'desc' : 'asc') : ''}
                  key={column.getHeaderProps(column.getSortByToggleProps()).key}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {
            // Loop over the table rows
            rows.map((row) => {
              // Prepare the row for display
              prepareRow(row)
              return (
                // Apply the row props
                <tr {...row.getRowProps()} key={row.getRowProps().key}>
                  {row.cells.map((cell) => {
                    // Apply the cell props
                    return (
                      <td {...cell.getCellProps()} key={cell.getCellProps().key}>
                        {
                          // Render the cell contents
                          cell.render('Cell')
                        }
                      </td>
                    )
                  })}
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}
