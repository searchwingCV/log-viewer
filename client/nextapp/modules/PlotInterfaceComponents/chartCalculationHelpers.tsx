import { differenceInSeconds, intervalToDuration, format, addSeconds } from 'date-fns'
import { last } from 'lodash'
import {
  type DexieLogOverallData,
  type DexieCustomPlot,
  type DexieLogFileTimeSeries,
} from '@idbSchema'
import { flightModes } from './flightModes'
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

export const getPlotValuesPerTimeUnit = ({
  timestamp,
  indexValueUnit,
  activeTimeSeries,
  customPlots,
  isUsingFlightIdInPlotName,
  flightid,
}: {
  timestamp: { timestamp: string; formatted: string }
  indexValueUnit: number
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
  isUsingFlightIdInPlotName?: boolean
  flightid?: number
}) => {
  // const shorterId = shorterTimeseries?.[0]?.flightid

  const timeseriesPlotValueInfo = activeTimeSeries?.length
    ? activeTimeSeries
        .map((plot) => {
          return !isUsingFlightIdInPlotName
            ? {
                [`${plot.calculatorExpression}`]: plot?.values?.[indexValueUnit]?.value || NaN,
              }
            : {
                [`${plot.flightid ? `${plot.flightid}-` : ``}${plot.calculatorExpression}`]:
                  plot?.values?.[indexValueUnit]?.value || NaN,
              }
        })
        ?.reduce((a, b) => ({
          ...a,
          ...b,
        }))
    : []

  const customPlotValueInfo: any = customPlots?.length
    ? customPlots
        .map((plot) =>
          !isUsingFlightIdInPlotName
            ? {
                [`${plot.customFunction}`]: plot?.values?.[indexValueUnit]?.value || NaN,
              }
            : {
                [`${plot.flightid ? `${plot.flightid}-` : ``}${plot.customFunction}`]:
                  plot?.values?.[indexValueUnit]?.value || NaN,
              },
        )
        ?.reduce((a, b) => ({
          ...a,
          ...b,
        }))
    : []

  return {
    flightid: flightid,
    name: timestamp.formatted,
    prop: timestamp.formatted,
    timestring: timestamp.timestamp,
    ...timeseriesPlotValueInfo,
    ...customPlotValueInfo,
    leftXAxisTimeValue: '',
  }
}

export const fillUpValueArrayToMatchLongerFLight = ({
  values,
  originalLongerFlightTimestamps,
  onlyReturnTimestamps,
}: {
  values:
    | {
        timestamp: string
        value: number
      }[]
    | string[]
  originalLongerFlightTimestamps: string[]
  onlyReturnTimestamps?: boolean
}) => {
  const lastValue = values[values.length - 1]

  const lastDate = (
    lastValue as {
      timestamp: string
      value: number
    }
  )?.timestamp
    ? new Date(
        (
          lastValue as {
            timestamp: string
            value: number
          }
        ).timestamp,
      )
    : new Date(lastValue as string)

  const lasValueWithOffset = new Date(
    lastDate.setTime(lastDate.getTime() + lastDate.getTimezoneOffset() * 60 * 1000),
  )

  const arrayToConcat = originalLongerFlightTimestamps
    .slice(values.length - originalLongerFlightTimestamps.length)
    .map((timestamp, i) => {
      const time = format(addSeconds(lasValueWithOffset, i + 1), "yyyy-MM-dd'T'hh:mm:ss.SSS'Z'")
      if (onlyReturnTimestamps) {
        return time
      }
      return {
        timestamp: time,
        value: NaN,
      }
    })

  return arrayToConcat
}
