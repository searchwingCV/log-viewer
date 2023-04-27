import Dexie from "dexie";

const database = new Dexie("database");

database.version(1).stores({
    logFileTimeSeries: '++id, propName, group, values',
    logFileOverallData: '++id, flightModeTimeSeries, groupedProperties'
});

export const logFileTimeSeriesTable = database.table('logFileTimeSeries');
export const logFileOverallData = database.table('logFileOverallData');

export default database;
