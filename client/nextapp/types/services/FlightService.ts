/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseFlightSchema } from '../models/BaseFlightSchema';
import type { FlightDeletion } from '../models/FlightDeletion';
import type { FlightSchema } from '../models/FlightSchema';
import type { Page_FlightSchema_ } from '../models/Page_FlightSchema_';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FlightService {

    /**
     * Retrieve Flight
     * @param flightId
     * @param page
     * @param size
     * @param path
     * @returns Page_FlightSchema_ Successful Response
     * @throws ApiError
     */
    public static retrieveFlightFlightGet(
        flightId?: number,
        page: number = 1,
        size: number = 50,
        path: string = '/base',
    ): CancelablePromise<Page_FlightSchema_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/flight',
            query: {
                'flight_id': flightId,
                'page': page,
                'size': size,
                'path': path,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Flight
     * @param requestBody
     * @returns FlightSchema Successful Response
     * @throws ApiError
     */
    public static addFlightFlightPost(
        requestBody: BaseFlightSchema,
    ): CancelablePromise<FlightSchema> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/flight',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Mission
     * @param flightId
     * @returns FlightDeletion Successful Response
     * @throws ApiError
     */
    public static deleteMissionFlightFlightIdDelete(
        flightId?: string,
    ): CancelablePromise<FlightDeletion> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/flight/<flight_id>',
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
     * Update Flight
     * @param flightId
     * @param requestBody
     * @returns FlightSchema Successful Response
     * @throws ApiError
     */
    public static updateFlightFlightFlightIdPatch(
        flightId: number,
        requestBody: BaseFlightSchema,
    ): CancelablePromise<FlightSchema> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/flight/<flight_id>',
            query: {
                'flight_id': flightId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

}
