import { useMemo } from 'react'
import clsx from 'clsx'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend, Label } from 'recharts'
import useMedia from '@charlietango/use-media'
import type { DexieCustomPlot, DexieLogFileTimeSeries, DexieLogOverallData } from '@idbSchema'
import { calculateSignatureNumbers } from './chartCalculationHelpers'

type LegendAndLeftXAxisTwoFlightsProps = {
  plotNames: {
    name: string
    label: string
    color: string | undefined
    overallDataId: string
    flightid: number
    orientation: string
  }[]
  overallData: DexieLogOverallData[]
  customPlots: DexieCustomPlot[]
  activeTimeSeries: DexieLogFileTimeSeries[]
  leftXAxisData: { name: string }[]
}

export const LegendAndLeftXAxisTwoFlights = ({
  plotNames,
  overallData,
  leftXAxisData,
  customPlots,
  activeTimeSeries,
}: LegendAndLeftXAxisTwoFlightsProps) => {
  const matches = useMedia({ maxWidth: 1440 })

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

  return (
    <ResponsiveContainer
      width="100%"
      height={(activeTimeSeries?.length + 1 + (customPlots?.length || 1)) * 25 + 30}
    >
      <LineChart
        width={matches ? 500 : 475}
        height={30}
        data={leftXAxisData}
        margin={{ bottom: 0 }}
        syncId={`sync-${overallData[0].flightid}`}
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
                    {payload?.map((entry: any, index) => {
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
  )
}
