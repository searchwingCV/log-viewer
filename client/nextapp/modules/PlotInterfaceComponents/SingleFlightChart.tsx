/* 
   Complex component to plot the data, based on recharts.js,
   - LineChart component from recharts is used here
   - plots individual timeseries & custom plots of ONE flight
   - logic for single and two flight charts is too different to be rendered in one component
 */
import { useMemo } from 'react'

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
import {
  type DexieCustomPlot,
  type DexieLogOverallData,
  type DexieLogFileTimeSeries,
} from '@idbSchema'
import type { LineChartComponentProps } from './LineChartComponent'

import {
  getTimeInDuration,
  prepareFlightModeAreas,
  calculateSignatureNumbers,
  getPlotValuesPerTimeUnit,
} from './chartCalculationHelpers'

export type SingleFlightChartProps = Omit<LineChartComponentProps, 'overallData'> & {
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
  overallData: DexieLogOverallData
}

export const SingleFlightChart = ({
  overallData,
  flightId,
  activeTimeSeries, //only timeseries that are saved in IndexedDB are shown
  customPlots, //only customPlots that are saved in IndexedDB are shown
}: SingleFlightChartProps) => {
  const matches = useMedia({ maxWidth: 1440 })

  //signatureNumbers (min, max, avg) for each plot to be shown in an info board
  const signatureNumbers = useMemo(() => {
    const customPlotSignatureNumbers = customPlots?.map((propTypes: DexieCustomPlot) =>
      propTypes?.values?.length
        ? calculateSignatureNumbers({
            name: propTypes.customFunction,
            values: propTypes.values.map((valPair) => valPair.value),
            flightid: propTypes.flightid,
          })
        : null,
    )
    const activeTimeSeriesSignatureNumbers = activeTimeSeries?.map(
      (propTypes: DexieLogFileTimeSeries) =>
        propTypes?.values?.length
          ? calculateSignatureNumbers({
              name: propTypes.calculatorExpression,
              values: propTypes.values.map((valPair) => valPair.value),
              flightid: propTypes.flightid,
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
          (timestamp, indexValueUnit) =>
            //   const timeseriesPlotValueInfo = activeTimeSeries?.length
            //     ? activeTimeSeries
            //         .map((plot) => ({
            //           [plot.calculatorExpression]: plot?.values?.[indexValueUnit]?.value || NaN,
            //         }))
            //         ?.reduce((a, b) => ({
            //           ...a,
            //           ...b,
            //         }))
            //     : []

            //   const customPlotValueInfo = customPlots?.length
            //     ? customPlots
            //         ?.map((plot) => ({
            //           [plot.customFunction]: plot?.values?.[indexValueUnit]?.value || NaN,
            //         }))
            //         ?.reduce((a, b) => ({
            //           ...a,
            //           ...b,
            //         }))
            //     : []

            //   return {
            //     name: timestamp.formatted,
            //     timestring: timestamp.timestamp,
            //     ...timeseriesPlotValueInfo,
            //     ...customPlotValueInfo,
            //   }
            // },

            getPlotValuesPerTimeUnit({ timestamp, indexValueUnit, activeTimeSeries, customPlots }),
        )
      : []

    return unifiedData
  }, [activeTimeSeries, customPlots])

  //Data formatted to represent flight modes on the x-axis, rendered with rechart's ReferenceArea
  const flightModeAreas = useMemo(
    () =>
      overallData?.flightModeTimeSeries
        ? prepareFlightModeAreas(
            preparedLineData.map((item) => ({
              timestring: item.timestring,
              formatted: item.name,
            })) as { timestring: string; formatted: string }[],
            overallData.flightModeTimeSeries,
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
        overallDataId: plot.overallDataId,
        flightid: plot.flightid,
      }))
    const activeTimeSeriesNames = activeTimeSeries
      ?.filter((timeseries) => !timeseries.hidden)
      ?.map((plotTypes: DexieLogFileTimeSeries) => ({
        name: plotTypes.calculatorExpression,
        label: plotTypes.calculatorExpression,
        color: plotTypes.color,
        overallDataId: plotTypes.overallDataId,
        flightid: plotTypes.flightid,
      }))

    const unified = activeTimeSeriesNames?.concat(customPlotNames)

    // return overallDataIds?.map((id) => unified.filter((plot) => plot.overallDataId === id))

    return unified
  }, [customPlots, activeTimeSeries])

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
                  >{`FLIGHT ${flightId}`}</div>
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
                  offset={50}
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
          <Brush data={preparedLineData} dataKey={'name'} height={100}>
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

          {flightModeAreas
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
            : null}
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
