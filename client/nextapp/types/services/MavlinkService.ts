/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MavLinkFlightMessagePropertiesSerializer } from '../models/MavLinkFlightMessagePropertiesSerializer';
import type { MavLinkTimeseriesSerializer } from '../models/MavLinkTimeseriesSerializer';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MavlinkService {

    /**
     * Get Message Properties
     * @param flightId
     * @returns MavLinkFlightMessagePropertiesSerializer Successful Response
     * @throws ApiError
     */
    public static getMessagePropertiesMavlinkMessagePropertiesGet(
        flightId?: Array<number>,
    ): CancelablePromise<Array<MavLinkFlightMessagePropertiesSerializer>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mavlink/message-properties',
            query: {
                'flight_id': flightId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Timeseries
     * @param flightId
     * @param messageType
     * @param messageField
     * @param startTime
     * @param endTime
     * @param nPoints
     * @returns MavLinkTimeseriesSerializer Successful Response
     * @throws ApiError
     */
    public static getTimeseriesMavlinkTimeseriesGet(
        flightId: number,
        messageType: string,
        messageField: string,
        startTime?: string,
        endTime?: string,
        nPoints?: number,
    ): CancelablePromise<MavLinkTimeseriesSerializer> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mavlink/timeseries',
            query: {
                'flight_id': flightId,
                'message_type': messageType,
                'message_field': messageField,
                'start_time': startTime,
                'end_time': endTime,
                'n_points': nPoints,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

}
