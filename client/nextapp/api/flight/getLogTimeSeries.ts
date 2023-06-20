
import type { LogFileTimeSeries } from "@schema";
const Series = require('time-series-data-generator')

export const LOG_FILE_TIMESERIES = 'LOG_FILE_TIMESERIES'


const numOfData = 30
const series1 = new Series({
    from: '2016-01-01T00:24:33Z',
    until: '2016-01-02T01:10:00Z',

    numOfData,
    interval: 1,
})

// const series2 = new Series({
//     from: '2016-01-01T00:24:33Z',
//     until: '2016-01-01T01:10:00Z',
//     numOfData,
//     interval: 1,
// })


const series2 = new Series({
    from: '2017-01-01T00:00:33Z',
    until: '2017-01-02T00:10:00Z',
    numOfData: 30,
    interval: 1,
})


const mockData: LogFileTimeSeries[] = [
    {
        messageField: 'VE',
        messageType: 'XKF1[0]',
        //id: 've-xkf10',   
        flightid: 1,
        values: series1.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
        //unit: "V"
    },
    {
        messageField: 'VN',
        messageType: 'XKF1[0]',
        //id: 'vn-xkf10',
        flightid: 1,
        values: series1.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 20,
        })),
        //unit: "V"

    },
    {
        messageField: 'Curr',
        messageType: 'BAT',
        //id: 'curr-bat',
        flightid: 1,
        values: series1.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10 + 100,
        })),
        //unit: "A"

    },
    {
        messageField: 'Temp',
        messageType: 'BAT',
        //id: 'temp-bat',
        flightid: 1,
        values: series1.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 40,
        })),
        //unit: "Celsius"
    },
    {
        messageField: 'I',
        messageType: 'BARO',
        //id: 'i-baro',
        flightid: 1,
        values: series1.sin().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
        //unit: "instance"
    },
    {
        messageField: 'GndTemp',
        messageType: 'BARO',
        flightid: 1,
        //id: 'gndtemp-baro',
        values: series1.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 25 + 100,
        })),
        //unit: "Celsius"
    },
    {
        messageField: 'MagX',
        messageType: 'MAG[0]',
        flightid: 1,
        //id: 'gndtemp-baro',
        values: series1.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 100 + 20,
        })),
        //unit: "Celsius"
    },

    {
        messageField: 'MagY',
        messageType: 'MAG[0]',
        flightid: 1,
        //id: 'gndtemp-baro',
        values: series1.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 20 + 134,
        })),
        //unit: "Celsius"
    },
    {
        messageField: 'MOX',
        messageType: 'MAG[0]',
        flightid: 1,
        //id: 'gndtemp-baro',
        values: series1.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 3,
        })),
        //unit: "Celsius"
    },
    {
        messageField: 'VE',
        messageType: 'XKF1[0]',
        //id: 've-xkf10',
        flightid: 2,
        values: series2.sin().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 10,
        })),
        //unit: "V"
    },
    {
        messageField: 'VN',
        messageType: 'XKF1[0]',
        //id: 'vn-xkf10',
        flightid: 2,
        values: series2.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 20,
        })),
        //unit: "V"

    },
    {
        messageField: 'Curr',
        messageType: 'BAT',
        //id: 'curr-bat',
        flightid: 2,
        values: series2.sin().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 100 + 10,
        })),
        //unit: "A"

    },
    {
        messageField: 'Temp',
        messageType: 'BAT',
        //id: 'temp-bat',
        flightid: 2,
        values: series2.sin().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 40,
        })),
        //unit: "Celsius"
    },
    {
        messageField: 'I',
        messageType: 'BARO',
        //id: 'i-baro',
        flightid: 2,
        values: series2.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 100,
        })),
        //unit: "instance"
    },
    {
        messageField: 'GndTemp',
        messageType: 'BARO',
        flightid: 2,
        //id: 'gndtemp-baro',
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 25 + 150,
        })),
        //unit: "Celsius"
    },
    {
        messageField: 'MagX',
        messageType: 'MAG[0]',
        flightid: 2,
        //id: 'gndtemp-baro',
        values: series2.sin().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value / 150 + 2,
        })),
        //unit: "Celsius"
    },

    {
        messageField: 'MagY',
        messageType: 'MAG[0]',
        flightid: 2,
        //id: 'gndtemp-baro',
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 80 + 13,
        })),
        //unit: "Celsius"
    },
    {
        messageField: 'MOX',
        messageType: 'MAG[0]',
        flightid: 2,
        //id: 'gndtemp-baro',
        values: series2.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value / 3 + 13,
        })),
        //unit: "Celsius"
    },
]





export const getLogPropertyTimeSeriesMock = async (logSeriesParams: { messageType: string, messageField: string, flightid: number }) => {
    const timeseries = await mockData.find((item) => logSeriesParams.messageField === item.messageField && logSeriesParams.messageType === item.messageType && logSeriesParams.flightid === item.flightid) || mockData[0]
    return timeseries
}


