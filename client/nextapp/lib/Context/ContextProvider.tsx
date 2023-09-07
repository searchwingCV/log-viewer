/*
  This context provider is used to manage the state of the UI and has nothing
  to do with backend data. It is used to manage the state of the table drawer
  and plot drawer.
  It is used in the following components:
  - client/nextapp/modules/TableComponents/Table.tsx
  - client/nextapp/modules/PlotDrawer/PlotDrawer.tsx
  - client/nextapp/modules/Table/components/CustomizeColumnsDrawer.tsx
  - client/nextapp/modules/Table/components/ToggleCustomizeOrder.tsx
  - client/nextapp/views/FlightComparisonView/FlightComparisonView.tsx
  - client/nextapp/views/FlightDetailView/FlightDetailView.tsx
*/

import { type ReactNode, useReducer, useState, createContext, type Dispatch } from 'react'
import { TableType } from '@lib/globalTypes'

export type TableDrawerToggleAction = {
  type: TableType
  payload: boolean
}

export type TableDrawerState = {
  missionTableDrawerToggle: boolean
  flightTableDrawerToggle: boolean
  droneTableDrawerToggle: boolean
}

export type ContextProps = {
  setTableDrawerExtended: Dispatch<boolean>
  setPlotDrawerExtended: Dispatch<boolean>
  setTableDrawerType: Dispatch<TableType>
  tableDrawerExtended: boolean
  plotDrawerExtended: boolean
  currentTableDrawerType: TableType
  tableDrawerTypeToggleDispatch: Dispatch<TableDrawerToggleAction>
  tableDrawerToggleTypeState: TableDrawerState
}

export const UIContext = createContext<Partial<ContextProps>>({})

const initialStateTableDrawerExtension: TableDrawerState = {
  missionTableDrawerToggle: false,
  flightTableDrawerToggle: false,
  droneTableDrawerToggle: false,
}

const tableDrawerToggleReducer = (
  state: TableDrawerState,
  action: TableDrawerToggleAction,
): TableDrawerState => {
  switch (action.type) {
    case TableType.FLIGHT: {
      return { ...state, flightTableDrawerToggle: action.payload }
    }
    case TableType.MISSION: {
      return { ...state, missionTableDrawerToggle: action.payload }
    }
    case TableType.DRONE: {
      return { ...state, droneTableDrawerToggle: action.payload }
    }
    default:
      return initialStateTableDrawerExtension
  }
}

export const getTableDrawerState = ({
  type,
  tableDrawerState,
}: {
  type: TableType
  tableDrawerState?: TableDrawerState
}): boolean => {
  if (!tableDrawerState) {
    return false
  }
  switch (type) {
    case TableType.FLIGHT: {
      return tableDrawerState.flightTableDrawerToggle
    }
    case TableType.MISSION: {
      return tableDrawerState.missionTableDrawerToggle
    }
    case TableType.DRONE: {
      return tableDrawerState.droneTableDrawerToggle
    }
    default:
      return false
  }
}

type Props = {
  children: ReactNode
}

export const ContextProvider = ({ children }: Props) => {
  const [tableDrawerExtended, setTableDrawerExtended] = useState<boolean>(false)
  const [plotDrawerExtended, setPlotDrawerExtended] = useState<boolean>(true)

  const [tableDrawerToggleTypeState, tableDrawerTypeToggleDispatch] = useReducer(
    tableDrawerToggleReducer,
    initialStateTableDrawerExtension,
  )

  return (
    <UIContext.Provider
      value={{
        setTableDrawerExtended,
        setPlotDrawerExtended,
        tableDrawerExtended,
        plotDrawerExtended,
        tableDrawerToggleTypeState,
        tableDrawerTypeToggleDispatch,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}
