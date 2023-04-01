import { useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { ColumnInstance } from 'react-table'

type CustomizeOrderProps = {
  allColumns: ColumnInstance<any>[]
  setColumnOrder: (updater: string[] | ((columnOrder: string[]) => string[])) => void
}

export const CustomizeOrder = ({ allColumns, setColumnOrder }: CustomizeOrderProps) => {
  const currentColOrder = useRef<string[]>([])
  return (
    <div
      className="h-full
                bg-grey-super-dark
                px-4
                py-8
                text-[13px]
                text-primary-white"
    >
      <DragDropContext
        onDragStart={() => {
          currentColOrder.current = allColumns.map((o, i) => o.id)
        }}
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
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {allColumns.map((item, index) => (
                <Draggable draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      className="py-1"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {typeof item?.Header === 'string' ? (
                        <div>
                          <span className="mr-2">
                            <input
                              type="checkbox"
                              id={item?.id}
                              name={item?.id}
                              value={item?.id}
                              {...item.getToggleHiddenProps()}
                            />
                          </span>
                          {`[${index}] ${item?.Header}`}
                        </div>
                      ) : null}
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
