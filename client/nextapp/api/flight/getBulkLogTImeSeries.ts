
/*
   Fetch funtions for getting multiple timeseries properties for one specific flight
*/

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
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
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
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
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
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
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
        values: series2.sin().map((item: { timestamp: string; value: number }) => ({
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
        values: series2.cos().map((item: { timestamp: string; value: number }) => ({
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
        values: series2.cos().map((item: { timestamp: string; value: number }) => ({
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
        values: series2.cos().map((item: { timestamp: string; value: number }) => ({
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
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
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
        values: series1.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 100,
        })),
        //unit: "V"
    },
    {
        messageField: 'VN',
        messageType: 'XKF1[0]',
        //id: 'vn-xkf10',
        flightid: 2,
        values: series2.sin().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 200,
        })),
        //unit: "V"

    },
    {
        messageField: 'Curr',
        messageType: 'BAT',
        //id: 'curr-bat',
        flightid: 2,
        values: series2.cos().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 100 + 100,
        })),
        //unit: "A"

    },
    {
        messageField: 'Temp',
        messageType: 'BAT',
        //id: 'temp-bat',
        flightid: 2,
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value * 400,
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
            value: item.value / 150 + 20,
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
            value: item.value * 80 + 134,
        })),
        //unit: "Celsius"
    },
    {
        messageField: 'MOX',
        messageType: 'MAG[0]',
        flightid: 2,
        //id: 'gndtemp-baro',
        values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
            timestamp: item.timestamp,
            value: item.value / 3 + 134,
        })),
        //unit: "Celsius"
    },
]



export const getBulkLogPropertyTimeSeriesMock = async (logSeriesParams: { messageTypeFieldPair: { messageType: string, messageField: string }[], flightid: number }) => {

    const timeseries = await logSeriesParams.messageTypeFieldPair.map((pair) =>
        mockData.find(mock => mock.messageType === pair.messageType && mock.messageField === pair.messageField)
    )

    return timeseries

}


