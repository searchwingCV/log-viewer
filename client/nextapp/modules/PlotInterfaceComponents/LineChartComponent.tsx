/* 
   Complex component to plot the data, based on recharts.js,
   only the LineChart component from recharts is used here,
   plots individual timeseries & custom plots
 */
import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import useMedia from '@charlietango/use-media'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
  Label,
} from 'recharts'
import { differenceInSeconds, intervalToDuration } from 'date-fns'
import database, {
  type DexieCustomPlot,
  type DexieLogFileTimeSeries,
  type DexieLogOverallData,
} from '@idbSchema'

const calculateSignatureNumbers = ({ name, values }: { name: string; values: number[] }) => {
  //Calculate the Max, Min and AVG for each plot and limit decial numbers to 2 digits
  const max = Math.max(...values).toFixed(2)
  const min = Math.min(...values).toFixed(2)
  const mean = (values?.reduce((a, b) => a + b) / values.length).toFixed(2)

  return { name, max, min, mean }
}

const getTimeInDuration = (uniqueTimestamps: string[]) => {
  //get time strings for the x-axis in a readable format rather than timestamp
  const dateArr = uniqueTimestamps
    ?.map((item) => ({ date: new Date(item), timestamp: item }))
    ?.sort((dateA, dateB) => Number(dateA.date) - Number(dateB.date))

  const first = dateArr?.[0]?.date
  const formattedTimes = dateArr?.map((date) => {
    const seconds = differenceInSeconds(first, date.date) * -1
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 })

    const formatted = `${(duration?.hours || 0) * 60 + (duration?.minutes || 0)}:${
      duration.seconds
    }`
    return { formatted, timestamp: date.timestamp }
  })
  return formattedTimes
}

const splitIfDiffHigherThanOne = (arr: number[]) => {
  const maxDiff = 1
  const result = [[arr[0]]]
  let last = arr[0]
  for (const item of arr.slice(1)) {
    if (item - last > maxDiff) result.push([])
    result[result.length - 1].push(item)
    last = item
  }

  return result
}

const prepareFlightModeAreas = (
  flightModeData: FlightModeTime[],
  timeData: { timestring: string; formatted: string }[],
) => {
  //Create data for the chart's flight mode areas that will be colored differently
  const assignedToFlightMode = flightModes.map((mode) => {
    return {
      mode,
      values: flightModeData
        .map((element, index) => (element.mode === mode.name ? index : -1))
        .filter((element) => element !== -1),
    }
  })

  const startEndArr = assignedToFlightMode
    .map((arr) => {
      const startEndArray = splitIfDiffHigherThanOne(arr.values).map((item) => ({
        mode: arr.mode,
        start: item[0],
        end: item.slice(-1)[0],
      }))

      return startEndArray
    })
    ?.reduce((a, b) => [...a, ...b])

  return startEndArr.map((item) => ({
    mode: item.mode,
    //flight modes have a start and end time on the x-axis, but cover the whole y-axis
    start: timeData[item.start]?.formatted,
    end: timeData[item.end]?.formatted,
  }))
}

//currently available flight modes
const flightModes = [
  { name: 'FBWA', color: '#B5AEE0' },
  { name: 'AUTOTUNE', color: '#F2D4AC' },
  { name: 'MANUAL', color: '#CDE5CD' },
  { name: 'AUTO', color: '#FFDFD3' },
  { name: '', color: '#F7C4D4' },
]

export type FlightModeTime = { time: string; mode: string }

export type LineChartComponentProps = {
  overallData: DexieLogOverallData
}

export interface LineChartProps extends LineChartComponentProps {
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
}

