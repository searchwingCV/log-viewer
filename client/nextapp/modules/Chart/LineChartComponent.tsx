import { useMemo } from 'react'
import { differenceInMilliseconds } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import useElementSize from '@charlietango/use-element-size'
import { widthYAxis } from '~/lib/constants'
import database, {
  type DexieCustomPlot,
  type DexieLogOverallData,
  type DexieLogFileTimeSeries,
} from '@idbSchema'
import { useFetchTimeseries } from '~/api/flight/getLTTBSampledTimeseries'
import { LineChart } from './components/LineChart'
import { getTimeValuePlotArray } from './functions'

export type FlightModeTime = { time: string; mode: string }

export const getTimeseriesIdentifiers = ({
  activeTimeSeries,
  width,
  overallData,
  isComparingTwoFlights,
}: {
  activeTimeSeries: DexieLogFileTimeSeries[]
  width: number
  overallData: DexieLogOverallData[]
  isComparingTwoFlights: boolean
}) => {
  return activeTimeSeries.map((series) => {
    const totalMilliseconds = overallData
      ?.map((data) => ({
        flightid: data.flightid,
        totalMs: differenceInMilliseconds(new Date(data.until), new Date(data.from)),
      }))
      .sort((a, b) => b.totalMs - a.totalMs)

    const relation = isComparingTwoFlights
      ? totalMilliseconds[1].totalMs / totalMilliseconds[0].totalMs
      : 1
    const longerFlightId = totalMilliseconds[0].flightid
    return {
      flightid: series.flightid,
      n_datapoints: series.flightid === longerFlightId ? width : Math.floor(width * relation),
      messageField: series.messageField,
      messageType: series.messageType,
    }
  })
}

export interface ChartProps extends LineChartComponentProps {
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
  totalWidthChart: number
  windowWidth: number
}

export const LineChartDataWrapper = ({
  overallData,
  activeTimeSeries,
  customPlots,
  totalWidthChart,
  windowWidth,
}: ChartProps) => {
  const { data: fetchedTimeseries } = useFetchTimeseries({
    chartSize: totalWidthChart,
    timeseriesIdentifiers: getTimeseriesIdentifiers({
      activeTimeSeries: activeTimeSeries,
      width: totalWidthChart,
      overallData: overallData,
      isComparingTwoFlights: overallData.length > 1,
    }),
    enable: totalWidthChart > 0,
  })

  const { data: originalBrushData } = useFetchTimeseries({
    chartSize: totalWidthChart - 60,
    timeseriesIdentifiers: getTimeseriesIdentifiers({
      activeTimeSeries: activeTimeSeries,
      width: windowWidth,
      overallData: overallData,
      isComparingTwoFlights: overallData.length > 1,
    }),
    enable: totalWidthChart > 0,
  })

  const orientationMapping = overallData?.map((data, i) => ({
    id: data.id,
    orientation: (i + 1) % 2 === 1 ? 'left' : 'right',
  }))

  const processedData = useMemo(
    () =>
      getTimeValuePlotArray({
        overallData,
        totalWidthChart,
        activeTimeSeries,
        fetchedTimeseries: fetchedTimeseries || [],
        customPlots,
      }),
    [overallData, fetchedTimeseries, activeTimeSeries, totalWidthChart, customPlots],
  )

  const processedBrushData = useMemo(
    () =>
      getTimeValuePlotArray({
        overallData,
        totalWidthChart: windowWidth,
        activeTimeSeries,
        fetchedTimeseries: originalBrushData || [],
        customPlots,
      }),
    [overallData, originalBrushData, activeTimeSeries, windowWidth, customPlots],
  )

  const plotNames = useMemo(() => {
    const customPlotNames = customPlots
      ?.filter((plot: DexieCustomPlot) => !plot.hidden && plot.customFunction)
      ?.map((plot: DexieCustomPlot) => ({
        name: `${plot.flightid}-${plot.customFunction}`,
        label: plot.customFunction,
        color: plot.color,
        overallDataId: plot.overallDataId,
        flightid: plot.flightid,
        orientation:
          orientationMapping?.find((orientation) => orientation.id === plot.overallDataId)
            ?.orientation || 'left',
      }))
    const activeTimeSeriesNames = activeTimeSeries
      ?.filter((timeseries: DexieLogFileTimeSeries) => !timeseries.hidden)
      ?.map((plotTypes: DexieLogFileTimeSeries) => ({
        name: `${plotTypes.flightid}-${plotTypes.calculatorExpression}`,
        label: plotTypes.calculatorExpression,
        color: plotTypes.color,
        overallDataId: plotTypes.overallDataId,
        flightid: plotTypes.flightid,
        orientation:
          orientationMapping?.find((orientation) => orientation.id === plotTypes.overallDataId)
            ?.orientation || 'left',
      }))

    const unified = activeTimeSeriesNames?.concat(customPlotNames)

    return unified
  }, [customPlots, activeTimeSeries, orientationMapping])

  if (!processedData || !fetchedTimeseries) {
    return null
  }

  return (
    <LineChart
      overallData={overallData}
      activeTimeSeries={activeTimeSeries}
      customPlots={customPlots}
      chartWidth={totalWidthChart}
      plotNames={plotNames}
      totalWidthChart={totalWidthChart}
      processedData={processedData}
      processedBrushData={processedBrushData || []}
      fetchedTimeseries={fetchedTimeseries}
      renderKey={plotNames.map((name) => name.label).join('-')}
    />
  )
}

export type LineChartComponentProps = {
  flightModeData?: FlightModeTime[]
  flightId?: number
  overallData: DexieLogOverallData[]
}

export const DexieLineChartWrapper = ({ overallData }: LineChartComponentProps) => {
  const [ref, size] = useElementSize()

  const customPlots = useLiveQuery(
    () =>
      //TODO: solve dexie ts error
      //@ts-expect-error: Dexie not working with TS right now
      database.customFunction
        .orderBy('timestamp')
        .filter((plot: DexieCustomPlot) =>
          overallData?.map((data) => data.id)?.includes(plot.overallDataId),
        )
        .toArray(),
    [],
    [],
  )

  const activeTimeSeries = useLiveQuery(
    () =>
      //TODO: solve dexie ts error
      //@ts-expect-error: Dexie not working with TS right now
      database.logFileTimeSeries
        .orderBy('timestamp')
        .filter((series: DexieLogFileTimeSeries) =>
          overallData?.map((data) => data.id)?.includes(series.overallDataId),
        )
        .toArray(),
    [],
    [],
  )

  const totalWidthChart =
    size.width -
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    ((customPlots?.length || 0) + (activeTimeSeries?.length || 0)) * widthYAxis

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

  return (
    <div ref={ref}>
      <LineChartDataWrapper
        activeTimeSeries={activeTimeSeries}
        customPlots={customPlots}
        totalWidthChart={totalWidthChart}
        overallData={overallData}
        windowWidth={size.width}
      />
    </div>
  )
}
