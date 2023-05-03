import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { LogOverallData } from "@schema";

const Series = require('time-series-data-generator')

const numOfData = 30

export const LOG_OVERALL_DATA = 'LOG_OVERALL_DATA'

const series2 = new Series({
    from: '2016-01-01T00:24:33Z',
    until: '2016-01-01T01:10:00Z',
    numOfData,
    interval: 1,
})


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


const mockData = {
    flightModeTimeSeries: mockFlightModes,
    groupedProperties: [
        {
            name: 'XKF1[0]',
            id: 'xkf10',
            timeSeriesProperties: [
                { propName: 'VE', id: 've-xkf10', unit: "V" },
                { propName: 'VN', id: 'vn-xkf10', unit: "V" },
            ],
        },
        {
            name: 'BAT',
            id: 'bat',
            timeSeriesProperties: [
                { propName: 'Curr', id: 'curr-bat', unit: "A" },
                { propName: 'Temp', id: 'temp-bat', unit: "Celsius" },
            ],
        },
        {
            name: 'BARO',
            id: 'baro',
            timeSeriesProperties: [
                { propName: 'I', id: 'i-baro', unit: "I" },
                { propName: 'GndTemp', id: 'gnd-temp-baro', unit: "Celsius" },
            ],
        },
    ]
}


export const getLogOverallDataMock = (flightid: number) => {
    return { flightid, ...mockData }
}



export const fetchLogPropertyOverallData = (flightid: number) =>
    useQuery<LogOverallData>([LOG_OVERALL_DATA, flightid], () =>
        getLogOverallDataMock(flightid),
    )
