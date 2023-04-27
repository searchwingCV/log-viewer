import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { LogOverallData } from "@schema";
import { logFileOverallData } from '@idbSchema'

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
                { name: 'VE', id: 've-xkf10' },
                { name: 'VN', id: 'vn-xkf10' },
            ],
        },
        {
            name: 'BAT',
            id: 'bat',
            timeSeriesProperties: [
                { name: 'Curr (A)', id: 'curr-bat' },
                { name: 'Temp (°C)', id: 'temp-bat' },
            ],
        },
        {
            name: 'BARO',
            id: 'baro',
            timeSeriesProperties: [
                { name: 'I (instance)', id: 'i-baro' },
                { name: 'Gnd Temp (°C)', id: 'gnd-temp-baro' },
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
        {
            onSuccess: async (data) => {
                try {
                    await logFileOverallData.add(data)
                } catch (error) {
                    // console.error(`Failed to add ${customer}: ${error}`);
                }

            },

        })
