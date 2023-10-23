import { useContext } from 'react'
import Button from 'modules/Button'
import { UIContext, getTableDrawerState } from '@lib/Context/ContextProvider'
import type { TableType } from '@lib/globalTypes'

export const ToggleCustomizeOrder = ({ drawerKey }: { drawerKey: TableType }) => {
  const { tableDrawerToggleTypeState, tableDrawerTypeToggleDispatch } = useContext(UIContext)

  const handleToggleDrawer = () => {
    if (tableDrawerToggleTypeState) {
      const matchingDrawerstate = getTableDrawerState({
        type: drawerKey,
        tableDrawerState: tableDrawerToggleTypeState,
      })
      tableDrawerTypeToggleDispatch?.({ type: drawerKey, payload: !matchingDrawerstate })
    }
  }

  if (!tableDrawerToggleTypeState) {
    return null
  }
  return (
    <div
      className="py-4
                text-primary-white"
    >
      <Button
        id="toggleCustomizeOrder"
        type="button"
        buttonStyle="Main"
        className={`min-w-[250px]
                    px-2
                    py-3
                    `}
        onClick={() => handleToggleDrawer()}
      >
        {getTableDrawerState({
          type: drawerKey,
          tableDrawerState: tableDrawerToggleTypeState,
        })
          ? 'Close order customization'
          : 'Customize Order'}
      </Button>
    </div>
  )
}
