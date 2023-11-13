/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FlightModeRangeSerializer } from './FlightModeRangeSerializer';
import type { MavLinkMessagePropertiesSerializer } from './MavLinkMessagePropertiesSerializer';

export type MavLinkFlightMessagePropertiesSerializer = {
    flightId: number;
    startTimestamp?: string;
    endTimestamp?: string;
    messageProperties: Array<MavLinkMessagePropertiesSerializer>;
    flightModeTimeseries?: Array<FlightModeRangeSerializer>;
};

