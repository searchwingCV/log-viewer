// TODO: replace with generated type
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */



export type GroupedProps = {
    //used for drawer
    name: string; //name of the group
    timeSeriesProperties: { name: string; id: string, unit: string }[]
}

export type LogOverallData = {
    flightid: number
    flightModeTimeSeries: { time: string; mode: string }[];
    groupedProperties: GroupedProps[]
}