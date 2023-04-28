// TODO: replace with
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */


export type LogFileTimeSeries = {
    group: string;
    id: string;
    propName: string;
    values: {
        timestamp: string;
        value: number;
    }[]
}