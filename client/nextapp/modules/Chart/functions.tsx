import {
  differenceInSeconds,
  intervalToDuration,
  differenceInMilliseconds,
  isValid,
  addSeconds,
  addMilliseconds,
} from 'date-fns'
import { evaluate } from 'mathjs'
import { omitBy, isNil } from 'lodash'
import {
  type DexieLogOverallData,
  type DexieCustomPlot,
  type DexieLogFileTimeSeries,
} from '@idbSchema'
import { type LogFileTimeSeries } from '@schema'
import { flightModes } from 'lib/constants'
import { FixedTimeIntervals } from '@lib/globalTypes'
import type { BrushDataProps } from '@lib/globalTypes'

export const calculateSignatureNumbers = ({
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

export const getTimeInDuration = (uniqueTimestamps: string[], originalFirstDate?: string) => {
  //get time strings for the x-axis in a readable format rather than timestamp

  const dateArr = uniqueTimestamps
    ?.map((item) => ({ date: new Date(item), timestamp: item }))
    ?.sort((dateA, dateB) => Number(dateA.date) - Number(dateB.date))

  const first = originalFirstDate ? new Date(originalFirstDate) : dateArr?.[0]?.date

  const formattedTimes = dateArr?.map((date) => {
    const seconds = differenceInSeconds(first, date.date) * -1

    if (Number.isInteger(seconds)) {
      const duration = intervalToDuration({ start: 0, end: seconds * 1000 })

      const formatted = `${(duration?.hours || 0) * 60 + (duration?.minutes || 0)}:${
        duration.seconds
      }`
      return { formatted, timestamp: date.timestamp }
    } else {
      const formatted = ''
      return { formatted, timestamp: date.timestamp }
    }
  })
  return formattedTimes
}

export const splitIfDiffHigherThanOne = (arr: number[]) => {
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

export const prepareFlightModeAreas = (
  timeData: { timestring: string; formatted: string }[],
  flightModeData?: { time: string; mode: string }[],
) => {
  //Create data for the chart's flight mode areas that will be colored differently

  if (flightModeData) {
    const assignedToFlightMode = flightModes?.map((mode) => {
      return {
        mode,
        values: flightModeData
          .map((element, index) => (element.mode === mode.name ? index : -1))
          .filter((element) => element !== -1),
      }
    })

    const startEndArr = assignedToFlightMode
      ?.map((arr) => {
        const startEndArray = splitIfDiffHigherThanOne(arr.values).map((item) => ({
          mode: arr.mode,
          start: item[0],
          end: item.slice(-1)[0],
        }))

        return startEndArray
      })
      ?.reduce((a, b) => [...a, ...b])

    return startEndArr?.map((item) => ({
      mode: item.mode,
      //flight modes have a start and end time on the x-axis, but cover the whole y-axis
      start: timeData[item.start]?.formatted,
      end: timeData[item.end]?.formatted,
    }))
  }

  return null
}

export const formatMillisecondsToDuration = ({ milliseconds }: { milliseconds: number }) => {
  if (milliseconds === 0) {
    return '0'
  }
  const interval = intervalToDuration({ start: 0, end: milliseconds })

  const remainingMs = parseInt((milliseconds / 1000).toFixed(3).toString().split('.')[1])

  const formatted = `${String((interval?.hours || 0) * 60 + (interval?.minutes || 0))}:${String(
    interval.seconds,
  ).padStart(2, '0')}:${String(remainingMs).padStart(3, '0')}`

  return formatted
}

export const getCustomPlotValues = ({
  timeValueArrayTimeseries,
  customPlots,
  totalWidthChart,
}: {
  timeValueArrayTimeseries: { [x: string]: any }[]
  customPlots: DexieCustomPlot[]
  totalWidthChart: number
}) => {
  const filledUpCustomPlots = customPlots?.map((customPlot) => {
    const newValues = new Array(totalWidthChart).fill(0).map((value, i) => {
      const valueObjectWithRemovedNils = omitBy(timeValueArrayTimeseries?.[i], isNil)

      const isPastFlight =
        Object.keys(valueObjectWithRemovedNils)?.filter((key) =>
          customPlot?.calculatorExpressions
            ?.map(
              (calculatorExpression: string) => `${customPlot.flightid}-${calculatorExpression}`,
            )
            .includes(key),
        ).length !== customPlot?.calculatorExpressions?.length

      const scope = customPlot?.calculatorExpressions
        ?.map((calculatorExpression: string) => ({
          [`${calculatorExpression}`]: Object.keys(valueObjectWithRemovedNils).includes(
            `${customPlot.flightid}-${calculatorExpression}`,
          )
            ? valueObjectWithRemovedNils[`${customPlot.flightid}-${calculatorExpression}`]
            : 0,
        }))
        ?.reduce((calculatorExpressionValuePairA, calculatorExpressionValuePairB) => ({
          ...calculatorExpressionValuePairA,
          ...calculatorExpressionValuePairB,
        }))

      const finalValue = !isPastFlight
        ? evaluate(
            customPlot?.customFunction?.toUpperCase() || '0',
            Object.keys(scope)
              .map((scopeValKey: string) =>
                scope[`${scopeValKey}`] === undefined
                  ? { [`${scopeValKey}`]: 0 }
                  : { [`${scopeValKey}`]: scope[`${scopeValKey}`] },
              )
              ?.reduce((scopeValA, scopeValB) => ({ ...scopeValA, ...scopeValB })),
          )
        : undefined

      return { [`${customPlot.flightid}-${customPlot.customFunction}`]: finalValue }
    })

    return newValues
  })

  const mergedCustomPlots = filledUpCustomPlots?.length
    ? new Array(totalWidthChart).fill(0).map((value, i) => ({
        ...filledUpCustomPlots
          .map((valueArray) => valueArray[i])
          .reduce((a, b) => ({ ...a, ...b })),
      }))
    : null

  return mergedCustomPlots
}

export const getTimeValuePlotArray = ({
  overallData,
  totalWidthChart,
  activeTimeSeries,
  fetchedTimeseries,
  customPlots,
}: {
  overallData: DexieLogOverallData[]
  totalWidthChart: number

  activeTimeSeries: DexieLogFileTimeSeries[]
  fetchedTimeseries: LogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
}) => {
  if (!fetchedTimeseries?.length) {
    return null
  }
  const uniformedTimeseries = activeTimeSeries?.map((timeseries: DexieLogFileTimeSeries) => {
    return fetchedTimeseries
      ?.find(
        (data: LogFileTimeSeries) =>
          data.flightid === timeseries.flightid &&
          data.messageField === timeseries.messageField &&
          data.messageType === timeseries.messageType,
      )
      ?.values.map((valPair: { timestamp: string; value: number }) => ({
        timestamp: valPair.timestamp,
        flightid: timeseries.flightid,
        [`${timeseries.flightid}-${timeseries.calculatorExpression}`]: valPair.value,
      }))
  })

  const uniformedData = [...uniformedTimeseries] //TODO: Add custom plots
  const totalMilliseconds =
    overallData.length > 1
      ? overallData.find((data) => data.isLongerFlight)?.totalMilliseconds
      : overallData[0].totalMilliseconds

  const timestep = Math.floor((totalMilliseconds || 0) / totalWidthChart)

  const timestrings =
    totalWidthChart > 0
      ? new Array(totalWidthChart).fill(0).map((pixel, i) => {
          const millisecondsSinceBoot = timestep * i

          const formatted = formatMillisecondsToDuration({ milliseconds: millisecondsSinceBoot })

          const timePerFlight = overallData
            ?.map((flightData: DexieLogOverallData) => ({
              [`${flightData.flightid}-formattedTime`]: formatted,
            }))
            ?.reduce((a, b) => ({ ...a, ...b }))

          return { ...timePerFlight, millisecondsSinceBoot }
        })
      : []

  const preparedData: {
    [x: string]: any
  }[] = timestrings.map((time, i) => {
    const { millisecondsSinceBoot, ...timeRest } = time
    const valueArray = uniformedData.map((data) => {
      if (data?.[i]) {
        const { flightid, timestamp, ...rest } = data?.[i]
        return {
          ...rest,
          [`${flightid}-timestamp`]: timestamp,
          [`${flightid}-millisecondsSinceBoot`]: millisecondsSinceBoot,
          millisecondsSinceBoot,
        }
      }
      return []
    })
    return {
      ...timeRest,
      ...valueArray.reduce((a, b) => ({ ...a, ...b })),
    }
  })

  const mergedCustomPlots = customPlots?.length
    ? getCustomPlotValues({
        timeValueArrayTimeseries: preparedData,
        totalWidthChart,
        customPlots,
      })
    : null

  return mergedCustomPlots?.length
    ? preparedData.map((timeseriesData, i) => ({
        ...timeseriesData,
        ...(mergedCustomPlots?.[i] || {}),
      }))
    : preparedData
}

export const getBrushedTimeValueArray = ({
  fetchedNewData,
  overallData,
  brushValues,
  totalWidthChart,
  activeTimeSeries,
  sampledBrushedChartData,
  customPlots,
}: {
  fetchedNewData: LogFileTimeSeries[]
  overallData: DexieLogOverallData[]
  brushValues: BrushDataProps[]
  totalWidthChart: number
  activeTimeSeries: DexieLogFileTimeSeries[]
  sampledBrushedChartData: {
    [x: string]: any
  }[]
  customPlots: DexieCustomPlot[]
}) => {
  const flightsAffected = Array.from(
    new Set(fetchedNewData.map((timeseriesData) => timeseriesData.flightid)),
  )

  const timeDataSeparate = flightsAffected.map((flightid) => {
    const originalStartTimestamp =
      overallData.find((flightData) => flightData.flightid === flightid)?.from || 0

    const brushStartTimestamp =
      brushValues.find((brushValSet) => brushValSet.flightid === flightid)?.startTimestamp || 0
    const brushEndTimestamp =
      brushValues.find((brushValSet) => brushValSet.flightid === flightid)?.endTimestamp || 0

    const millisecondsSinceBootBrushStart = differenceInMilliseconds(
      isValid(new Date(originalStartTimestamp)) ? new Date(originalStartTimestamp) : new Date(),
      isValid(new Date(brushStartTimestamp)) ? new Date(brushStartTimestamp) : new Date(),
    )

    const millisecondsSinceBootBrushEnd = differenceInMilliseconds(
      isValid(new Date(originalStartTimestamp)) ? new Date(originalStartTimestamp) : new Date(),
      isValid(new Date(brushEndTimestamp)) ? new Date(brushEndTimestamp) : new Date(),
    )

    const totalBrushedMilliseconds = differenceInMilliseconds(
      isValid(new Date(brushStartTimestamp)) ? new Date(brushStartTimestamp) : new Date(),
      isValid(new Date(brushEndTimestamp)) ? new Date(brushEndTimestamp) : new Date(),
    )

    const step = Math.floor(totalBrushedMilliseconds / totalWidthChart)

    const timestrings = new Array(totalWidthChart).fill(0).map((time, i) => {
      return {
        [`${flightid}-formattedTime`]: formatMillisecondsToDuration({
          milliseconds: millisecondsSinceBootBrushStart + i * step,
        }),

        [`${flightid}-millisecondsSinceBoot`]: millisecondsSinceBootBrushStart + i * step,
      }
    })

    timestrings.pop()
    timestrings.push({
      [`${flightid}-formattedTime`]: formatMillisecondsToDuration({
        milliseconds: millisecondsSinceBootBrushEnd,
      }),

      [`${flightid}-millisecondsSinceBoot`]: millisecondsSinceBootBrushEnd,
    })

    return timestrings
  })

  const timeDataUnified =
    flightsAffected?.length === 1
      ? timeDataSeparate[0]
      : flightsAffected?.length > 1
      ? new Array(totalWidthChart).fill(0).map((time, i) => {
          return timeDataSeparate.reduce((a: any, b: any) => {
            return { ...a[i], ...b[i] }
          })
        })
      : []

  const timeValueArray = timeDataUnified.map((time, index) => {
    const valueForTimeObject = fetchedNewData
      .map((fetchedSeries) => {
        const valueFromFetchedData = fetchedSeries.values[index]?.value

        const calculatorExpressionValuePair = flightsAffected.map((flightidAffected) => {
          const dexieTimeseriesData = activeTimeSeries
            .filter(
              (dexieTimeseries) =>
                dexieTimeseries.messageField === fetchedSeries.messageField &&
                dexieTimeseries.messageType === fetchedSeries.messageType &&
                dexieTimeseries.flightid === flightidAffected,
            )
            .map((timeseries) => {
              return {
                [`${timeseries.flightid}-${timeseries.calculatorExpression}`]: valueFromFetchedData,
              }
            })

          return dexieTimeseriesData
        })

        return calculatorExpressionValuePair
      })
      .flat()

    const flatValueForTimeObject = valueForTimeObject?.map((obj) => obj[0])

    const combinedVals =
      valueForTimeObject?.length === 1
        ? flatValueForTimeObject?.[0]
        : valueForTimeObject?.length > 1
        ? flatValueForTimeObject.reduce((a, b) => ({ ...a, ...b }))
        : valueForTimeObject

    return {
      ...time,
      ...combinedVals,
    }
  })

  const newData = sampledBrushedChartData.slice().map((oldValueTimeObject, i) => {
    return {
      ...oldValueTimeObject,
      ...timeValueArray[i],
    }
  })

  const customPlotValuesPerPixel = getCustomPlotValues({
    timeValueArrayTimeseries: newData,
    customPlots,
    totalWidthChart,
  })

  const mergedTimeseriesCustomPlotData = customPlotValuesPerPixel?.length
    ? newData.map((timeseriesData, i) => ({
        ...timeseriesData,
        ...(customPlotValuesPerPixel?.[i] || {}),
      }))
    : newData

  return mergedTimeseriesCustomPlotData
}

export const getSignatureDataFixedTimeShortCuts = ({
  fixedTimeInterval,
  originalStart,
  originalEnd,
  values,
  matchingBrushValSet,
  isLongerFlight,
}: {
  fixedTimeInterval: FixedTimeIntervals
  isLongerFlight: boolean
  originalStart: string
  originalEnd: string
  values: any[]
  matchingBrushValSet: BrushDataProps | undefined
}) => {
  switch (fixedTimeInterval) {
    case FixedTimeIntervals.First30:
      const timestampFirst30End =
        originalStart !== '' ? addSeconds(new Date(originalStart), 30) : new Date()

      const endFirst30s = values.findIndex(
        (val: any) => new Date(val.timestamp) > new Date(timestampFirst30End),
      )
      return {
        startIndex: 0,
        endIndex: endFirst30s,
        startTimestamp: originalStart,
        endTimestamp: timestampFirst30End.toISOString(),
        intervalVisibleInChart:
          matchingBrushValSet?.startIndex === 0 && matchingBrushValSet.endIndex === endFirst30s,
      }
    case FixedTimeIntervals.Middle30:
      const halfMilliseconds = Math.floor(
        differenceInMilliseconds(new Date(originalEnd), new Date(originalStart)) / 2,
      )
      const timestampStartMiddle30 = addMilliseconds(
        new Date(originalStart),
        halfMilliseconds - 15000,
      )
      const startIndexMiddle30s = values.findIndex(
        (val: any) => new Date(val.timestamp) > new Date(timestampStartMiddle30),
      )
      const timestampEndMiddle30 = addMilliseconds(
        new Date(originalStart),
        halfMilliseconds + 15000,
      )
      const endIndexMiddle30s = values.findIndex(
        (val: any) => new Date(val.timestamp) > new Date(timestampEndMiddle30),
      )
      return {
        startIndex: startIndexMiddle30s,
        endIndex: endIndexMiddle30s,
        startTimestamp: timestampStartMiddle30.toISOString(),
        endTimestamp: timestampEndMiddle30.toISOString(),
        intervalVisibleInChart:
          matchingBrushValSet?.startIndex === startIndexMiddle30s &&
          matchingBrushValSet.endIndex === endIndexMiddle30s,
      }

    case FixedTimeIntervals.Last30:
      const timestampStartLast30 = addSeconds(new Date(originalEnd), -30)
      const startIndexEnd30s = values.findIndex(
        (val: any) => new Date(val.timestamp) >= new Date(timestampStartLast30),
      )

      const endIndexEnd30s = !isLongerFlight
        ? values.findIndex((val: any) => !Object.keys(val).includes('timestamp')) - 1
        : values.length - 1

      return {
        startIndex: startIndexEnd30s,
        endIndex: endIndexEnd30s,
        startTimestamp: timestampStartLast30.toISOString(),
        endTimestamp: originalEnd,
        intervalVisibleInChart:
          matchingBrushValSet?.startIndex === startIndexEnd30s &&
          matchingBrushValSet?.endIndex >= endIndexEnd30s,
      }

    case FixedTimeIntervals.Reset:
      const hasOriginalLength =
        matchingBrushValSet?.startIndex === 0 && matchingBrushValSet.endIndex === values.length
      return {
        startIndex: 0,
        endIndex: values.length - 1,
        startTimestamp: originalStart,
        endTimestamp: originalEnd,
        intervalVisibleInChart: hasOriginalLength,
      }
  }
}
