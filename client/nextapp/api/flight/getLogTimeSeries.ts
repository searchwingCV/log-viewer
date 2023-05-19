
import type { LogFileTimeSeries } from "@schema";
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
        name: 'VE',
        group: 'XKF1[0]',
        id: 've-xkf10',
        flightid: 1,
        values: series1.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
        unit: "V"
    },
    {
        name: 'VN',
        group: 'XKF1[0]',
        id: 'vn-xkf10',
        flightid: 1,
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 20,
        })),
        unit: "V"

    },
    {
        name: 'Curr',
        group: 'BAT',
        id: 'curr-bat',
        flightid: 1,
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10 + 100,
        })),
        unit: "A"

    },
    {
        name: 'Temp',
        group: 'BAT',
        id: 'temp-bat',
        flightid: 1,
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 40,
        })),
        unit: "Celsius"
    },
    {
        name: 'I',
        group: 'BARO',
        id: 'i-baro',
        flightid: 1,
        values: series2.sin().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
        unit: "instance"
    },
    {
        name: 'GndTemp',
        group: 'BARO',
        flightid: 1,
        id: 'gndtemp-baro',
        values: series2.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 20,
        })),
        unit: "Celsius"
    },
]





export const getLogPropertyTimeSeriesMock = async (logSeriesParams: { key: string, flightid: number }) => {
    const timeseries = await mockData.find((item) => logSeriesParams.key === item.id) || mockData[0]
    return timeseries
}


