import { useMemo } from 'react'
import useMedia from '@charlietango/use-media'
import { intervalToDuration } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Brush, Label } from 'recharts'
import type { DexieCustomPlot, DexieLogFileTimeSeries, DexieLogOverallData } from '@idbSchema'
import { getTimeInDuration, getPlotValuesPerTimeUnit } from './chartCalculationHelpers'

type BrushesTwoFlightsProps = {
  setBrushValues: (
    brushValues: {
      startIndex: number
      endIndex: number
      flightid: number
    }[],
  ) => void
  brushValues: {
    startIndex: number
    endIndex: number
    flightid: number
  }[]
  overallData: DexieLogOverallData[]
  filledUpTimeseries: DexieLogFileTimeSeries[]
  filledUpCustomPlots: DexieCustomPlot[]
  plotNames: {
    name: string
    label: string
    color: string | undefined
    overallDataId: string
    flightid: number
    orientation: string
  }[]
}
export const BrushesTwoFlights = ({
  setBrushValues,
  brushValues,
  overallData,
  filledUpTimeseries,
  filledUpCustomPlots,
  plotNames,
}: BrushesTwoFlightsProps) => {
  const matches = useMedia({ maxWidth: 1440 })

  const preparedLineData = useMemo(() => {
    const unsorted = [
      ...(filledUpTimeseries?.length ? filledUpTimeseries?.map((series) => series.values) : []),
      ...(filledUpCustomPlots?.length
        ? filledUpCustomPlots?.filter((plot) => !!plot.customFunction).map((plot) => plot.values)
        : []),
    ]

    const unifiedData = unsorted[0]
      ? getTimeInDuration(unsorted[0]?.map((time) => time.timestamp)).map(
          (timestamp, indexValueUnit) => {
            return getPlotValuesPerTimeUnit({
              timestamp,
              indexValueUnit,
              activeTimeSeries: filledUpTimeseries,
              customPlots: filledUpCustomPlots,
              isUsingFlightIdInPlotName: true,
            })
          },
        )
      : []

    return unifiedData
  }, [filledUpTimeseries, filledUpCustomPlots])

  const brushData = useMemo(() => {
    return overallData.map((data) => {
      const values = preparedLineData.map((preparedData: any) => {
        const filteredVals = Object.keys(preparedData)
          .filter((key) => parseInt(key.split('-')[0]) === data.flightid)
          .map((key) => ({
            [key]: preparedData[key],
          }))

        const valuePairsMatchingFlight = filteredVals.length
          ? filteredVals?.reduce((a, b) => ({ ...a, ...b }))
          : {}

        return {
          name: preparedData.name,
          ...valuePairsMatchingFlight,
        }
      })

      return {
        flightid: data.flightid,
        values: values,
        originalLength: data.timestamps.length,
      }
    })
  }, [overallData, preparedLineData])

  return (
    <>
      {brushData?.length && brushValues.length
        ? brushData?.map((data, i) => {
            const matchingBrushValSet = brushValues?.find(
              (brushValSet) => brushValSet.flightid === data.flightid,
            )

            return (
              <div className="relative" key={`flight-brush-${data.flightid}`}>
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
                    {`Flight ${data.flightid} - seconds shown in chart:`}{' '}
                    <span className="text-primary-red">{`${
                      matchingBrushValSet?.endIndex || matchingBrushValSet?.startIndex
                        ? matchingBrushValSet?.endIndex - matchingBrushValSet?.startIndex
                        : 'all of them'
                    }`}</span>
                  </div>

                  <div>{`Total seconds of flight: ${data.originalLength}`}</div>
                  <div>{`Duration in minutes: ${
                    (intervalToDuration({ start: 0, end: data.originalLength * 1000 }).hours || 0) *
                      60 +
                    (intervalToDuration({ start: 0, end: data.originalLength * 1000 }).minutes || 0)
                  }:${
                    intervalToDuration({ start: 0, end: data.originalLength * 1000 }).seconds
                  }`}</div>
                </div>
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart
                    width={matches ? 500 : 475}
                    height={500}
                    data={data.values}
                    margin={{ bottom: 20 }}
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
                      data={data.values}
                      startIndex={matchingBrushValSet?.startIndex || 0}
                      endIndex={(matchingBrushValSet?.endIndex || data?.values.length) - 1}
                      dataKey={'name'}
                      height={30}
                      id="2"
                      onChange={(indices) => {
                        const brushValuesOtherFlight = brushValues.filter(
                          (values) => values.flightid !== data?.flightid,
                        )
                        const finalIndices = {
                          startIndex: indices?.startIndex || 0,
                          endIndex: indices?.endIndex || data?.values.length,
                        }
                        setBrushValues(
                          brushValuesOtherFlight.concat({
                            ...finalIndices,
                            flightid: data?.flightid,
                          }),
                        )

                        return indices
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
    </>
  )
}
