import { useRef, useEffect, useCallback, useContext } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import type { ColumnInstance } from 'react-table'
import { UIContext, getTableDrawerState } from '@lib/Context/ContextProvider'
import CircleIconButton from '@modules/CircleIconButton'
import type { TableType } from '@lib/globalTypes'

type CustomizeOrderProps = {
  allColumns: ColumnInstance<any>[]
  setColumnOrder: (updater: string[] | ((columnOrder: string[]) => string[])) => void
  drawerKey: TableType
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
          currentColOrder.current = allColumns.map((o) => o.id)
        }}
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
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {allColumns.map((item, index) => (
                <Draggable draggableId={item.id} index={index} key={`${item.id}-${index}`}>
                  {(provided) => (
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

export const CustomizeColumnsDrawer = ({
  allColumns,
  setColumnOrder,
  drawerKey,
}: CustomizeOrderProps) => {
  const { tableDrawerToggleTypeState, tableDrawerTypeToggleDispatch } = useContext(UIContext)

  const isExtended = getTableDrawerState({
    type: drawerKey,
    tableDrawerState: tableDrawerToggleTypeState,
  })

  const ref = useRef<HTMLDivElement>(null)

  const closeDrawer = useCallback(() => {
    tableDrawerTypeToggleDispatch?.({ type: drawerKey, payload: false })
  }, [tableDrawerTypeToggleDispatch, drawerKey])

  const slideX = useSpring({
    transform: isExtended ? 'translate3d(0px,0,0)' : `translate3d(-280px,0,0)`,
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref &&
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        (event.target as HTMLElement).id !== 'toggleCustomizeOrder'
      ) {
        closeDrawer()
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [ref, closeDrawer])

  return (
    <animated.div
      className={`fixed
                  bottom-0
                  top-0
                  z-10
                  h-full
                  w-side-drawer
                  `}
      style={slideX}
      ref={ref}
    >
      {isExtended ? (
        <CircleIconButton
          addClasses={`fixed
                     top-[50px]
                     -right-6
                     z-30`}
          iconClassName={isExtended ? 'chevron-left' : 'chevron-right'}
          onClick={() => {
            closeDrawer()
          }}
        />
      ) : null}
      <div
        className={`h-screen
                    overflow-y-scroll
                    bg-grey-super-dark`}
      >
        <div className={`relative`}>
          <CustomizeOrder
            allColumns={allColumns}
            setColumnOrder={setColumnOrder}
            drawerKey={drawerKey}
          />
        </div>
      </div>
    </animated.div>
  )
}
