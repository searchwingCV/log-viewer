import { useMemo, useContext, memo, useState, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import useMedia from '@charlietango/use-media'
import { toast } from 'react-toastify'
import { differenceInMilliseconds, addMilliseconds, isValid } from 'date-fns'
import { debounce } from 'lodash'
import { LineChart, Line, YAxis, ResponsiveContainer, Brush, Label } from 'recharts'
import useWindowSize from '@lib/hooks/useWindowSize'
import { UIContext } from '@lib/Context/ContextProvider'
import { type BrushDataProps, FixedTimeIntervals } from '@lib/globalTypes'
import type { LogFileTimeSeries } from '@schema'
import type { DexieCustomPlot, DexieLogFileTimeSeries, DexieLogOverallData } from '@idbSchema'
import { ApiErrorMessage } from '@lib/ErrorMessage'
import { getBulkLTTBSampledTimeseries } from '~/api/flight/getLTTBSampledTimeseries'
import { BrushButton } from './BrushButton'
import {
  formatMillisecondsToDuration,
  getBrushedTimeValueArray,
  getSignatureDataFixedTimeShortCuts,
} from '../functions'

type ComposedBrushProps = {
  overallData: DexieLogOverallData[]
  plotNames: {
    name: string
    label: string
    color: string | undefined
    overallDataId: string
    flightid: number
    orientation: string
  }[]
  brushData: {
    [x: string]: any
  }[]
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
  totalWidthChart: number
  sampledBrushedChartData: {
    [x: string]: any
  }[]
  setSampledBrushedChartData: (
    data: {
      [x: string]: any
    }[],
  ) => void
  fetchedTimeseries: LogFileTimeSeries[]
}

export const ComposedBrush = ({
  overallData,
  plotNames,
  brushData,
  activeTimeSeries,
  customPlots,
  totalWidthChart,
  fetchedTimeseries,
  setSampledBrushedChartData,
  sampledBrushedChartData,
}: ComposedBrushProps) => {
  const windowDimensions = useWindowSize()
  const matches = useMedia({ maxWidth: 1440 })
  const { plotDrawerExtended } = useContext(UIContext)

  const [brushValues, setBrushValues] = useState<BrushDataProps[]>(
    overallData.map((flightData) => ({
      startIndex: 0,
      endIndex: brushData?.length - 1,
      flightid: flightData.flightid,
      endTimestamp: flightData.until,
      startTimestamp: flightData.from,
      intervalVisibleInChart: true,
    })),
  )

  const [currentlyFetchedData, setCurrentlyFetchedData] =
    useState<LogFileTimeSeries[]>(fetchedTimeseries)

  const fetchTimeSeriesValues = useMutation(getBulkLTTBSampledTimeseries, {
    onSuccess: (data) => {
      const flightsAffected = Array.from(
        new Set(data.map((timeseriesData) => timeseriesData.flightid)),
      )
      const unaffectedOldTimeseries = currentlyFetchedData.filter(
        (timeseries) => !flightsAffected.includes(timeseries.flightid),
      )
      const newData = getBrushedTimeValueArray({
        fetchedNewData: data,
        overallData,
        brushValues,
        totalWidthChart,
        activeTimeSeries,
        sampledBrushedChartData,
        customPlots,
      })
      setSampledBrushedChartData(newData as any)
      setCurrentlyFetchedData(
        data?.length ? unaffectedOldTimeseries?.concat(data) : currentlyFetchedData,
      )
    },
    onError: (error: AxiosError<any>) => {
      toast(<ApiErrorMessage error={error} />, {
        type: 'error',
        delay: 1,
        position: toast.POSITION.BOTTOM_CENTER,
      })
    },
  })

  //workaround really weird bug that stops brush from updating even if controlled from outside
  //https://github.com/recharts/recharts/issues/2404
  const [changeBrushWorkAroundKey, setChangeBrushWorkAroundKey] = useState(
    overallData.map((data) => ({ flightid: data.flightid, changeNumber: 1 })),
  )

  const brushDataGroubedByFlight = useMemo(() => {
    return overallData.map((data) => {
      return {
        flightid: data.flightid,
        values: brushData?.map((lineData) => {
          const { millisecondsSinceBoot, ...rest } = lineData
          const matchingPlots = Object.keys(rest)
            .filter((key) => parseInt(key.split('-')[0]) === data.flightid)
            .map((plotName) => ({
              [plotName.split('-')[1] === 'timestamp' ? 'timestamp' : plotName]: lineData[plotName],
            }))
          const reducedPlotObject = matchingPlots?.length
            ? matchingPlots.reduce((a, b) => ({ ...a, ...b }))
            : { timestamp: '' }
          return {
            ...reducedPlotObject,
            millisecondsSinceBoot,
          }
        }),
        name: `${data.flightid}-formattedTime`,
        originalLength: data.timestamps.length,
      }
    })
  }, [overallData, brushData])

  useEffect(() => {
    setBrushValues(
      overallData.map((flightData) => ({
        startIndex: 0,
        endIndex: !plotDrawerExtended
          ? (windowDimensions?.width || 0) - 133
          : (windowDimensions?.width || 0) - 609,
        flightid: flightData.flightid,
        endTimestamp: flightData.until,
        startTimestamp: flightData.from,
        intervalVisibleInChart: true,
      })),
    )
  }, [plotDrawerExtended, windowDimensions?.width, overallData])

  const onBrushDataChange = ({ brushValues }: { brushValues: BrushDataProps }) => {
    const matchingFlight = overallData.find((data) => data.flightid === brushValues.flightid)
    const isLongerTimeSpanShowedThanOriginal =
      new Date(brushValues.endTimestamp) >
      (matchingFlight?.until && isValid(matchingFlight?.until)
        ? new Date(matchingFlight?.until)
        : new Date())

    const relation =
      differenceInMilliseconds(
        matchingFlight?.until && isValid(new Date(matchingFlight?.until))
          ? new Date(matchingFlight?.until)
          : new Date(),
        new Date(brushValues.endTimestamp),
      ) /
      differenceInMilliseconds(
        new Date(brushValues.startTimestamp),
        new Date(brushValues.endTimestamp),
      )

    fetchTimeSeriesValues.mutate({
      timeseriesIdentifiers: activeTimeSeries
        .filter((timeseries) => timeseries.flightid === brushValues.flightid)
        .map((timeseries) => {
          return {
            n_datapoints: isLongerTimeSpanShowedThanOriginal
              ? totalWidthChart - Math.floor(totalWidthChart * relation)
              : totalWidthChart,
            flightid: timeseries.flightid,
            messageField: timeseries.messageField,
            messageType: timeseries.messageType,
            startDate: brushValues.startTimestamp,
            endDate: isLongerTimeSpanShowedThanOriginal
              ? matchingFlight?.until
              : brushValues.endTimestamp,
          }
        }),
    })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnBrushDataChange = useCallback(debounce(onBrushDataChange, 1500), [])

  const onClickFixedBrushButtons = ({
    newBrushData,
    matchingChangeKeyNumber,
    otherChangeKey,
    flightid,
  }: {
    flightid: number
    newBrushData: BrushDataProps
    matchingChangeKeyNumber?: number
    otherChangeKey?: {
      flightid: number
      changeNumber: number
    }[]
  }) => {
    const brushValuesOtherFlight = brushValues.filter((values) => values.flightid !== flightid)
    setBrushValues(brushValuesOtherFlight.concat(newBrushData))
    onBrushDataChange({
      brushValues: newBrushData,
    })

    const finalChangeKeys = otherChangeKey?.concat({
      flightid: flightid,
      changeNumber: (matchingChangeKeyNumber || 0) + 1,
    })

    otherChangeKey &&
      matchingChangeKeyNumber &&
      finalChangeKeys &&
      setChangeBrushWorkAroundKey(finalChangeKeys)
  }

  const onDragBrushHandlers = ({ newBrushData }: { newBrushData: BrushDataProps }) => {
    const brushValuesOtherFlight = brushValues.filter(
      (values) => values.flightid !== newBrushData.flightid,
    )

    setBrushValues(brushValuesOtherFlight.concat(newBrushData))

    debouncedOnBrushDataChange({
      brushValues: newBrushData,
    })
  }

  return (
    <div>
      {brushDataGroubedByFlight?.length
        ? brushDataGroubedByFlight?.map((data) => {
            const originalStart =
              overallData.find((flightData) => data.flightid === flightData.flightid)?.from ||
              new Date().toISOString()

            const originalEnd =
              overallData.find((flightData) => data.flightid === flightData.flightid)?.until ||
              new Date().toISOString()
            const matchingBrushValSet = brushValues?.find(
              (brushValSet) => brushValSet.flightid === data.flightid,
            )

            const matchingChangeKeyNumber = changeBrushWorkAroundKey.find(
              (values) => values.flightid === data?.flightid,
            )?.changeNumber

            const otherChangeKey = changeBrushWorkAroundKey.filter(
              (values) => values.flightid !== data?.flightid,
            )

            const isLongerFlight =
              overallData.find((overallData) => overallData.isLongerFlight)?.flightid ===
              data.flightid
            //First 30 seconds
            const signatureDataFirst30s = getSignatureDataFixedTimeShortCuts({
              fixedTimeInterval: FixedTimeIntervals.First30,
              originalStart,
              originalEnd,
              values: data.values,
              matchingBrushValSet,
              isLongerFlight,
            })

            //middle 30 seconds
            const signatureDataMiddle30s = getSignatureDataFixedTimeShortCuts({
              fixedTimeInterval: FixedTimeIntervals.Middle30,
              originalStart,
              originalEnd,
              values: data.values,
              matchingBrushValSet,
              isLongerFlight,
            })

            //Last 30 seconds
            const signatureDataLast30s = getSignatureDataFixedTimeShortCuts({
              fixedTimeInterval: FixedTimeIntervals.Last30,
              originalStart,
              originalEnd,
              values: data.values,
              matchingBrushValSet,
              isLongerFlight,
            })

            //original length

            const originalLength = getSignatureDataFixedTimeShortCuts({
              fixedTimeInterval: FixedTimeIntervals.Reset,
              originalStart,
              originalEnd,
              values: data.values,
              matchingBrushValSet,
              isLongerFlight,
            })

            return (
              <div className="relative" key={`flight-brush-${data.flightid}`}>
                <div
                  className={`w-30
                              absolute
                              right-0
                              top-3
                              -mr-2
                              mt-4
                              flex
                              h-8
                              items-center
                              justify-end
                              rounded-md
                              bg-opacity-60`}
                >
                  <BrushButton
                    active={signatureDataFirst30s?.intervalVisibleInChart}
                    onClick={() => {
                      onClickFixedBrushButtons({
                        newBrushData: {
                          ...signatureDataFirst30s,
                          flightid: data?.flightid,
                        },
                        matchingChangeKeyNumber: matchingChangeKeyNumber || 0,
                        otherChangeKey,
                        flightid: data?.flightid,
                      })
                    }}
                    fixedTimeInterval={FixedTimeIntervals.First30}
                  />
                  <BrushButton
                    active={signatureDataMiddle30s.intervalVisibleInChart}
                    onClick={() => {
                      onClickFixedBrushButtons({
                        newBrushData: {
                          ...signatureDataMiddle30s,
                          flightid: data?.flightid,
                        },
                        matchingChangeKeyNumber: matchingChangeKeyNumber || 0,
                        otherChangeKey,
                        flightid: data?.flightid,
                      })
                    }}
                    fixedTimeInterval={FixedTimeIntervals.Middle30}
                  />
                  <BrushButton
                    active={signatureDataLast30s.intervalVisibleInChart}
                    onClick={() => {
                      onClickFixedBrushButtons({
                        newBrushData: {
                          ...signatureDataLast30s,
                          flightid: data?.flightid,
                        },
                        matchingChangeKeyNumber: matchingChangeKeyNumber || 0,
                        otherChangeKey,
                        flightid: data?.flightid,
                      })
                    }}
                    fixedTimeInterval={FixedTimeIntervals.Last30}
                  />

                  <BrushButton
                    active={originalLength.intervalVisibleInChart}
                    onClick={() => {
                      onClickFixedBrushButtons({
                        newBrushData: {
                          ...originalLength,
                          flightid: data?.flightid,
                        },
                        matchingChangeKeyNumber: matchingChangeKeyNumber || 0,
                        otherChangeKey,
                        flightid: data?.flightid,
                      })
                    }}
                    fixedTimeInterval={FixedTimeIntervals.Reset}
                  />
                </div>

                <div
                  className={`absolute
                              -top-1
                              left-1/2
                              -translate-x-1/2
                              transform
                              text-center
                              text-[10px]
                            `}
                >
                  <div>
                    {`Flight ${data.flightid} - time currently shown in chart: `}
                    <span
                      className={`pl-1
                                text-primary-red`}
                    >
                      {`${formatMillisecondsToDuration({
                        milliseconds: differenceInMilliseconds(
                          matchingBrushValSet?.endTimestamp &&
                            isValid(new Date(matchingBrushValSet?.endTimestamp))
                            ? new Date(matchingBrushValSet?.endTimestamp)
                            : new Date(originalEnd),
                          matchingBrushValSet?.startTimestamp &&
                            isValid(new Date(matchingBrushValSet?.startTimestamp))
                            ? new Date(matchingBrushValSet?.startTimestamp)
                            : new Date(originalStart),
                        ),
                      })}`}
                    </span>
                  </div>

                  <div>
                    {`Flight ${data.flightid} - time in ms currently shown in chart: `}
                    <span
                      className={`pl-1
                                text-primary-red`}
                    >
                      {`${differenceInMilliseconds(
                        matchingBrushValSet?.endTimestamp &&
                          isValid(new Date(matchingBrushValSet?.endTimestamp))
                          ? new Date(matchingBrushValSet?.endTimestamp)
                          : new Date(originalEnd),
                        matchingBrushValSet?.startTimestamp &&
                          isValid(new Date(matchingBrushValSet?.startTimestamp))
                          ? new Date(matchingBrushValSet?.startTimestamp)
                          : new Date(originalStart),
                      )}`}
                    </span>
                  </div>
                  <div>{`Total milliseconds of flight: ${differenceInMilliseconds(
                    new Date(originalEnd),
                    new Date(originalStart),
                  )}`}</div>
                  <div>{`Total duration in minutes: ${formatMillisecondsToDuration({
                    milliseconds: differenceInMilliseconds(
                      matchingBrushValSet?.endTimestamp && isValid(new Date(originalStart))
                        ? new Date(matchingBrushValSet?.endTimestamp)
                        : new Date(originalEnd),
                      matchingBrushValSet?.startTimestamp && isValid(new Date(originalEnd))
                        ? new Date(matchingBrushValSet?.startTimestamp)
                        : new Date(originalStart),
                    ),
                  })}`}</div>
                </div>
                <ResponsiveContainer width="100%" height={120} id={`brush-${data?.flightid}`}>
                  <LineChart
                    //sadly recharts does not rerender brush without changing key, definitely a bug
                    key={`${data?.flightid}-${matchingChangeKeyNumber}`}
                    width={matches ? 500 : 475}
                    height={500}
                    data={data.values}
                    margin={{ bottom: 20 }}
                  >
                    {plotNames?.map((plot) => (
                      <YAxis
                        key={plot?.name}
                        width={40}
                        tick={{ fontSize: 12 }}
                        orientation={plot.orientation as 'left' | 'right' | undefined}
                        dataKey={plot?.name}
                        yAxisId={plot?.name}
                        stroke={plot?.color}
                        hide
                        label={
                          <Label
                            stroke={plot?.color}
                            className={`text-[10px]
                                        font-thin
                                        text-transparent
                                        `}
                            position="bottom"
                            value={plot?.label}
                            angle={-90}
                            offset={80}
                          ></Label>
                        }
                      />
                    ))}
                    <Brush
                      className="text-[8px]"
                      data={data.values}
                      startIndex={matchingBrushValSet?.startIndex || 0}
                      endIndex={matchingBrushValSet?.endIndex || data?.values?.length - 1}
                      dataKey={data.name}
                      height={30}
                      id="2"
                      onChange={(indices) => {
                        const millisecondsSinceBootStart = (
                          data.values[indices?.startIndex || 0] as any
                        ).millisecondsSinceBoot

                        const millisecondsSinceBootEnd = (
                          data.values[indices?.endIndex || data?.values?.length] as any
                        ).millisecondsSinceBoot

                        onDragBrushHandlers({
                          newBrushData: {
                            startIndex: indices?.startIndex || 0,
                            endIndex: indices?.endIndex || data?.values.length,
                            flightid: data?.flightid,
                            startTimestamp: isValid(
                              addMilliseconds(new Date(originalStart), millisecondsSinceBootStart),
                            )
                              ? addMilliseconds(
                                  new Date(originalStart),
                                  millisecondsSinceBootStart,
                                )?.toISOString()
                              : originalStart,
                            endTimestamp: isValid(
                              addMilliseconds(new Date(originalStart), millisecondsSinceBootEnd),
                            )
                              ? addMilliseconds(
                                  new Date(originalStart),
                                  millisecondsSinceBootEnd,
                                )?.toISOString()
                              : originalEnd,
                            intervalVisibleInChart: true,
                          },
                        })
                      }}
                    >
                      <LineChart data={data.values} className={'mt-8'}>
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
    </div>
  )
}

export const MemoizedBrushes = memo(ComposedBrush)
