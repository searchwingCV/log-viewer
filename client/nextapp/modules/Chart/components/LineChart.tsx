/* 
   Complex component to plot the data, based on recharts.js,
   - LineChart component from recharts is used here
   - plots individual timeseries & custom plots of ONE flight
   - logic for single and two-flights charts is too different to be rendered in one component
 */
import { useEffect, useState } from 'react'
import useMedia from '@charlietango/use-media'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts'
import clsx from 'clsx'
import { widthYAxis } from '~/lib/constants'

import { type DexieCustomPlot, type DexieLogFileTimeSeries } from '@idbSchema'
import { type LogFileTimeSeries } from '@schema'
import { CustomTooltip } from './CustomToolTip'
import { MemoizedBrushes } from './Brush'
import { ShorterFlightXAxisTop } from './ShorterFlightXAxisTop'
import type { LineChartComponentProps } from '../LineChartComponent'

export interface LineChartProps extends LineChartComponentProps {
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
  chartWidth: number
  plotNames: {
    color: string | undefined
    flightid: number
    label: string
    name: string
    orientation: string
    overallDataId: string
  }[]
  totalWidthChart: number
  processedData: {
    [x: string]: string | number
  }[]
  processedBrushData: {
    [x: string]: string | number
  }[]
  fetchedTimeseries: LogFileTimeSeries[]
  renderKey: string
}

export const LineChart = ({
  overallData,
  activeTimeSeries, //only timeseries that are saved in IndexedDB are shown
  customPlots, //only customPlots that are saved in IndexedDB are shown
  processedBrushData,
  plotNames,
  totalWidthChart,
  processedData,
  fetchedTimeseries,
  renderKey,
}: LineChartProps) => {
  const [sampledBrushedChartData, setSampledBrushedChartData] = useState(processedData)

  const matches = useMedia({ maxWidth: 1440 })

  const originalLongerFlight =
    overallData.find((flightData) => flightData.isLongerFlight) || overallData[0]
  const originalShorterFlight =
    overallData.find((flightData) => !flightData.isLongerFlight) || overallData[0]

  useEffect(() => {
    setSampledBrushedChartData(processedData)
  }, [processedData])

  if (!processedBrushData.length) {
    return null
  }

  return (
    <>
      {overallData.length > 1 ? (
        <ShorterFlightXAxisTop
          plotNames={plotNames}
          overallData={overallData}
          customPlots={customPlots}
          activeTimeSeries={activeTimeSeries}
          topXAxisData={sampledBrushedChartData}
          idShorterFlight={originalShorterFlight.flightid}
        />
      ) : null}

      <div className="relative">
        {overallData.length > 1 ? (
          <div
            className={clsx(`absolute
                             -top-32
                             text-[9px]`)}
            style={{
              left:
                (activeTimeSeries.filter(
                  (series) => series.flightid === originalShorterFlight.flightid && !series.hidden,
                ).length +
                  customPlots.filter(
                    (plot) => plot.flightid === originalShorterFlight.flightid && !plot.hidden,
                  ).length) *
                widthYAxis,
            }}
          >
            {`Top X Axis Shorter Flight ${originalShorterFlight.flightid}`}
          </div>
        ) : null}
        <ResponsiveContainer
          width="100%"
          height={overallData.length < 2 ? 570 : matches ? 400 : 550}
          id={`chart-${renderKey}`}
        >
          <RechartsLineChart
            width={matches ? 500 : 475}
            height={500}
            data={sampledBrushedChartData}
            margin={{ bottom: 100 }}
            key={`chart-${renderKey}`}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={`${originalLongerFlight.flightid}-formattedTime`}
              interval="preserveStartEnd"
              className={`!text-[9px]
                          font-thin`}
              angle={70}
              offset={-150}
              dy={30}
            />
            {plotNames?.map((plot) => (
              <YAxis
                width={widthYAxis}
                key={plot?.name}
                tick={{ fontSize: 8 }}
                orientation={plot.orientation as 'left' | 'right' | undefined}
                dataKey={plot?.name}
                yAxisId={plot?.name}
                stroke={plot?.color}
                label={
                  <Label
                    stroke={plot?.color}
                    position={'bottom'}
                    className={clsx(
                      `max-w-[100px]
                       text-[8px]
                       font-thin`,
                    )}
                    value={plot?.label}
                    offset={0}
                    height={100}
                    angle={90}
                    dx={plot.orientation === 'right' ? 12 : 0}
                  ></Label>
                }
              />
            ))}

            <Tooltip
              content={(props: any) => (
                <CustomTooltip
                  toolTipProps={props}
                  flightIds={overallData.map((flightData) => flightData.flightid)}
                />
              )}
            />
            {plotNames?.map((plot, i) => (
              <Line
                id={plot?.name}
                yAxisId={plot?.name}
                type="monotone"
                dataKey={plot?.name}
                stroke={plot?.color}
                fill={plot?.color}
                dot={false}
                key={plot?.name}
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
          </RechartsLineChart>
        </ResponsiveContainer>
        {overallData.length > 1 ? (
          <div
            className={clsx(`absolute
                             bottom-8
                             text-end
                             text-[9px]`)}
            style={{
              right:
                (activeTimeSeries.filter(
                  (series) => series.flightid === originalLongerFlight.flightid,
                ).length +
                  customPlots.filter((plot) => plot.flightid === originalLongerFlight.flightid)
                    .length) *
                widthYAxis,
            }}
          >
            {`Bottom X Axis Longer Flight ${originalLongerFlight.flightid}`}
          </div>
        ) : null}
      </div>
      <div className="-mt-8">
        <MemoizedBrushes
          overallData={overallData}
          plotNames={plotNames}
          brushData={processedBrushData}
          activeTimeSeries={activeTimeSeries}
          customPlots={customPlots}
          totalWidthChart={totalWidthChart}
          fetchedTimeseries={fetchedTimeseries}
          sampledBrushedChartData={sampledBrushedChartData}
          setSampledBrushedChartData={(
            data: {
              [x: string]: string | number
            }[],
          ) => setSampledBrushedChartData(data)}
        />
      </div>
    </>
  )
}
