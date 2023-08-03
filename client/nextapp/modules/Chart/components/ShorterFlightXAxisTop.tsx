import { LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import useMedia from '@charlietango/use-media'
import { widthYAxis } from 'lib//constants'
import type { DexieCustomPlot, DexieLogFileTimeSeries, DexieLogOverallData } from '@idbSchema'

type ShorterFlightXAxisTopProps = {
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
  topXAxisData: {
    [x: string]: string | number
  }[]
  idShorterFlight: number
}

export const ShorterFlightXAxisTop = ({
  plotNames,
  overallData,
  topXAxisData,

  idShorterFlight,
}: ShorterFlightXAxisTopProps) => {
  const matches = useMedia({ maxWidth: 1440 })

  return (
    <ResponsiveContainer width="100%" height={100} id="xaxis-container">
      <LineChart
        width={matches ? 500 : 475}
        height={30}
        data={topXAxisData}
        margin={{ bottom: 0 }}
        syncId={`sync-${overallData[0].flightid}`}
        key={'xaxis-chart'}
      >
        {plotNames?.map((plot) => (
          <YAxis
            className={`-z-10
                        hidden
                        opacity-0`}
            key={plot?.name}
            width={widthYAxis}
            tick={{ fontSize: 12 }}
            orientation={plot.orientation as 'left' | 'right' | undefined}
            dataKey={plot?.name}
            yAxisId={plot?.name}
            stroke={'transparent'}
          />
        ))}
        <XAxis
          xAxisId={'0'}
          dataKey={`${idShorterFlight}-formattedTime`}
          interval="preserveStartEnd"
          angle={-70}
          className={`!text-[9px]
                      font-thin`}
          offset={150}
          dy={-50}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
