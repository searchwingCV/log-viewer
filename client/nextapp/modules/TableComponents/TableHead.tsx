import { useState, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import clsx from 'clsx'
import type { HeaderGroup, ColumnInstance } from 'react-table'

type TableHeadProps = {
  headerGroups: HeaderGroup<any>[]
  allColumns: ColumnInstance<any>[]
  setColumnOrder: (updater: string[] | ((columnOrder: string[]) => string[])) => void
  hasLongHeaderNames?: boolean
}

export const TableHead = ({
  headerGroups,
  allColumns,
  setColumnOrder,
  hasLongHeaderNames,
}: TableHeadProps) => {
  const currentColOrder = useRef<string[]>([])
  const [toggleMatrix, setToggleMatrix] = useState<{ propName: string; visible: boolean }[]>(
    allColumns.map((col) => {
      return { propName: col.id, visible: false }
    }),
  )

  return (
    <thead className="w-full">
      {headerGroups.map((headerGroup) => {
        const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps()
        return (
          <DragDropContext
            onDragStart={() => {
              currentColOrder.current = allColumns.map((o) => o.id)
            }}
            key={key}
            onDragEnd={(dragUpdateObj) => {
              const colOrder = [...currentColOrder.current]
              const sIndex = dragUpdateObj.source.index
              const dIndex = dragUpdateObj.destination && dragUpdateObj.destination.index

              if (typeof sIndex === 'number' && typeof dIndex === 'number') {
                colOrder.splice(sIndex, 1)
                colOrder.splice(dIndex, 0, dragUpdateObj.draggableId)
                setColumnOrder(colOrder)
              }
            }}
          >
            <Droppable droppableId="droppable" direction="horizontal">
              {(droppableProvided) => (
                <tr
                  {...restHeaderGroupProps}
                  key={key}
                  {...droppableProvided.droppableProps}
                  ref={droppableProvided.innerRef}
                  className={clsx(
                    `!focus:border-black
                      flex
                      w-full
                      items-center
                      rounded-xl
                      rounded-b
                      bg-x-indigo-to-petrol
                      text-center
                      text-xs
                      text-primary-white`,
                  )}
                >
                  {headerGroup.headers.map((column, index) => {
                    const { key, ...restHeaderProps } = column.getHeaderProps(
                      column.getSortByToggleProps(),
                    )
                    return (
                      <th
                        key={key}
                        className={clsx(
                          `mx-4
                           font-medium`,
                          column.width,
                          hasLongHeaderNames
                            ? ` -mb-4
                                pt-2`
                            : `-mb-2
                               pt-4`,
                        )}
                      >
                        <Draggable key={column.id} draggableId={column.id} index={index}>
                          {(provided) => (
                            <div
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                            >
                              <button
                                className={`peer
                                            flex
                                            w-full
                                            flex-col
                                            items-center
                                            justify-center`}
                                type="button"
                                onClick={() => {
                                  const isTargetVisible = toggleMatrix.find(
                                    (prop) => prop.propName === column.id,
                                  )?.visible
                                  const withoutTarget = toggleMatrix.filter(
                                    (prop) => prop.propName !== column.id,
                                  )

                                  setToggleMatrix([
                                    {
                                      propName: column.id,
                                      visible: !isTargetVisible,
                                    },
                                    ...withoutTarget,
                                  ])
                                }}
                                {...restHeaderProps}
                              >
                                {column.render('Header')}
                                <div className="scale-2">
                                  {column.isSorted ? (column.isSortedDesc ? '▼' : '▲') : ''}
                                </div>
                              </button>
                              <div className="min-h-[30px] min-w-full"></div>
                            </div>
                          )}
                        </Draggable>
                      </th>
                    )
                  })}
                </tr>
              )}
            </Droppable>
          </DragDropContext>
        )
      })}
    </thead>
  )
}
