
import { LogFileTimeSeries } from "@schema";
const Series = require('time-series-data-generator')

export const LOG_FILE_TIMESERIES = 'LOG_FILE_TIMESERIES'


const numOfData = 30
const series1 = new Series({
    from: '2016-01-01T00:24:33Z',
    until: '2016-01-01T01:10:00Z',

    numOfData,
    interval: 1,
})

const series2 = new Series({
    from: '2016-01-01T00:24:33Z',
    until: '2016-01-01T01:10:00Z',
    numOfData,
    interval: 1,
})

const mockData: LogFileTimeSeries[] = [
    {
        propName: 'VE',
        group: 'XKF1[0]',
        id: 've-xkf10',
        values: series1.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
        unit: "V"
    },
    {
        propName: 'VN',
        group: 'XKF1[0]',
        id: 'vn-xkf10',
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
        unit: "V"

    },
    {
        propName: 'Curr',
        group: 'BAT',
        id: 'curr-bat',
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10 + 100,
        })),
        unit: "A"

    },
    {
        propName: 'Temp',
        group: 'BAT',
        id: 'temp-bat',
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 20,
        })),
        unit: "Celsius"
    },
    {
        propName: 'I',
        group: 'BARO',
        id: 'i-baro',
        values: series2.sin().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
        unit: "instance"
    },
    {
        propName: 'GndTemp',
        group: 'BARO',
        id: 'gnd-temp-baro',
        values: series2.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
        unit: "Celsius"
    },
]

series2
    .gaussian()
    .map((item: { timestamp: string; value: number }) => ({
        timestamp: item.timestamp,
        value: item.value * 10,
    }))
    .map((it: any, index: number) => {
        if (index < 12) {
            return { time: it.timestamp, mode: 'FBWA' }
        } else if (index < 200) {
            return { time: it.timestamp, mode: 'MANUAL' }
        } else if (index < 450) {
            return { time: it.timestamp, mode: 'AUTO' }
        } else if (index < 80) {
            return { time: it.timestamp, mode: 'AUTOTUNE' }
        } else if (index < 1100) {
            return { time: it.timestamp, mode: 'MANUAL' }
        } else if (index < 1500) {
            return { time: it.timestamp, mode: 'FBWA' }
        } else if (index < 2100) {
            return { time: it.timestamp, mode: 'AUTO' }
        } else if (index < 2600) {
            return { time: it.timestamp, mode: 'MANUAL' }
        } else {
            return { time: it.timestamp, mode: '' }
        }
    })




export const getLogPropertyTimeSeriesMock = async (logSeriesParams: { key: string, group: string, flightid: number }) => {
    const timeseries = await mockData.find((item) => item.id === logSeriesParams.key) || mockData[0]
    return timeseries
}


