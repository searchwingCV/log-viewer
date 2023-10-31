/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TimeseriesValues } from './TimeseriesValues';

export type MavLinkTimeseriesSerializer = {
    flightId: number;
    messageType: string;
    messageField: string;
    values: Array<TimeseriesValues>;
};

