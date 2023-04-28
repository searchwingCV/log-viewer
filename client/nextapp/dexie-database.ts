import { LogFileTimeSeries } from "@schema";
import Dexie from "dexie";

const database = new Dexie("database");

export interface DexieLogFileTimeSeries extends LogFileTimeSeries {
    flightId: string
    propId: string
}

database.version(1).stores({
    logFileTimeSeries: '++id, propId, propName, group, values, flightId',
});

export const logFileTimeSeriesTable = database.table('logFileTimeSeries');

export default database;





