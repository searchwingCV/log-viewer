import { type ReactNode, useContext } from 'react'
import { useRouter } from 'next/router'
import { type ColumnInstance } from 'react-table'
import useMedia from '@charlietango/use-media'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { animated, useSpring } from '@react-spring/web'
import { ToastContainer } from 'react-toastify'
import type { TableType } from '@lib/globalTypes'
import Select from 'modules/Select'
import Button from 'modules/Button'
import { UIContext, getTableDrawerState } from '@lib/Context/ContextProvider'
import { CustomizeColumnsDrawer } from './CustomizeColumnsDrawer'
import { GlobalTextFilter } from './GlobalTextFilter'
import { ToggleCustomizeOrder } from './ToggleCustomizeOrder'
import { Pagination } from './Pagination'

export type TableFrameProps<TTableFrameColumnInstance extends object> = {
  children: ReactNode
  pageCount: number
  pageSize: number
  totalNumber: number
  pageOptions: number[]
  pageIndex: number
  tableType: TableType
  groupByOptions: { name: string; value: string }[]
  allColumns: ColumnInstance<TTableFrameColumnInstance>[]
  setColumnOrder: (updater: string[] | ((columnOrder: string[]) => string[])) => void
  setGlobalFilter: (filterValue: string) => void
  globalFilter: string
  setGroupBy: (value: [string]) => void
  width?: number
}

const TableFrame = <TTableFrameColumnInstance extends object>({
  children,
  pageCount,
  pageSize,
  totalNumber,
  pageOptions,
  pageIndex,
  tableType,
  groupByOptions,
  allColumns,
  setColumnOrder,
  setGlobalFilter,
  setGroupBy,
  globalFilter,
  width,
}: TableFrameProps<TTableFrameColumnInstance>) => {
  const { tableDrawerToggleTypeState } = useContext(UIContext)

  const router = useRouter()
  const matches = useMedia({ minWidth: 1920 })

  const sideNavExtended = getTableDrawerState({
    type: tableType,
    tableDrawerState: tableDrawerToggleTypeState,
  })

  const slideX = useSpring({
    transform: sideNavExtended ? 'translate3d(20px,0,0)' : `translate3d(-240px,0,0)`,
    minWidth: sideNavExtended ? 'calc(100vw - 270px)' : `calc(100vw - 0px)`,
  })

  if (!tableDrawerToggleTypeState) {
    return null
  }

  return (
    <div
      className={`flex-column
                  flex
                  min-h-screen
                  
                `}
    >
      <ToastContainer />
      <CustomizeColumnsDrawer
        allColumns={allColumns}
        setColumnOrder={setColumnOrder}
        drawerKey={tableType}
      />
      <animated.div
        className={clsx(`ml-side-drawer-width
                         h-screen
                         overflow-x-hidden
                         px-12`)}
        style={slideX}
      >
        <div
          style={
            width
              ? {
                  maxWidth: matches ? width + 40 : '100%',
                }
              : {}
          }
          className={`
                      relative
                      mx-auto                     
                      mb-40
                      pb-12
                      pl-2
                      pr-8
                      pt-20`}
        >
          <div
            className={`mb-4
                        grid
                        grid-cols-[minmax(700px,_1fr)_200px]
                        grid-rows-2
                        items-end
                        gap-x-8
                        gap-y-2`}
          >
            <GlobalTextFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />

            <Select
              name="groupby"
              placeholder="Group by"
              options={groupByOptions}
              onSetValue={setGroupBy}
              defaultValue="None"
              hasResetButton={true}
              resetButtonText={'Reset Group'}
            />
          </div>
          <div className="flex">
            <div
              className={`pr-4
                          pt-4`}
            >
              <Button
                isSpecial={true}
                buttonStyle="Main"
                className={`w-[250px]
                            px-6
                            py-3`}
                onClick={async () => {
                  await router.push(
                    `/add/${tableType.toLowerCase()}?curentPageSize=${pageSize}&currentPageCount=${pageCount}&totalNumber=${totalNumber}`,
                  )
                }}
              >
                <FontAwesomeIcon icon={'plus-circle'} height="32" className="scale-150" />
                <span className="ml-3">{`Add new ${tableType}`}</span>
              </Button>
            </div>
            <ToggleCustomizeOrder drawerKey={tableType} />
          </div>

          {children}

          <Pagination
            pageSize={pageSize}
            pageCount={pageCount}
            pageIndex={pageIndex}
            pageOptions={pageOptions}
            totalNumber={totalNumber}
          />
        </div>

        <div
          className={`mb-4
                        grid
                        grid-cols-[minmax(700px,_1fr)_200px]
                        grid-rows-2
                        items-end
                        gap-x-8
                        gap-y-2`}
        ></div>
      </animated.div>
    </div>
  )
}

export default TableFrame
