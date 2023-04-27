/* 
  The following Component is currently not used
 */
import { ReactNode, useMemo } from 'react'
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
import { differenceInSeconds, intervalToDuration } from 'date-fns'

export type Props = { children: ReactNode }

const calculateSignatureNumbers = ({ name, values }: { name: string; values: number[] }) => {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const mean = values.reduce((a, b) => a + b) / values.length

  return { name, max, min, mean }
}

const getOverAllMaxMin = (data: LineChartData[]) => {
  const vals2Dimensional = data.map((property) => [...property.values.map((item) => item.value)])
  const valsCombined = vals2Dimensional.reduce((a, b) => [...a, ...b])
  const max = Math.ceil(Math.max(...valsCombined))
  const min = Math.floor(Math.min(...valsCombined))

  return { max, min }
}

export type FlightModeTime = { time: string; mode: string }

export type LineChartData = {
  propName: string
  group: string
  id: string
  values: { timestamp: string; value: number }[]
}

export type LineChartComponentProps = {
  data: LineChartData[]
  flightModeData: FlightModeTime[]
  flightId: number
}

const getTimeInDuration = (uniqueTimestamps: string[]) => {
  const dateArr = uniqueTimestamps
    .map((item) => ({ date: new Date(item), timestamp: item }))
    .sort((dateA, dateB) => Number(dateA.date) - Number(dateB.date))

  const first = dateArr[0].date
  const formattedTimes = dateArr.map((date) => {
    const seconds = differenceInSeconds(first, date.date) * -1
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 })

    const formatted = `${(duration?.hours || 0) * 60 + (duration?.minutes || 0)}:${
      duration.seconds
    }`
    return { formatted, timestamp: date.timestamp }
  })
  return formattedTimes
}

const prepareDataForLineChart = (data: LineChartData[]) => {
  const vals2Dimensional = data.map((property) => [
    ...property.values.map((item) => ({
      timestamp: item.timestamp,
      value: item.value,
      label: `${property.group}.${property.propName}`,
      propName: property.propName,
    })),
  ])

  const valsCombined = vals2Dimensional.reduce((a, b) => [...a, ...b])

  const uniqueTimestamps = valsCombined
    .map((val) => val.timestamp)
    .filter((x, i, a) => a.indexOf(x) === i)
  const formattedTimes = getTimeInDuration(uniqueTimestamps)

  const finalValues = uniqueTimestamps.map((timestamp) => {
    const valsMatchingTimestamp = valsCombined.filter((valObj) => valObj.timestamp === timestamp)

    const propertyNameAsKeyObj = valsMatchingTimestamp
      .map((item) => ({
        [item.propName]: item.value,
      }))
      .reduce((a, b) => ({
        ...a,
        ...b,
      }))

    return {
      name: formattedTimes.find((time) => time.timestamp === timestamp)?.formatted,
      timestring: timestamp,
      ...propertyNameAsKeyObj,
    }
  })

  return finalValues
}

const splitifDiffHigherThanOne = (arr: number[]) => {
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

const prepareFlightModeAreas = (
  flightModeData: FlightModeTime[],
  timeData: { timestring: string; formatted: string }[],
) => {
  const assignedToFlightMode = flightModes.map((mode) => {
    return {
      mode,
      values: flightModeData
        .map((element, index) => (element.mode === mode.name ? index : -1))
        .filter((element) => element !== -1),
    }
  })

  const startEndArr = assignedToFlightMode
    .map((arr) => {
      const startEndArray = splitifDiffHigherThanOne(arr.values).map((item) => ({
        mode: arr.mode,
        start: item[0],
        end: item.slice(-1)[0],
      }))

      return startEndArray
    })
    .reduce((a, b) => [...a, ...b])

  return startEndArr.map((item) => ({
    mode: item.mode,
    start: timeData[item.start]?.formatted,
    end: timeData[item.end]?.formatted,
  }))
}

const colorArr = [
  '#48C9B0',
  '#B47BE3',
  '#EC7063',
  '#FF33E3',
  '#44D8CD',
  '#D8BB44',
  '#9B44D8',
  '#9B44D8',
  '#FF5733',
  '#117A65',
  '#A04000',
]

const flightModes = [
  { name: 'FBWA', color: '#B5AEE0' },
  { name: 'AUTOTUNE', color: '#F2D4AC' },
  { name: 'MANUAL', color: '#CDE5CD' },
  { name: 'AUTO', color: '#FFDFD3' },
  { name: '', color: '#F7C4D4' },
]

export const LineChartComponent = ({ data, flightModeData, flightId }: LineChartComponentProps) => {
  const preparedData = useMemo(() => prepareDataForLineChart(data), [data])
  const signatureNumbers = useMemo(
    () =>
      data.map((propTypes) =>
        calculateSignatureNumbers({
          name: propTypes.propName,
          values: propTypes.values.map((valPair) => valPair.value),
        }),
      ),
    [data],
  )

  const flightModeAreas = useMemo(
    () =>
      prepareFlightModeAreas(
        flightModeData,
        preparedData.map((item) => ({
          timestring: item.timestring,
          formatted: item.name,
        })) as { timestring: string; formatted: string }[],
      ),
    [flightModeData],
  )

  const plotNames = data.map((plotTypes) => plotTypes.propName)
  return (
    <>
      <ResponsiveContainer width="100%" height={700}>
        <LineChart
          width={500}
          height={500}
          data={preparedData}
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
                <ul className="relative ml-[60px] mb-12 border border-grey-medium bg-primary-white p-2 text-xs">
                  {payload?.map((entry, index) => (
                    <li
                      key={`item-${index}`}
                      style={{ color: colorArr[index] }}
                      className={'grid grid-cols-[50px_250px_250px_250px] text-xs'}
                    >
                      <span className="font-bold">{entry.value}</span>
                      <span>
                        <span className="pr-2">MAX:</span>
                        {signatureNumbers.find((numberSet) => numberSet.name === entry.value)?.max}
                      </span>
                      <span>
                        <span className="pr-2"> MIN:</span>
                        {signatureNumbers.find((numberSet) => numberSet.name === entry.value)?.min}
                      </span>
                      <span>
                        <span className="pr-2"> MEAN:</span>
                        {signatureNumbers.find((numberSet) => numberSet.name === entry.value)?.mean}
                      </span>
                    </li>
                  ))}

                  <div className="absolute top-2 right-8 text-grey-dark">{`FLIGHT ${flightId}`}</div>
                </ul>
              )
            }}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />

          {plotNames.map((name, i) => (
            <YAxis
              dataKey={name}
              yAxisId={i}
              stroke={colorArr[i]}
              label={
                <Label
                  stroke={colorArr[i]}
                  className={'text-xs'}
                  position="bottom"
                  value={name}
                ></Label>
              }
            />
          ))}

          <Tooltip />
          {plotNames.map((name, i) => (
            <Line
              type="monotone"
              dataKey={name}
              stroke={colorArr[i]}
              fill={colorArr[i]}
              dot={false}
              yAxisId={i}
            />
          ))}
          <Brush data={preparedData} dataKey={'prop'} height={100}>
            <LineChart data={preparedData} className={'mt-8'}>
              {plotNames.map((name, i) => (
                <Line
                  type="monotone"
                  dataKey={name}
                  stroke={colorArr[i]}
                  fill={colorArr[i]}
                  dot={false}
                  yAxisId={i}
                />
              ))}
            </LineChart>
          </Brush>

          {flightModeAreas.map((areaData) => (
            <ReferenceArea
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
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
