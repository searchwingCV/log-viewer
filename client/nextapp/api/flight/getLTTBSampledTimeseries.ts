import axios from 'axios'
import { useQuery } from "@tanstack/react-query";

import {
    differenceInMilliseconds,
} from 'date-fns'
import { inflate } from 'pako'
import type { LogFileTimeSeries } from '@schema'

export const LTTB_TIMESERIES_DATA = "LTTB_TIMESERIES_DATA"

export const getLTTBSampledTimeseries = async ({ n_datapoints, flightid, messageField, messageType, startDate, endDate, }:
    { n_datapoints: number, flightid: number, messageField: string, messageType: string, startDate?: string, endDate?: string, }) => {
    const { data } = await axios.get('/timeseriesMock20Hz.json.gz', {
        responseType: 'arraybuffer', // important
        decompress: true,
    })


    const dataObject = JSON.parse(inflate(data, { to: 'string' }))

    const seriesWithinStartAndEndDate = dataObject?.find((data: LogFileTimeSeries) => data.messageField === messageField &&
        data.messageType === messageType &&
        data.flightid === flightid)?.values.filter(
            (valSet: { timestamp: string, value: number }) =>
                startDate && endDate ? new Date(valSet.timestamp) >= new Date(startDate) && new Date(valSet.timestamp) <= new Date(endDate) : true
        )

    const fromUntilDates = [
        {
            flightid: 1,
            totalIndices: differenceInMilliseconds(endDate ? new Date(endDate) : new Date("2016-01-01T01:10:00Z"), startDate ? new Date(startDate) : new Date('2016-01-01T00:24:33Z')) - 1
        },
        {
            flightid: 2,
            totalIndices: differenceInMilliseconds(endDate ? new Date(endDate) : new Date("2017-01-01T02:10:00Z"), startDate ? new Date(startDate) : new Date('2017-01-01T00:00:33Z')) - 1
        },
    ]

    const matchingDates = Math.floor(fromUntilDates.find(date => date.flightid === flightid)?.totalIndices || 0) / 50

    const interval = (matchingDates || 0) / n_datapoints
    const steps = Array(n_datapoints).fill(0).map((step, i) => {
        const random = Math.floor(Math.random() * interval)
        return Math.floor(i * interval + random)
    }
    )
    const values = steps.map((step) => {
        return seriesWithinStartAndEndDate[step]
    }).filter(val => val !== undefined)
    return {
        messageField,
        messageType,
        flightid,
        values: values
    }
}

export const getBulkLTTBSampledTimeseries = async ({ timeseriesIdentifiers, shouldHaveFixedSteps }:
    { timeseriesIdentifiers: { n_datapoints: number, flightid: number, messageField: string, messageType: string, startDate?: string, endDate?: string }[], shouldHaveFixedSteps?: boolean }) => {

    const { data } = await axios.get('/timeseriesMock20Hz.json.gz', {
        responseType: 'arraybuffer', // important
        decompress: true,
    })

    const dataObject = JSON.parse(inflate(data, { to: 'string' }))


    return timeseriesIdentifiers.map((timeseries) => {


        let start = dataObject.find((data: LogFileTimeSeries) => data.messageField === timeseries.messageField &&
            data.messageType === timeseries.messageType &&
            data.flightid === timeseries.flightid)?.values?.filter(
                (valSet: { timestamp: string, value: number }) =>
                    timeseries.startDate && new Date(valSet.timestamp) >= new Date(timeseries.startDate)
            )?.[0]


        let end = dataObject.find((data: LogFileTimeSeries) => data.messageField === timeseries.messageField &&
            data.messageType === timeseries.messageType &&
            data.flightid === timeseries.flightid).values.filter(
                (valSet: { timestamp: string, value: number }) =>
                    timeseries.endDate && new Date(valSet.timestamp) >= new Date(timeseries.endDate)
            )?.pop()




        const seriesWithinStartAndEndDate = dataObject.find((data: LogFileTimeSeries) => data.messageField === timeseries.messageField &&
            data.messageType === timeseries.messageType &&
            data.flightid === timeseries.flightid).values.filter(
                (valSet: { timestamp: string, value: number }) =>
                    timeseries.startDate && timeseries.endDate ? new Date(valSet.timestamp) >= new Date(timeseries.startDate) && new Date(valSet.timestamp) <= new Date(timeseries.endDate) : true
            )

        const fromUntilDates = [
            {
                flightid: 1,
                totalIndices: differenceInMilliseconds(timeseries.endDate ? new Date(timeseries.endDate) : new Date("2016-01-01T01:10:00Z"), timeseries.startDate ? new Date(timeseries.startDate) : new Date('2016-01-01T00:24:33Z')) - 1
            },
            {
                flightid: 2,
                totalIndices: differenceInMilliseconds(timeseries.endDate ? new Date(timeseries.endDate) : new Date("2017-01-01T02:10:00Z"), timeseries.startDate ? new Date(timeseries.startDate) : new Date('2017-01-01T00:00:33Z')) - 1
            },
        ]
        const matchingDates = Math.floor(fromUntilDates.find(date => date.flightid === timeseries.flightid)?.totalIndices || 0) / 50

        const interval = (matchingDates || 0) / timeseries.n_datapoints
        const steps = Array(timeseries.n_datapoints).fill(0).map((step, i) => {
            if (shouldHaveFixedSteps) {
                return i
            } else {
                const random = Math.floor(Math.random() * interval)
                return Math.floor(i * interval + random)
            }
        }
        )
        const values = steps.map((step) => {
            return seriesWithinStartAndEndDate[step]
        }).filter(val => val !== undefined)


        if (start) {
            start = { ...start, ...{ timestamp: timeseries.startDate } }

            values.shift()
            values.unshift(start)
        }
        if (end) {

            end = { ...end, ...{ timestamp: timeseries.endDate } }
            values.pop()
            values.push(end)

        }

        return {
            messageField: timeseries.messageField,
            messageType: timeseries.messageType,
            flightid: timeseries.flightid,
            values: values
        }
    })

}

export const useFetchTimeseries = ({ chartSize, timeseriesIdentifiers, enable, shouldHaveFixedSteps }:
    { chartSize: number, timeseriesIdentifiers: { n_datapoints: number, flightid: number, messageField: string, messageType: string, startDate?: string, endDate?: string }[], enable: boolean, shouldHaveFixedSteps?: boolean }) =>
    useQuery<LogFileTimeSeries[]>([
        LTTB_TIMESERIES_DATA,
        chartSize,
        ...timeseriesIdentifiers.map(identifier => identifier.flightid).sort(),
        ...timeseriesIdentifiers.map(identifier => `${identifier.messageField}-${identifier.messageType}`).sort(),
        ...timeseriesIdentifiers.map(identifier => identifier.n_datapoints),
        ...timeseriesIdentifiers.map(identifier => identifier.startDate),
        ...timeseriesIdentifiers.map(identifier => identifier.endDate),

    ], () => {
        return getBulkLTTBSampledTimeseries({ timeseriesIdentifiers, shouldHaveFixedSteps })
    },
        {
            enabled: enable,
            onError: (e) => console.error(e),
            keepPreviousData: true,
            staleTime: 10 * (60 * 1000), // 10 mins
            refetchOnWindowFocus: true
        }
    )
