/* 
   Complex component to plot the data, based on recharts.js,
   - LineChart component from recharts is used here
   - plots individual timeseries & custom plots of ONE flight
   - logic for single and two flight charts is too different to be rendered in one component
 */
import { useEffect, useMemo, useState } from 'react'

import useMedia from '@charlietango/use-media'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Label,
} from 'recharts'
import { type DexieCustomPlot, type DexieLogFileTimeSeries } from '@idbSchema'
import type { LineChartComponentProps } from './LineChartComponent'

import {
  getTimeInDuration,
  getPlotValuesPerTimeUnit,
  fillUpValueArrayToMatchLongerFLight,
} from './chartCalculationHelpers'
import { BrushesTwoFlights } from './BrushesTwoFlights'
import { LegendAndLeftXAxisTwoFlights } from './LegendAndLeftXAxisTwoFlight'

const CustomTooltip = ({
  flightIds,
  toolTipProps,
  leftXAxisData,
  originalLongerFlightId,
}: {
  flightIds: number[]
  toolTipProps: any
  leftXAxisData: { name: string }[]
  originalLongerFlightId: number
}) => {
  const calculateIndex = () => {
    const fullWidth = (toolTipProps?.viewBox?.width || 0) as number
    const oneUnitViewBoxWidth = fullWidth / 100000
    const oneUnitLeftXAxis = leftXAxisData.length / 100000
    const xCoordinate = toolTipProps.coordinate.x - ((toolTipProps?.viewBox?.left || 0) as number)

    const index = Math.ceil((xCoordinate / oneUnitViewBoxWidth) * oneUnitLeftXAxis)
    const thresholdedIndex =
      index > leftXAxisData.length ? leftXAxisData.length - 1 : index === 0 ? 0 : index - 1
    return thresholdedIndex
  }

  return (
    <div className="rounded-md border border-grey-medium bg-white px-4 py-4">
      {flightIds.map((flightid) => (
        <div key={`tooltip-${flightid}`} className="mb-2">
          <div>{`Flight ${flightid}`}</div>
          {toolTipProps?.payload
            ?.filter((payload: any) => payload.name.split('-')[0] === flightid.toString())
            .map((payload: any, i: number) => (
              <div key={`tooltip-payload-${payload.name}`}>
                {originalLongerFlightId === flightid && i === 0
                  ? `Time: ${payload.payload.name}`
                  : originalLongerFlightId !== flightid && i === 0
                  ? `Time: ${leftXAxisData[calculateIndex()].name || 'after the flight'}`
                  : ``}
                <p style={{ color: payload.stroke }}>{`${payload.name}: ${payload.value}`}</p>
              </div>
            ))}
        </div>
      ))}
    </div>
  )

  return null
}

export interface TwoFlightChartProps extends LineChartComponentProps {
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
}

