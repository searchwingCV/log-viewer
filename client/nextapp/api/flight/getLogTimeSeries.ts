import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { LogFileTimeSeries } from "@schema";
import { logFileTimeSeriesTable } from '@idbSchema'

const Series = require('time-series-data-generator')

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
    },
    {
        propName: 'VN',
        group: 'XKF1[0]',
        id: 'vn-xkf10',
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
    },
    {
        propName: 'Curr (A)',
        group: 'BAT',
        id: 'curr-bat',
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10 + 100,
        })),
    },
    {
        propName: 'Temp (°C)',
        group: 'BAT',
        id: 'temp-bat',
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 20,
        })),
    },
    {
        propName: 'I (instance)',
        group: 'BARO',
        id: 'i-baro',
        values: series2.sin().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
    },
    {
        propName: 'Gnd Temp (°C)',
        group: 'BARO',
        id: 'gnd-temp-baro',
        values: series2.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
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

const mockFlightModes = series2
    .gaussian()
    .map((item: { timestamp: string; value: number }) => ({
        timestamp: item.timestamp,
        value: item.value * 10,
    }))
    .map((it: any, index: number) => {
        if (index < 120) {
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
    const timeseries = await mockData.find((item) => item.id === logSeriesParams.key)
    return timeseries
}

export const LOG_FILE_TIMESERIES = 'LOG_FILE_TIMESERIES'

