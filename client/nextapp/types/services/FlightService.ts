/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AllowedFiles } from '../models/AllowedFiles';
import type { BatchUpdateResponse_FlightSerializer_ } from '../models/BatchUpdateResponse_FlightSerializer_';
import type { Body_upload_file_flight__id__file_put } from '../models/Body_upload_file_flight__id__file_put';
import type { CreateFlightSerializer } from '../models/CreateFlightSerializer';
import type { FlightFileSerializer } from '../models/FlightFileSerializer';
import type { FlightFilesListResponse } from '../models/FlightFilesListResponse';
import type { FlightSerializer } from '../models/FlightSerializer';
import type { Page_FlightWithFilesResponse_ } from '../models/Page_FlightWithFilesResponse_';
import type { UpdateSerializer_FlightUpdate_ } from '../models/UpdateSerializer_FlightUpdate_';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FlightService {

    /**
     * Retrieve All Flights
     * @param page
     * @param size
     * @returns Page_FlightWithFilesResponse_ Successful Response
     * @throws ApiError
     */
    public static retrieveAllFlightsFlightGet(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<Page_FlightWithFilesResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/flight',
            query: {
                'page': page,
                'size': size,
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
     * @returns FlightSerializer Successful Response
     * @throws ApiError
     */
    public static addFlightFlightPost(
        requestBody: CreateFlightSerializer,
    ): CancelablePromise<FlightSerializer> {
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
     * Update Flight
     * Update flights in batch
     * @param requestBody
     * @returns BatchUpdateResponse_FlightSerializer_ Successful Response
     * @throws ApiError
     */
    public static updateFlightFlightPatch(
        requestBody: UpdateSerializer_FlightUpdate_,
    ): CancelablePromise<BatchUpdateResponse_FlightSerializer_> {
        return __request(OpenAPI, {
            method: 'PATCH',
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
     * Retrieve Flight
     * @param id
     * @returns FlightSerializer Successful Response
     * @throws ApiError
     */
    public static retrieveFlightFlightIdGet(
        id: number,
    ): CancelablePromise<FlightSerializer> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/flight/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Flight
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteFlightFlightIdDelete(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/flight/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * List Files
     * @param id
     * @returns FlightFilesListResponse Successful Response
     * @throws ApiError
     */
    public static listFilesFlightIdFileGet(
        id: number,
    ): CancelablePromise<FlightFilesListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/flight/{id}/file',
            path: {
                'id': id,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Upload File
     * @param id
     * @param fileType
     * @param formData
     * @param process
     * @returns FlightFileSerializer Successful Response
     * @throws ApiError
     */
    public static uploadFileFlightIdFilePut(
        id: number,
        fileType: AllowedFiles,
        formData: Body_upload_file_flight__id__file_put,
        process: boolean = true,
    ): CancelablePromise<FlightFileSerializer> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/flight/{id}/file',
            path: {
                'id': id,
            },
            query: {
                'file_type': fileType,
                'process': process,
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
     * Delete File
     * @param fileId
     * @returns void
     * @throws ApiError
     */
    public static deleteFileFlightFileFileIdDelete(
        fileId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/flight/file/{file_id}',
            path: {
                'file_id': fileId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

}