export const TwoFlightChart = ({
  overallData,
  flightId,
  activeTimeSeries, //only timeseries that are saved in IndexedDB are shown
  customPlots, //only customPlots that are saved in IndexedDB are shown
}: TwoFlightChartProps) => {
  const matches = useMedia({ maxWidth: 1440 })

  console.log(overallData[0].timestamps.length)

  const originalLongerFlight = useMemo(
    () =>
      overallData?.reduce((dataA, dataB) =>
        dataA?.timestamps?.length > dataB?.timestamps?.length ? dataA : dataB,
      ),
    [overallData],
  )

  const originalShorterFlight = useMemo(
    () =>
      overallData?.reduce((dataA, dataB) =>
        dataA?.timestamps?.length < dataB?.timestamps?.length ? dataA : dataB,
      ),
    [overallData],
  )

  const filledUpTimeseries = useMemo(
    () =>
      activeTimeSeries?.map((timeseries) => {
        if (timeseries.values.length < originalLongerFlight?.timestamps?.length) {
          const { values, ...rest } = timeseries

          return {
            ...rest,
            values: values.concat(
              fillUpValueArrayToMatchLongerFLight({
                values,
                originalLongerFlightTimestamps: originalLongerFlight.timestamps,
              }) as {
                timestamp: string
                value: number
              }[],
            ),
          }
        }
        return timeseries
      }),
    [originalLongerFlight.timestamps, activeTimeSeries],
  )

  const filledUpCustomPlots = useMemo(
    () =>
      customPlots?.map((customPlot) => {
        if (customPlot.values.length < originalLongerFlight.timestamps.length) {
          const { values, ...rest } = customPlot
          return {
            ...rest,
            values: values.concat(
              fillUpValueArrayToMatchLongerFLight({
                values,
                originalLongerFlightTimestamps: originalLongerFlight.timestamps,
              }) as {
                timestamp: string
                value: number
              }[],
            ),
          }
        }
        return customPlot
      }),
    [originalLongerFlight.timestamps, customPlots],
  )

  const orientationMapping = overallData?.map((data, i) => ({
    id: data.id,
    orientation: (i + 1) % 2 === 1 ? 'left' : 'right',
  }))

  const [brushValues, setBrushValues] = useState<
    {
      startIndex: number
      endIndex: number
      flightid: number
    }[]
  >([])

  useEffect(() => {
    setBrushValues(
      overallData.map((data) => ({
        flightid: data.flightid,
        startIndex: 0,
        endIndex: originalLongerFlight?.timestamps?.length,
      })),
    )
  }, [originalLongerFlight, overallData])

  const brushedTimeseriesData = useMemo(() => {
    const brushedTimeseries = brushValues?.length
      ? filledUpTimeseries?.map((timeseries) => {
          const brushIndices = brushValues.find(
            (brushValueSet) => brushValueSet.flightid === timeseries.flightid,
          )

          if (brushIndices) {
            const { values, ...rest } = timeseries

            const sliced = timeseries.values.slice(brushIndices.startIndex, brushIndices.endIndex)
            return {
              firstTimeStamp: timeseries.values[0],
              values: sliced,
              ...rest,
            }
          }
          return timeseries
        })
      : filledUpTimeseries

    const brushedCustomPlots = brushValues?.length
      ? filledUpCustomPlots?.map((customPlot) => {
          const brushIndices = brushValues.find(
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
      : filledUpCustomPlots

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

    const shorterTimeseries = unsorted.find(
      (plot) => plot[0].flightid !== longerTimeseries?.[0].flightid,
    )

    const rightXAxisTimeseries =
      longerTimeseries && longerTimeseries?.[0].flightid !== originalLongerFlight.flightid
        ? shorterTimeseries?.concat(
            Array(longerTimeseries?.length - (shorterTimeseries?.length || 0)).fill({
              name: 'N/V',
            }),
          )
        : longerTimeseries

    const unifiedData = rightXAxisTimeseries?.length
      ? getTimeInDuration(
          rightXAxisTimeseries.map((timeseries) => timeseries.timestamp),
          originalLongerFlight.from,
        ).map((timestamp, indexValueUnit) => {
          return getPlotValuesPerTimeUnit({
            timestamp,
            indexValueUnit,
            activeTimeSeries: brushedTimeseries,
            customPlots: brushedCustomPlots,
            isUsingFlightIdInPlotName: true,
          })
        })
      : []

    return unifiedData
  }, [
    brushValues,
    customPlots,
    filledUpCustomPlots,
    filledUpTimeseries,
    originalLongerFlight.flightid,
    originalLongerFlight.from,
  ])

  //Data formatted to represent flight modes on the x-axis, rendered with rechart's ReferenceArea
  //  const flightModeAreas = useMemo(
  //    () =>
  //      overallData?.flightModeTimeSeries
  //        ? prepareFlightModeAreas(
  //            preparedLineData.map((item) => ({
  //              timestring: item.timestring,
  //              formatted: item.name,
  //            })) as { timestring: string; formatted: string }[],
  //            overallData.flightModeTimeSeries,
  //          )
  //        : undefined,
  //    [overallData, preparedLineData],
  //  )
  //plot name data for labelling plots in chart and brush
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

    return unified
  }, [customPlots, activeTimeSeries, orientationMapping])

  const leftXAxisData = useMemo(() => {
    const valuesToFillUp = fillUpValueArrayToMatchLongerFLight({
      values: originalShorterFlight.timestamps,
      originalLongerFlightTimestamps: originalLongerFlight.timestamps,
      onlyReturnTimestamps: true,
    })

    const filledUpTimestampsLeftXAxis = originalShorterFlight?.timestamps.concat(
      valuesToFillUp.map((val) => ''),
    )

    const matchingBrushValues = brushValues.find(
      (valSet) => valSet.flightid === originalShorterFlight.flightid,
    )
    const otherBrushValues = brushValues.find(
      (valSet) => valSet.flightid !== originalShorterFlight.flightid,
    )

    const numberOfValuesShownOriginalShorterFlight =
      (matchingBrushValues?.endIndex || filledUpTimestampsLeftXAxis.length - 1) -
      (matchingBrushValues?.startIndex || 0)

    const numberOfValuesShownOriginalLongerFlight =
      (otherBrushValues?.endIndex || filledUpTimestampsLeftXAxis.length - 1) -
      (otherBrushValues?.startIndex || 0)

    const diffShorterToLongerFlight =
      numberOfValuesShownOriginalShorterFlight - numberOfValuesShownOriginalLongerFlight

    const timestampsToBeShown =
      //if brush and therefore chart still has the same length
      numberOfValuesShownOriginalShorterFlight === filledUpTimestampsLeftXAxis.length
        ? filledUpTimestampsLeftXAxis
        : //if chart of left x axis flight has more values
        diffShorterToLongerFlight > 0
        ? //if current number of longer flight (right x axis) smaller than the og left x axis flight
          numberOfValuesShownOriginalLongerFlight < originalShorterFlight?.timestamps.length - 1
          ? filledUpTimestampsLeftXAxis.slice(
              matchingBrushValues?.startIndex,
              matchingBrushValues?.endIndex,
            )
          : //else: make sure that endIndex also includes the difference because the zoom
            //and number of total values shown always follows the longer flight
            filledUpTimestampsLeftXAxis.slice(
              matchingBrushValues?.startIndex,
              (matchingBrushValues?.endIndex || filledUpTimestampsLeftXAxis.length - 1) -
                diffShorterToLongerFlight,
            )
        : //if left x axis shorter than right one: since the visible area follows the longer flight
          //which in this case is the right x axis flight, then don't change the total number
          //of left x axis values but just hide the time values that were cut off by the brush
          filledUpTimestampsLeftXAxis
            .slice(
              matchingBrushValues?.startIndex,
              matchingBrushValues?.endIndex || filledUpTimestampsLeftXAxis.length - 1,
            )
            .concat(Array(-diffShorterToLongerFlight).fill({ name: '' }))

    return getTimeInDuration(timestampsToBeShown, originalShorterFlight.timestamps[0]).map(
      (time) => ({
        name: time.formatted,
      }),
    )
  }, [brushValues, originalShorterFlight, originalLongerFlight.timestamps])

  return (
    <>
      <LegendAndLeftXAxisTwoFlights
        plotNames={plotNames}
        overallData={overallData}
        customPlots={customPlots}
        activeTimeSeries={activeTimeSeries}
        leftXAxisData={leftXAxisData}
      />

      <ResponsiveContainer width="100%" height={matches ? 400 : 450}>
        <LineChart
          width={matches ? 500 : 475}
          height={500}
          data={brushedTimeseriesData}
          margin={{ bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval="preserveStartEnd" />
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
          <Tooltip
            content={(props: any) => (
              <CustomTooltip
                toolTipProps={props}
                leftXAxisData={leftXAxisData}
                flightIds={overallData.map((data) => data.flightid)}
                originalLongerFlightId={originalLongerFlight.flightid}
              />
            )}
          />
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

          {/* {flightModeAreas
               ? flightModeAreas?.map((areaData) => (
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
                 ))
                    : null} */}
        </LineChart>
      </ResponsiveContainer>
      <BrushesTwoFlights
        setBrushValues={setBrushValues}
        brushValues={brushValues}
        overallData={overallData}
        filledUpTimeseries={filledUpTimeseries}
        filledUpCustomPlots={filledUpCustomPlots}
        plotNames={plotNames}
      />
    </>
  )
}
