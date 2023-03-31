import { useState, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import clsx from 'clsx'
import { HeaderGroup, ColumnInstance } from 'react-table'

type TableHeadProps = {
  headerGroups: HeaderGroup<any>[]
  allColumns: ColumnInstance<any>[]
  setColumnOrder: (updater: string[] | ((columnOrder: string[]) => string[])) => void
}

export const TableHead = ({ headerGroups, allColumns, setColumnOrder }: TableHeadProps) => {
  const currentColOrder = useRef<string[]>([])
  const [toggleMatrix, setToggleMatrix] = useState<{ propName: string; visible: boolean }[]>(
    allColumns.map((col) => {
      return { propName: col.id, visible: false }
    }),
  )

  return (
    <thead className="w-full">
      {headerGroups.map((headerGroup, index) => {
        const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps()
        return (
          <DragDropContext
            onDragStart={() => {
              currentColOrder.current = allColumns.map((o, i) => o.id)
            }}
            key={key}
            onDragEnd={(dragUpdateObj, b) => {
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
                      my-4
                      flex
                      w-full
                      rounded-xl
                      rounded-b
                      bg-x-indigo-to-petrol
                      pt-4
                      text-center
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
                           py-4
                           font-medium`,
                          column.width,
                        )}
                      >
                        <Draggable key={column.id} draggableId={column.id} index={index}>
                          {(provided, snapshot) => (
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
                              <div
                                className="min-h-[30px] min-w-full"
                                // className={clsx(
                                //   toggleMatrix.find((col) => col.propName === column.id)?.visible
                                //     ? 'visible'
                                //     : 'invisible',
                                // )}
                              >
                                {/* {column.canFilter ? column.render('Filter') : null} */}
                              </div>
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
