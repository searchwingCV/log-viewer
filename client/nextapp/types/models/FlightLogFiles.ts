/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LogFileDownload } from './LogFileDownload';

export type FlightLogFiles = {
    flightId: number;
    count: number;
    data: Array<LogFileDownload>;
};

