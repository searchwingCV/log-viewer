// TODO: replace with generated type
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */


export type LogFileTimeSeries = {
    messageType: string;
    id?: string;
    flightid: number
    messageField: string;
    unit?: string;
    values: {
        timestamp: string;
        value: number;
    }[]
}