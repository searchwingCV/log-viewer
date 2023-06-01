
/*
   Fetch functions for overall data of a flight (without individual timeseries)
*/
import { useQuery } from "@tanstack/react-query";
import type { LogOverallData } from "@schema";

const Series = require('time-series-data-generator')

const numOfData = 30

export const LOG_OVERALL_DATA_MULTIPLE = 'LOG_OVERALL_DATA_MULTIPLE'

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


const mockData: LogOverallData[] = [{
    flightModeTimeSeries: mockFlightModes,
    flightid: 1,
    groupedProperties: [
        {
            messageType: 'XKF1[0]',
            // id: 'xkf10',
            timeSeriesProperties: [
                {
                    messageField: 'VE',
                    id: 've-xkf10',
                    // unit: "V"
                },
                {
                    messageField: 'VN',
                    id: 'vn-xkf10',
                    // unit: "V"
                },
            ],
        },
        {
            messageType: 'BAT',
            //id: 'bat',
            timeSeriesProperties: [
                {
                    messageField: 'Curr',
                    //id: 'curr-bat',
                    // unit: "A"
                },
                {
                    messageField: 'Temp',
                    id: 'temp-bat',
                    // unit: "Celsius"
                },
            ],
        },
        {
            messageType: 'BARO',
            // id: 'baro',
            timeSeriesProperties: [
                {
                    messageField: 'I',
                    // id: 'i-baro',
                    // unit: "I"
                },
                {
                    messageField: 'GndTemp',
                    // id: 'gndtemp-baro',
                    // unit: "Celsius"
                },
            ],
        },

        {
            messageType: 'MAG[0]',
            timeSeriesProperties: [
                {
                    messageField: 'MagX',
                    // id: 'i-baro',
                    // unit: "I"
                },
                {
                    messageField: 'MagY',
                    // id: 'gndtemp-baro',
                    // unit: "Celsius"
                },
                {
                    messageField: 'MOX',
                    // id: 'gndtemp-baro',
                    // unit: "Celsius"
                },
            ],
        },
    ]
},
{
    flightModeTimeSeries: mockFlightModes,
    flightid: 2,
    groupedProperties: [
        {
            messageType: 'XKF1[0]',
            // id: 'xkf10',
            timeSeriesProperties: [
                {
                    messageField: 'VE',
                    id: 've-xkf10',
                    // unit: "V"
                },
                {
                    messageField: 'VN',
                    id: 'vn-xkf10',
                    // unit: "V"
                },
            ],
        },
        {
            messageType: 'BAT',
            //id: 'bat',
            timeSeriesProperties: [
                {
                    messageField: 'Curr',
                    //id: 'curr-bat',
                    // unit: "A"
                },
                {
                    messageField: 'Temp',
                    id: 'temp-bat',
                    // unit: "Celsius"
                },
            ],
        },
        {
            messageType: 'BARO',
            // id: 'baro',
            timeSeriesProperties: [
                {
                    messageField: 'I',
                    // id: 'i-baro',
                    // unit: "I"
                },
                {
                    messageField: 'GndTemp',
                    // id: 'gndtemp-baro',
                    // unit: "Celsius"
                },
            ],
        },

        {
            messageType: 'MAG[0]',
            timeSeriesProperties: [
                {
                    messageField: 'MagX',
                    // id: 'i-baro',
                    // unit: "I"
                },
                {
                    messageField: 'MagY',
                    // id: 'gndtemp-baro',
                    // unit: "Celsius"
                },
                {
                    messageField: 'MOX',
                    // id: 'gndtemp-baro',
                    // unit: "Celsius"
                },
            ],
        },
    ]
},


]


export const getMultipleLogOverallDataMock = (flightids: number[]): LogOverallData[] => {

    return flightids.map((id) => {
        return mockData.find(item => item.flightid === id) || mockData[0]
    }) || mockData[0]

}


export const useFetchLogPropertyOverallData = (flightids: number[]) =>
    useQuery<LogOverallData[]>([LOG_OVERALL_DATA_MULTIPLE, flightids], () =>
        getMultipleLogOverallDataMock(flightids),
    )
