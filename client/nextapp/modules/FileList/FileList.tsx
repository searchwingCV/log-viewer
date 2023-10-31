/*TODO: We have to migrate to react-table v8 at some point. However, the documentation on migration 
  is still really bad. 
  https://tanstack.com/table/v8/docs/guide/migrating
*/
import { useMemo, useState } from 'react'
import { useTable, type Column, useSortBy } from 'react-table'
import clsx from 'clsx'
import { toast } from 'react-toastify'
import type { AxiosError } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import ModalOverlay from '@modules/ModalOverlay'

import { ApiErrorMessage } from '@lib/ErrorMessage'

import { RowActionButton } from '@modules/RowActionButton'
import { deleteFile } from '@api/flight/deleteFile'
import { ALL_FILES_BY_FLIGHT } from '@api/flight'

interface IFlightFile {
  id: number
  downloadLink: string
  name?: string
  uploaded?: string
  size?: string
  deleteLink: string
  type: string
}

export type FileListProps = {
  files: IFlightFile[]
}

export const FileList = ({ files }: FileListProps) => {
  const columns = useMemo(
    () => [
      {
        Header: 'File Id',
        accessor: 'id',
        width: 'w-[120px]',
      },

      //TODO: maybe add this later back if BE offers this data
      // {
      //   Header: 'Name',
      //   accessor: 'name',
      //   width: 'w-[200px]',
      // },

      // {
      //   Header: 'Uploaded',
      //   accessor: 'uploaded',
      //   width: 'w-[200px]',
      //   Cell: (props: any) => {
      //     if (isValid(parseISO(props.row.values.uploaded))) {
      //       return <span>{format(parseISO(props.row.values.uploaded), 'kk:ss:mm dd.MM.yyyy')}</span>
      //     } else {
      //       return <div></div>
      //     }
      //   },
      // },
      // {
      //   Header: 'Size',
      //   accessor: 'size',
      //   width: 'w-[120px]',
      // },

      {
        Header: 'Type',
        accessor: 'type',
        width: 'w-[150px]',
      },
      {
        Header: 'Download',
        accessor: 'downloadLink',
        width: 'w-[120px]',
        Cell: (props: any) => {
          return (
            <div className="flex justify-center text-xs">
              <RowActionButton
                tooltipText={'Download file'}
                url={`${process.env.NEXT_PUBLIC_API_URL}${props.row.values?.downloadLink}`}
                variant="download"
              />
            </div>
          )
        },
      },
      {
        Header: 'Delete',
        accessor: 'deleteLink',
        width: 'w-[120px]',
        Cell: (props: any) => {
          const [isModalOpen, setIsModalOpen] = useState(false)
          const queryClient = useQueryClient()
          const deleteMutation = useMutation(deleteFile, {
            onSuccess: async (data) => {
              toast('Flight deleted.', {
                type: 'success',
              })
              await queryClient.invalidateQueries([
                ALL_FILES_BY_FLIGHT,
                { flightId: data.flightId },
              ])
            },
            onError: (error: AxiosError<any>) => {
              toast(<ApiErrorMessage error={error} />, {
                type: 'error',
              })
            },
          })

          return (
            <div className="flex justify-center text-xs">
              <RowActionButton
                tooltipText={'Delete file'}
                url={props.row.values?.deleteLink}
                variant="delete"
                onClick={() => setIsModalOpen(true)}
              />

              <ModalOverlay
                modalTitle={'Are you sure you want to delete this file?'}
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                proceedAction={() => {
                  deleteMutation.mutate({ url: props.row.values?.deleteLink })
                }}
              >
                <div
                  className={`text-sm
                        text-gray-500`}
                >
                  <p>{`This action cannot be undone.`}</p>
                </div>
              </ModalOverlay>
            </div>
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
