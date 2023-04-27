// TODO: replace with generated type
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */



export type LogOverallData = {
    flightid: number
    flightModeTimeSeries: { time: string; mode: string }[];
    groupedProperties: {
        //used for drawer
        name: string;
        id: string;
        timeSeriesProperties: { name: string; id: string }[]
    }[]

}