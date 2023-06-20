/* 
   Component checking whether we have to render SingleFlightChart or TwoFlightChart
 */
import { useLiveQuery } from 'dexie-react-hooks'

import database, {
  type DexieCustomPlot,
  type DexieLogOverallData,
  type DexieLogFileTimeSeries,
} from '@idbSchema'

import { SingleFlightChart } from './SingleFlightChart'
import { TwoFlightChart } from './TwoFlightChart'
export type FlightModeTime = { time: string; mode: string }

export type LineChartComponentProps = {
  flightModeData?: FlightModeTime[]
  flightId?: number
  overallData: DexieLogOverallData[]
  isComparingTwoFlights?: boolean
}

export const LineChartComponent = ({
  flightId,
  overallData,
  isComparingTwoFlights,
}: LineChartComponentProps) => {
  const customPlots = useLiveQuery(() =>
    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.customFunction
      .orderBy('timestamp')
      .filter((plot: DexieCustomPlot) =>
        overallData?.map((data) => data.id)?.includes(plot.overallDataId),
      )
      .toArray(),
  )

  const activeTimeSeries = useLiveQuery(() =>
    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.logFileTimeSeries
      .orderBy('timestamp')
      .filter((series: DexieLogFileTimeSeries) =>
        overallData?.map((data) => data.id)?.includes(series.overallDataId),
      )
      .toArray(),
  )
  if (isComparingTwoFlights && overallData.length < 2) {
    return (
      <div
        className={`flex
                    items-center
                    justify-center`}
      >
        Error: Not enough flights fetched for a comparison view.
      </div>
    )
  }
  if (
    (!activeTimeSeries && !customPlots) ||
    ((!customPlots?.length ||
      //there are empty custom plots that should not influence the LineChartComponent should not be shown
      customPlots?.filter((item: DexieCustomPlot) => item.customFunction !== '').length === 0) &&
      !activeTimeSeries?.length)
  ) {
    return (
      <div
        className={`flex
                    items-center
                    justify-center`}
      >
        No Data selected
      </div>
    )
  }

  if (!isComparingTwoFlights) {
    return (
      <SingleFlightChart
        overallData={overallData?.[0]}
        flightId={flightId}
        activeTimeSeries={activeTimeSeries}
        customPlots={customPlots}
      />
    )
  } else {
    return (
      <TwoFlightChart
        overallData={overallData}
        activeTimeSeries={activeTimeSeries}
        customPlots={customPlots}
      />
    )
  }
}
