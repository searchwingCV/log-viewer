/* 
   Complex component to plot the data, based on recharts.js,
   only the LineChart component from recharts is used here,
   plots individual timeseries & custom plots
 */
import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import clsx from 'clsx'
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

const calculateSignatureNumbers = ({
  name,
  values,
  flightid,
}: {
  name: string
  values: number[]
  flightid: number
}) => {
  //Calculate the Max, Min and AVG for each plot and limit decial numbers to 2 digits
  const max = Math.max(...values).toFixed(2)
  const min = Math.min(...values).toFixed(2)
  const mean = (values?.reduce((a, b) => a + b) / values.length).toFixed(2)

  return { name, max, min, mean, flightid }
}

const getTimeInDuration = (uniqueTimestamps: string[], originalFirstTimestamp?: string) => {
  //get time strings for the x-axis in a readable format rather than timestamp
  const dateArr = uniqueTimestamps
    ?.map((item) => ({ date: new Date(item), timestamp: item }))
    ?.sort((dateA, dateB) => Number(dateA.date) - Number(dateB.date))

  const first = originalFirstTimestamp ? new Date(originalFirstTimestamp) : dateArr?.[0]?.date

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

const getPlotValuesPerTimeUnit = (
  timestamp: { timestamp: string; formatted: string },
  indexValueUnit: number,
  activeTimeSeries: DexieLogFileTimeSeries[],
  customPlots: DexieCustomPlot[],
  flightid?: number,
  originalLength?: number,
) => {
  // const shorterId = shorterTimeseries?.[0]?.flightid

  const timeseriesPlotValueInfo = activeTimeSeries?.length
    ? activeTimeSeries
        .map((plot) => {
          return !flightid
            ? {
                [`${plot.flightid}-${plot.calculatorExpression}`]:
                  plot?.values?.[indexValueUnit]?.value || NaN,
                //flightid: plot.flightid,
              }
            : plot.flightid === flightid
            ? {
                [`${plot.flightid}-${plot.calculatorExpression}`]:
                  plot?.values?.[indexValueUnit]?.value || NaN,
                //flightid: plot.flightid,
              }
            : undefined
        })
        ?.reduce((a, b) => ({
          ...a,
          ...b,
        }))
    : []

  const customPlotValueInfo: any = customPlots?.length
    ? customPlots
        .map((plot) =>
          !flightid
            ? {
                [`${plot.flightid}-${plot.customFunction}`]:
                  plot?.values?.[indexValueUnit]?.value || NaN,
                //flightid: plot.flightid,
              }
            : plot.flightid === flightid
            ? {
                [`${plot.flightid}-${plot.customFunction}`]:
                  plot?.values?.[indexValueUnit]?.value || NaN,
                //flightid: plot.flightid,
              }
            : undefined,
        )
        ?.reduce((a, b) => ({
          ...a,
          ...b,
        }))
    : []

  return {
    name: timestamp.formatted,
    flightid: flightid,
    prop: timestamp.formatted,
    timestring: timestamp.timestamp,
    ...timeseriesPlotValueInfo,
    ...customPlotValueInfo,
    originalLength,
  }
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
  overallData: DexieLogOverallData[]
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
  const [brushValues, setBrushValues] = useState<
    {
      startIndex: number
      endIndex: number
      flightid: number
    }[]
  >([])

  const [throttledBrushValues, setThrottledTimeseries] = useState<
    {
      startIndex: number
      endIndex: number
      flightid: number
    }[]
  >([])

  const overallDataIds = overallData?.map((data) => data.id)

  const orientationMapping = overallData?.map((data, i) => ({
    id: data.id,
    orientation: (i + 1) % 2 === 1 ? 'left' : 'right',
  }))

  //signatureNumbers (min, max, avg) for each plot to be shown in an info board
  const signatureNumbers = useMemo(() => {
    const customPlotSignatureNumbers = customPlots?.map((propTypes: DexieCustomPlot) =>
      propTypes?.values?.length
        ? calculateSignatureNumbers({
            name: `${propTypes.flightid}-${propTypes.customFunction}`,
            values: propTypes.values.map((valPair) => valPair.value),
            flightid: propTypes.flightid,
          })
        : null,
    )
    const activeTimeSeriesSignatureNumbers = activeTimeSeries?.map(
      (propTypes: DexieLogFileTimeSeries) =>
        propTypes?.values?.length
          ? calculateSignatureNumbers({
              name: `${propTypes.flightid}-${propTypes.calculatorExpression}`,
              values: propTypes.values.map((valPair) => valPair.value),
              flightid: propTypes.flightid,
            })
          : null,
    )

    return activeTimeSeriesSignatureNumbers?.concat(customPlotSignatureNumbers)
  }, [activeTimeSeries, customPlots])

  useEffect(() => {
    setTimeout(() => setThrottledTimeseries(brushValues), 3000)
  }, [brushValues])

  //data formatted for rehcart's Line component representing each
  //visible individual timeseries and customplot

  const brushData = useMemo(() => {
    //const timeseries = ( brushValuesFirst || brushValuesSecond )?

    if (overallDataIds?.length > 1) {
      const unsorted = [
        ...(activeTimeSeries?.length
          ? activeTimeSeries?.map((series) =>
              series.values.map((values) => ({ ...values, flightid: series.flightid })),
            )
          : []),
        ...(customPlots?.length
          ? customPlots
              ?.filter((plot) => !!plot.customFunction)
              .map((plot) => plot.values.map((values) => ({ ...values, flightid: plot.flightid })))
          : []),
      ]

      const longerTimeseries = unsorted?.length
        ? unsorted.reduce(
            (a, b) => a && b && (Object.keys(a).length > Object.keys(b).length ? a : b),
          )
        : undefined

      const shorterTimeseries = unsorted?.length
        ? unsorted.reduce(
            (a, b) => a && b && (Object.keys(a).length < Object.keys(b).length ? a : b),
          )
        : undefined

      const unifiedShorterFlightData = longerTimeseries?.length
        ? getTimeInDuration(longerTimeseries?.map((time) => time.timestamp)).map(
            (timestamp, indexValueUnit) => {
              return getPlotValuesPerTimeUnit(
                timestamp,
                indexValueUnit,
                activeTimeSeries,
                customPlots,
                shorterTimeseries?.[0]?.flightid,
                shorterTimeseries?.length,
              )
            },
          )
        : []

      const unifiedLongerFlightData = longerTimeseries?.length
        ? getTimeInDuration(longerTimeseries?.map((time) => time.timestamp)).map(
            (timestamp, indexValueUnit) => {
              return getPlotValuesPerTimeUnit(
                timestamp,
                indexValueUnit,
                activeTimeSeries,
                customPlots,
                longerTimeseries?.[0]?.flightid,
                longerTimeseries?.length,
              )
            },
          )
        : []

      return [unifiedShorterFlightData, unifiedLongerFlightData]
    }

    return null
  }, [activeTimeSeries, customPlots, overallDataIds?.length])

  const originalLineData = useMemo(() => {
    //const timeseries = ( brushValuesFirst || brushValuesSecond )?

    const unsorted = [
      ...(activeTimeSeries?.length
        ? activeTimeSeries?.map((series) =>
            series.values.map((values) => ({ ...values, flightid: series.flightid })),
          )
        : []),
      ...(customPlots?.length
        ? customPlots
            ?.filter((plot) => !!plot.customFunction)
            .map((plot) => plot.values.map((values) => ({ ...values, flightid: plot.flightid })))
        : []),
    ]

    const longerTimeseries = unsorted?.length
      ? unsorted.reduce((a, b) => a && b && (Object.keys(a).length > Object.keys(b).length ? a : b))
      : undefined

    const unifiedData = longerTimeseries?.length
      ? getTimeInDuration(
          longerTimeseries?.map((time) => time.timestamp),
          overallData.find((data) => data.flightid === longerTimeseries?.[0]?.flightid)?.from,
        ).map((timestamp, indexValueUnit) => {
          return getPlotValuesPerTimeUnit(timestamp, indexValueUnit, activeTimeSeries, customPlots)
        })
      : []

    return unifiedData
  }, [activeTimeSeries, customPlots, overallData])

  const originalPlotData = useMemo(() => {
    //const timeseries = ( brushValuesFirst || brushValuesSecond )?

    const maxLengthLongerFlight = brushData?.[0]?.length || 0
    const brushedTimeseries = throttledBrushValues?.length
      ? activeTimeSeries?.map((timeseries) => {
          const brushIndices = throttledBrushValues.find(
            (brushValueSet) => brushValueSet.flightid === timeseries.flightid,
          )

          if (brushIndices) {
            const { values, ...rest } = timeseries

            const diffLongerShorterFlight = values.length - maxLengthLongerFlight

            const endIndexOtherFlight = throttledBrushValues.find(
              (brushValueSet) => brushValueSet.flightid !== timeseries.flightid,
            )?.endIndex

            const sliced = timeseries.values.slice(
              brushIndices.startIndex,
              diffLongerShorterFlight > 0
                ? brushIndices.endIndex - diffLongerShorterFlight
                : brushIndices.endIndex < endIndexOtherFlight
                ? endIndexOtherFlight
                : brushIndices.endIndex,
            )

            return {
              firstTimeStamp: timeseries.values[0],
              values: sliced,
              ...rest,
            }
          }
          return timeseries
        })
      : activeTimeSeries

    const brushedCustomPlots = throttledBrushValues?.length
      ? customPlots?.map((customPlot) => {
          const brushIndices = throttledBrushValues.find(
            (brushValueSet) => brushValueSet.flightid === customPlot.flightid,
          )

          if (brushIndices) {
            const { values, ...rest } = customPlot

            const sliced = customPlot.values.slice(brushIndices.startIndex, brushIndices.endIndex)

            return {
              firstTimeStamp: customPlot.values[0],
              values: sliced,
              ...rest,
            }
          }
          return customPlot
        })
      : customPlots

    const unsorted = [
      ...(brushedTimeseries?.length
        ? brushedTimeseries?.map((series) =>
            series.values.map((values) => ({ ...values, flightid: series.flightid })),
          )
        : []),
      ...(customPlots?.length
        ? customPlots
            ?.filter((plot) => !!plot.customFunction)
            .map((plot) => plot.values.map((values) => ({ ...values, flightid: plot.flightid })))
        : []),
    ]

    const longerTimeseries = unsorted?.length
      ? unsorted.reduce((a, b) => a && b && (Object.keys(a).length > Object.keys(b).length ? a : b))
      : undefined

    const originalLongerFlight = overallData?.reduce((dataA, dataB) =>
      dataA?.timestamps?.length > dataB?.timestamps?.length ? dataA : dataB,
    )

    const brushValuesLongerFlight = throttledBrushValues?.find(
      (values) => values.flightid === originalLongerFlight.flightid,
    )

    const uniqueTimestamps = brushValuesLongerFlight
      ? originalLongerFlight.timestamps.slice(
          brushValuesLongerFlight?.startIndex,

          brushValuesLongerFlight?.endIndex,
        )
      : originalLongerFlight.timestamps

    const unifiedData = longerTimeseries?.length
      ? getTimeInDuration(longerTimeseries.map((timeseries) => timeseries.timestamp)).map(
          (timestamp, indexValueUnit) => {
            return getPlotValuesPerTimeUnit(
              timestamp,
              indexValueUnit,
              brushedTimeseries,
              brushedCustomPlots,
            )
          },
        )
      : []

    return unifiedData
  }, [activeTimeSeries, customPlots, throttledBrushValues, brushData, overallData])

  const xAxisData = useMemo(() => {
    const originalShorterFlight = overallData?.reduce((dataA, dataB) =>
      dataA?.timestamps?.length < dataB?.timestamps?.length ? dataA : dataB,
    )

    const brushValuesShorterFlight = throttledBrushValues?.find(
      (values) => values.flightid === originalShorterFlight.flightid,
    )

    if (overallDataIds?.length > 1) {
      if (brushValuesShorterFlight?.endIndex && brushValuesShorterFlight?.startIndex) {
        const sliced = originalLineData.slice(
          brushValuesShorterFlight?.startIndex,
          brushValuesShorterFlight?.endIndex < originalShorterFlight.timestamps.length
            ? originalShorterFlight.timestamps.length
            : brushValuesShorterFlight?.endIndex,
        )

        return sliced
      } else {
        return originalLineData
      }
    }

    return originalLineData
  }, [throttledBrushValues, overallDataIds, overallData, originalLineData])

  //Data formatted to represent flight modes on the x-axis, rendered with rechart's ReferenceArea
  // const flightModeAreas = useMemo(
  //   () =>
  //     overallData?.flightModeTimeSeries
  //       ? prepareFlightModeAreas(
  //           overallData.flightModeTimeSeries,
  //           preparedLineData.map((item) => ({
  //             timestring: item.timestring,
  //             formatted: item.name,
  //           })) as { timestring: string; formatted: string }[],
  //         )
  //       : undefined,
  //   [overallData, preparedLineData],
  // )

  const plotNames = useMemo(() => {
    const customPlotNames = customPlots
      ?.filter((plot) => !plot.hidden && plot.customFunction)
      ?.map((plot) => ({
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
      ?.filter((timeseries) => !timeseries.hidden)
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

    // return overallDataIds?.map((id) => unified.filter((plot) => plot.overallDataId === id))

    return unified
  }, [activeTimeSeries, customPlots, orientationMapping])

  return (
    <>
      <ResponsiveContainer width="100%" height={matches ? 200 : 250}>
        <LineChart
          width={matches ? 500 : 475}
          height={30}
          data={xAxisData}
          syncId="anyId"
          margin={{ bottom: 0 }}
        >
          <Legend
            layout="horizontal"
            verticalAlign="top"
            align="center"
            content={(props) => {
              const { payload } = props

              return (
                <>
                  {overallData?.map((data, i) => (
                    <ul
                      key={`signature-numbers-${data.id}`}
                      className={clsx(
                        `relative
                          border
                          border-grey-medium
                          bg-primary-white
                          p-2
                          text-xs`,
                        overallData?.length === i + 1 ? `-mb-16` : `mb-3`,
                        overallData?.length > 1 ? `` : `-ml-[20px]`,
                      )}
                    >
                      {payload?.map((entry, index) => {
                        const flightid = entry.dataKey.split('-')[0]

                        if (data.flightid === parseInt(flightid)) {
                          return (
                            <li
                              key={`item-${entry.value}`}
                              style={{ color: entry.color }}
                              className={`grid
                                          grid-cols-[200px_150px_150px_150px]
                                          text-xs
                                          2xl:grid-cols-[300px_250px_250px_250px]`}
                            >
                              <span className="font-bold">{entry.value}</span>
                              <span>
                                <span className="pr-2">MAX:</span>
                                {
                                  signatureNumbers.find(
                                    (numberSet) => numberSet?.name === entry.value,
                                  )?.max
                                }
                              </span>
                              <span>
                                <span className="pr-2"> MIN:</span>
                                {
                                  signatureNumbers.find(
                                    (numberSet) => numberSet?.name === entry.value,
                                  )?.min
                                }
                              </span>
                              <span>
                                <span className="pr-2"> MEAN:</span>
                                {
                                  signatureNumbers.find(
                                    (numberSet) => numberSet?.name === entry.value,
                                  )?.mean
                                }
                              </span>
                            </li>
                          )
                        }
                      })}

                      <div
                        className={`absolute
                                    top-2
                                    right-8
                                  text-grey-dark`}
                      >{`FLIGHT ${data?.flightid}`}</div>
                    </ul>
                  ))}
                </>
              )
            }}
          />

          {plotNames?.map((plot, i) => (
            <YAxis
              className="-z-10 hidden opacity-0"
              key={plot?.name}
              width={40}
              tick={{ fontSize: 12 }}
              orientation={plot.orientation as 'left' | 'right' | undefined}
              dataKey={plot?.name}
              yAxisId={i}
              stroke={'transparent'}
              label={
                <Label
                  stroke={plot?.color}
                  className={`text-[9px]
                              font-thin
                              opacity-0`}
                  position="top"
                  value={plot?.label}
                  angle={-90}
                  offset={50}
                ></Label>
              }
            />
          ))}

          {plotNames?.map((plot, i) => (
            <Line
              key={plot?.name}
              type="monotone"
              dataKey={plot?.name}
              stroke={plot?.color}
              fill={plot?.color}
              dot={false}
              yAxisId={i}
              className="hidden"
            />
          ))}
          <XAxis xAxisId={'0'} dataKey="name" interval="preserveStartEnd" />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={matches ? 300 : 350}>
        <LineChart
          width={matches ? 500 : 475}
          height={500}
          data={preparedLineData}
          syncId="anyId"
          margin={{ bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {/* <XAxis xAxisId={'0'} dataKey="name" interval="preserveStartEnd" /> */}

          {plotNames?.map((plot, i) => (
            <YAxis
              key={plot?.name}
              width={40}
              tick={{ fontSize: 12 }}
              orientation={plot.orientation as 'left' | 'right' | undefined}
              dataKey={plot?.name}
              yAxisId={i}
              stroke={plot?.color}
              label={
                <Label
                  stroke={plot?.color}
                  className={`text-[9px]
                              font-thin`}
                  position="top"
                  value={plot?.label}
                  angle={-90}
                  offset={50}
                ></Label>
              }
            />
          ))}
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
          <Tooltip />

          {overallData?.length === 1 ? (
            <Brush data={originalPlotData} dataKey={'name'} height={30} id="1">
              <LineChart data={originalPlotData} className={'mt-8'}>
                {plotNames?.map((plot, i) => {
                  if (plot.flightid === 1) {
                    return (
                      <Line
                        key={plot?.name}
                        type="monotone"
                        dataKey={plot?.name}
                        stroke={plot?.color}
                        fill={plot?.color}
                        dot={false}
                        xAxisId={'1'}
                      />
                    )
                  }
                })}
              </LineChart>
            </Brush>
          ) : null}

          {/* {flightModeAreas?.map((areaData) => (
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
          ))} */}
        </LineChart>
      </ResponsiveContainer>

      {brushData
        ? brushData?.map((data, i) => {
            const originalShorterFlightLength = overallData?.reduce((dataA, dataB) =>
              dataA?.timestamps?.length < dataB?.timestamps?.length ? dataA : dataB,
            ).timestamps.length

            const matchingBrushValSet = brushValues?.find(
              (brushValSet) => brushValSet.flightid === data?.[0]?.flightid,
            )

            return (
              <div className="relative" key={`flight-brush-${data?.[0]?.flightid}`}>
                <div
                  className={`absolute
                              -top-2
                              left-1/2
                              -translate-x-1/2
                              transform
                              text-center
                              text-[11px]
                            `}
                >
                  <div>
                    {`Flight ${data?.[0]?.flightid} - seconds shown in chart:`}{' '}
                    <span className="text-primary-red">{`${
                      matchingBrushValSet?.endIndex || matchingBrushValSet?.startIndex
                        ? matchingBrushValSet?.endIndex - matchingBrushValSet?.startIndex
                        : 'all of them'
                    }`}</span>
                  </div>

                  <div>{`Total seconds of flight: ${data?.[0]?.originalLength}`}</div>
                  <div>{`Duration in minutes: ${
                    (intervalToDuration({ start: 0, end: data?.[0]?.originalLength * 1000 })
                      .hours || 0) *
                      60 +
                    (intervalToDuration({ start: 0, end: data?.[0]?.originalLength * 1000 })
                      .minutes || 0)
                  }:${
                    intervalToDuration({ start: 0, end: data?.[0]?.originalLength * 1000 }).seconds
                  }`}</div>
                </div>
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart
                    width={matches ? 500 : 475}
                    height={500}
                    data={data}
                    margin={{ bottom: 20 }}

                    //syncId="anyId"
                  >
                    <XAxis xAxisId={'0'} dataKey="name" interval="preserveStartEnd" />

                    {plotNames?.map((plot, i) => (
                      <YAxis
                        key={plot?.name}
                        width={40}
                        tick={{ fontSize: 12 }}
                        orientation={plot.orientation as 'left' | 'right' | undefined}
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
                            offset={50}
                          ></Label>
                        }
                      />
                    ))}
                    <Brush
                      data={data}
                      startIndex={matchingBrushValSet?.startIndex || 0}
                      endIndex={matchingBrushValSet?.endIndex || data?.length - 1}
                      dataKey={'name'}
                      height={30}
                      id="2"
                      onChange={(indices) => {
                        const brushValuesOtherFlight = brushValues.filter(
                          (values) => values.flightid !== data?.[0]?.flightid,
                        )

                        setBrushValues(
                          brushValuesOtherFlight.concat({
                            ...indices,
                            flightid: data?.[0]?.flightid,
                          }),
                        )

                        return indices
                      }}
                    >
                      <LineChart data={data} className={'mt-8'}>
                        {plotNames?.map((plot, i) => {
                          return (
                            <Line
                              key={plot?.name}
                              type="monotone"
                              dataKey={plot?.name}
                              stroke={plot?.color}
                              fill={plot?.color}
                              dot={false}
                              yAxisId={i}
                            />
                          )
                        })}
                      </LineChart>
                    </Brush>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )
          })
        : null}
    </>
  )
}
