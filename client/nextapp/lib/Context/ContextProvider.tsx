import { type ReactNode, useReducer, useState, createContext, type Dispatch } from 'react'
import { DrawerExtensionTypes } from '@lib/constants'

export type TableDrawerToggleAction = {
  type: DrawerExtensionTypes
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
  setTableDrawerType: Dispatch<DrawerExtensionTypes>
  tableDrawerExtended: boolean
  plotDrawerExtended: boolean
  currentTableDrawerType: DrawerExtensionTypes
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
    case DrawerExtensionTypes.FLIGHT_DRAWER_EXTENDED: {
      return { ...state, flightTableDrawerToggle: action.payload }
    }
    case DrawerExtensionTypes.MISSION_DRAWER_EXTENDED: {
      return { ...state, missionTableDrawerToggle: action.payload }
    }
    case DrawerExtensionTypes.DRONE_DRAWER_EXTENDED: {
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
  type: DrawerExtensionTypes
  tableDrawerState?: TableDrawerState
}): boolean => {
  if (!tableDrawerState) {
    return false
  }
  switch (type) {
    case DrawerExtensionTypes.FLIGHT_DRAWER_EXTENDED: {
      return tableDrawerState.flightTableDrawerToggle
    }
    case DrawerExtensionTypes.MISSION_DRAWER_EXTENDED: {
      return tableDrawerState.missionTableDrawerToggle
    }
    case DrawerExtensionTypes.DRONE_DRAWER_EXTENDED: {
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
