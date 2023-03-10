/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_upload_log__flight_id__post } from '../models/Body_upload_log__flight_id__post';
import type { FlightLogFiles } from '../models/FlightLogFiles';
import type { LogFileUploadResponse } from '../models/LogFileUploadResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LogService {

    /**
     * Upload
     * @param flightId
     * @param formData
     * @returns LogFileUploadResponse Successful Response
     * @throws ApiError
     */
    public static uploadLogFlightIdPost(
        flightId: number,
        formData: Body_upload_log__flight_id__post,
    ): CancelablePromise<LogFileUploadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/log/<flight_id>',
            query: {
                'flight_id': flightId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * List Files
     * @param flightId
     * @returns FlightLogFiles Successful Response
     * @throws ApiError
     */
    public static listFilesLogFlightIdListGet(
        flightId: number,
    ): CancelablePromise<FlightLogFiles> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/log/<flight_id>/list',
            query: {
                'flight_id': flightId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

}
