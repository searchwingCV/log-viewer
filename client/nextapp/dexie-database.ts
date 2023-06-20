/*
    Configuration and database model for IndexedDB, a browser database - only used for saving
    timeseries and custom plots for each flight 
*/
import Dexie from "dexie";
import type { LogFileTimeSeries, LogOverallData, GroupedProps } from "@schema";

const database = new Dexie("database");

export interface DexieLogFileTimeSeries extends LogFileTimeSeries {
    propId: string
    color?: string
    timestamp: Date
    hidden?: boolean
    flightid: number
    calculatorExpression: string
    overallDataId: string
}

export interface DexieCustomPlot {
    id: string
    customFunction: string
    hidden?: boolean
    color?: string
    timestamp: Date
    flightid: number
    values: {
        timestamp: string;
        value: number;
    }[]
    overallDataId: string
}

export type DexieOverallDataTimeSeries = {
    name: string;
    id: string,
    unit: string,
    calculatorExpression: string
    messageField: string,
    messageType: string
}

export type DexieGroupedProps = Omit<GroupedProps, 'timeSeriesProperties'> & {
    timeSeriesProperties: DexieOverallDataTimeSeries[]
}

export type DexieLogOverallData = Omit<LogOverallData, 'groupedProperties'> & {
    groupedProperties: DexieGroupedProps[]
    timestamp: Date
    colorMatrix: DexieTakenColorMatrix[]
    id: string
    isIndividualFlight: boolean
    timestamps: string[]
}

export type DexieTakenColorMatrix = {
    color: string,
    taken: boolean
}


database.version(1).stores({
    logFileTimeSeries: '++id, propId,  messageField, messageType, values, flightid, unit, color, timestamp, calculatorExpression, overallDataId',
    overallDataForFlight: '++id, flightid, flightModeTimeSeries, groupedProperties, timestamp, colorMatrix, isIndividualFlight, from, until, timestamps',
    customFunction: '++id, flightid, customFunction, color, timestamp, hidden, overallDataId',
});

export const LogFileTimeSeriesTable = database.table('logFileTimeSeries');
export const OverallDataForFlightTable = database.table('overallDataForFlight');
export const CustomFunctionTable = database.table('customFunction');

export default database;