export const LineChartComponent = ({ overallData }: LineChartComponentProps) => {
  const customPlots = useLiveQuery(() =>
    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.customFunction
      .orderBy('timestamp')
      .filter((plot: DexieCustomPlot) => plot.overallDataId === overallData?.id)
      .toArray(),
  )

  const activeTimeSeries = useLiveQuery(() =>
    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.logFileTimeSeries
      .orderBy('timestamp')
      .filter((series: DexieLogFileTimeSeries) => series.overallDataId === overallData?.id)
      .toArray(),
  )

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
    <LineChartGraph
      activeTimeSeries={activeTimeSeries}
      customPlots={customPlots}
      overallData={overallData}
    />
  )
}

export const LineChartGraph = ({
  activeTimeSeries, //only timeseries that are saved in IndexedDB are shown
  customPlots, //only customPlots that are saved in IndexedDB are shown
  overallData,
}: LineChartProps) => {
  const matches = useMedia({ maxWidth: 1440 })

  //signatureNumbers (min, max, avg) for each plot to be shown in an info board
  const signatureNumbers = useMemo(() => {
    const customPlotSignatureNumbers = customPlots?.map((propTypes: DexieCustomPlot) =>
      propTypes?.values?.length
        ? calculateSignatureNumbers({
            name: propTypes.customFunction,
            values: propTypes.values.map((valPair) => valPair.value),
          })
        : null,
    )
    const activeTimeSeriesSignatureNumbers = activeTimeSeries?.map(
      (propTypes: DexieLogFileTimeSeries) =>
        propTypes?.values?.length
          ? calculateSignatureNumbers({
              name: propTypes.calculatorExpression,
              values: propTypes.values.map((valPair) => valPair.value),
            })
          : null,
    )

    return activeTimeSeriesSignatureNumbers?.concat(customPlotSignatureNumbers)
  }, [activeTimeSeries, customPlots])

  //data formatted for rehcart's Line component representing each
  //visible individual timeseries and customplot
  const preparedLineData = useMemo(() => {
    const unsorted = [
      ...(activeTimeSeries?.length ? activeTimeSeries?.map((series) => series.values) : []),
      ...(customPlots?.length
        ? customPlots?.filter((plot) => !!plot.customFunction).map((plot) => plot.values)
        : []),
    ]

    const longestTimeseries = unsorted?.length
      ? unsorted.reduce((a, b) => a && b && (Object.keys(a).length > Object.keys(b).length ? a : b))
      : undefined

    const unifiedData = longestTimeseries?.length
      ? getTimeInDuration(longestTimeseries?.map((time) => time.timestamp)).map(
          (timestamp, indexValueUnit) => {
            const timeseriesPlotValueInfo = activeTimeSeries?.length
              ? activeTimeSeries
                  .map((plot) => ({
                    [plot.calculatorExpression]: plot?.values?.[indexValueUnit]?.value || NaN,
                  }))
                  ?.reduce((a, b) => ({
                    ...a,
                    ...b,
                  }))
              : []

            const customPlotValueInfo = customPlots?.length
              ? customPlots
                  ?.map((plot) => ({
                    [plot.customFunction]: plot?.values?.[indexValueUnit]?.value || NaN,
                  }))
                  ?.reduce((a, b) => ({
                    ...a,
                    ...b,
                  }))
              : []

            return {
              name: timestamp.formatted,
              timestring: timestamp.timestamp,
              ...timeseriesPlotValueInfo,
              ...customPlotValueInfo,
            }
          },
        )
      : []

    return unifiedData
  }, [activeTimeSeries, customPlots])

  //Data formatted to represent flight modes on the x-axis, rendered with rechart's ReferenceArea
  const flightModeAreas = useMemo(
    () =>
      overallData?.flightModeTimeSeries
        ? prepareFlightModeAreas(
            overallData.flightModeTimeSeries,
            preparedLineData.map((item) => ({
              timestring: item.timestring,
              formatted: item.name,
            })) as { timestring: string; formatted: string }[],
          )
        : undefined,
    [overallData, preparedLineData],
  )

  //plot name data for labelling plots in chart and brush
  const plotNames = useMemo(() => {
    const customPlotNames = customPlots
      ?.filter((plot) => !plot.hidden && plot.customFunction)
      ?.map((plot) => ({
        name: plot.customFunction,
        label: plot.customFunction,
        color: plot.color,
      }))
    const activeTimeSeriesNames = activeTimeSeries
      ?.filter((timeseries) => !timeseries.hidden)
      ?.map((plotTypes: DexieLogFileTimeSeries) => ({
        name: plotTypes.calculatorExpression,
        label: plotTypes.calculatorExpression,
        color: plotTypes.color,
      }))

    return activeTimeSeriesNames?.concat(customPlotNames)
  }, [activeTimeSeries, customPlots])

  return (
    <>
      <ResponsiveContainer width="100%" height={matches ? 650 : 700}>
        <LineChart
          width={matches ? 500 : 475}
          height={500}
          data={preparedLineData}
          syncId="anyId"
          margin={{ bottom: 50 }}
        >
          <Legend
            layout="horizontal"
            verticalAlign="top"
            align="center"
            content={(props) => {
              const { payload } = props

              return (
                <ul
                  className={`relative
                              ml-[60px]
                              mb-12
                              border
                              border-grey-medium
                              bg-primary-white
                              p-2
                              text-xs`}
                >
                  {payload?.map((entry, index) => (
                    <li
                      key={`item-${index}`}
                      style={{ color: entry.color }}
                      className={`grid
                                  grid-cols-[300px_250px_250px_250px]
                                  text-xs`}
                    >
                      <span className="font-bold">{entry.value}</span>
                      <span>
                        <span className="pr-2">MAX:</span>
                        {signatureNumbers.find((numberSet) => numberSet?.name === entry.value)?.max}
                      </span>
                      <span>
                        <span className="pr-2"> MIN:</span>
                        {signatureNumbers.find((numberSet) => numberSet?.name === entry.value)?.min}
                      </span>
                      <span>
                        <span className="pr-2"> MEAN:</span>
                        {
                          signatureNumbers.find((numberSet) => numberSet?.name === entry.value)
                            ?.mean
                        }
                      </span>
                    </li>
                  ))}

                  <div
                    className={`absolute
                                top-2
                                right-8
                                text-grey-dark`}
                  >{`FLIGHT ${overallData?.flightid}`}</div>
                </ul>
              )
            }}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />

          {plotNames?.map((plot, i) => (
            <YAxis
              key={plot?.name}
              width={40}
              tick={{ fontSize: 12 }}
              dataKey={plot?.name}
              yAxisId={i}
              stroke={plot?.color}
              label={
                <Label
                  stroke={plot?.color}
                  className={`text-[9px]
                              font-thin`}
                  position="bottom"
                  value={plot?.label}
                  angle={-90}
                  offset={90}
                ></Label>
              }
            />
          ))}

          <Tooltip />
          {plotNames?.map((plot, i) => (
            <Line
              key={plot?.name}
              type="monotone"
              dataKey={plot?.name}
              stroke={plot?.color}
              fill={plot?.color}
              dot={false}
              yAxisId={i}
            />
          ))}
          <Brush data={preparedLineData} dataKey={'prop'} height={100}>
            <LineChart data={preparedLineData} className={'mt-8'}>
              {plotNames?.map((plot, i) => (
                <Line
                  key={plot?.name}
                  type="monotone"
                  dataKey={plot?.name}
                  stroke={plot?.color}
                  fill={plot?.color}
                  dot={false}
                  yAxisId={i}
                />
              ))}
            </LineChart>
          </Brush>

          {flightModeAreas?.map((areaData) => (
            <ReferenceArea
              key={`area-${areaData.start}`}
              x1={areaData.start}
              x2={areaData.end}
              fillOpacity={0.3}
              fill={areaData.mode.color}
              className="text-xs"
              label={
                <Label
                  value={areaData.mode.name}
                  fontSize="12"
                  fill="#CACACA"
                  fontWeight="Bold"
                  angle={-90.1}
                />
              }
            ></ReferenceArea>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
