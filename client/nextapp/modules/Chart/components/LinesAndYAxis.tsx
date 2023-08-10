/*
    Right now this component it is not used. But it is code we wish we could use. 
    Recharts does not render this for some reason. 
    TODO: Figure out how to modularize these recharts components properly.
*/

import { Line, YAxis, Label } from 'recharts'

type LinesAndYAxisProps = {
  plotNames: {
    name: string
    label: string
    color: string | undefined
  }[]
  orientation: 'left' | 'right'
}

export const LinesAndYAxis = ({ plotNames, orientation }: LinesAndYAxisProps) => {
  return (
    <>
      {plotNames?.map((plot, i) => (
        <YAxis
          key={plot?.name}
          width={40}
          tick={{ fontSize: 12 }}
          dataKey={plot?.name}
          yAxisId={i}
          orientation={orientation}
          stroke={plot?.color}
          label={
            <Label
              stroke={plot?.color}
              className={`text-[9px]
                          font-thin`}
              position="bottom"
              value={plot?.label}
              angle={-90}
              offset={90}
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
    </>
  )
}
