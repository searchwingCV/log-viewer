/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileListResponse } from './FileListResponse';

export type FlightFilesListResponse = {
    flightId: number;
    log: FileListResponse;
    tlog: FileListResponse;
    rosbag: FileListResponse;
    apm: FileListResponse;
};

