/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BatchUpdateResponse_FlightSerializer_ } from '../models/BatchUpdateResponse_FlightSerializer_';
import type { Body_upload_apm_param_file_flight__flight_id__apm_file_put } from '../models/Body_upload_apm_param_file_flight__flight_id__apm_file_put';
import type { Body_upload_log_file_flight__flight_id__log_file_put } from '../models/Body_upload_log_file_flight__flight_id__log_file_put';
import type { Body_upload_rosbag_file_flight__flight_id__rosbag_file_put } from '../models/Body_upload_rosbag_file_flight__flight_id__rosbag_file_put';
import type { Body_upload_tlog_file_flight__flight_id__tlog_file_put } from '../models/Body_upload_tlog_file_flight__flight_id__tlog_file_put';
import type { CreateFlightSerializer } from '../models/CreateFlightSerializer';
import type { FileUploadResponse } from '../models/FileUploadResponse';
import type { FlightFilesListResponse } from '../models/FlightFilesListResponse';
import type { FlightSerializer } from '../models/FlightSerializer';
import type { Page_FlightSerializer_ } from '../models/Page_FlightSerializer_';
import type { UpdateSerializer_FlightUpdate_ } from '../models/UpdateSerializer_FlightUpdate_';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FlightService {

    /**
     * Retrieve All Flights
     * @param page
     * @param size
     * @returns Page_FlightSerializer_ Successful Response
     * @throws ApiError
     */
    public static retrieveAllFlightsFlightGet(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<Page_FlightSerializer_> {
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
     * Upload Log File
     * @param flightId
     * @param formData
     * @returns FileUploadResponse Successful Response
     * @throws ApiError
     */
    public static uploadLogFileFlightFlightIdLogFilePut(
        flightId: number,
        formData: Body_upload_log_file_flight__flight_id__log_file_put,
    ): CancelablePromise<FileUploadResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/flight/{flight_id}/log-file',
            path: {
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
     * Delete Log File
     * @param fileId
     * @returns void
     * @throws ApiError
     */
    public static deleteLogFileFlightFlightIdLogFileDelete(
        fileId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/flight/{flight_id}/log-file',
            query: {
                'file_id': fileId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Upload Tlog File
     * @param flightId
     * @param formData
     * @returns FileUploadResponse Successful Response
     * @throws ApiError
     */
    public static uploadTlogFileFlightFlightIdTlogFilePut(
        flightId: number,
        formData: Body_upload_tlog_file_flight__flight_id__tlog_file_put,
    ): CancelablePromise<FileUploadResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/flight/{flight_id}/tlog-file',
            path: {
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
     * Delete Tlog File
     * @param fileId
     * @returns void
     * @throws ApiError
     */
    public static deleteTlogFileFlightFlightIdTlogFileDelete(
        fileId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/flight/{flight_id}/tlog-file',
            query: {
                'file_id': fileId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Upload Rosbag File
     * @param flightId
     * @param formData
     * @returns FileUploadResponse Successful Response
     * @throws ApiError
     */
    public static uploadRosbagFileFlightFlightIdRosbagFilePut(
        flightId: number,
        formData: Body_upload_rosbag_file_flight__flight_id__rosbag_file_put,
    ): CancelablePromise<FileUploadResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/flight/{flight_id}/rosbag-file',
            path: {
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
     * Upload Apm Param File
     * @param flightId
     * @param formData
     * @returns FileUploadResponse Successful Response
     * @throws ApiError
     */
    public static uploadApmParamFileFlightFlightIdApmFilePut(
        flightId: number,
        formData: Body_upload_apm_param_file_flight__flight_id__apm_file_put,
    ): CancelablePromise<FileUploadResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/flight/{flight_id}/apm-file',
            path: {
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
     * Delete Apm Param File
     * @param fileId
     * @returns void
     * @throws ApiError
     */
    public static deleteApmParamFileFlightFlightIdApmFileDelete(
        fileId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/flight/{flight_id}/apm-file',
            query: {
                'file_id': fileId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Rosbag File
     * @param fileId
     * @returns void
     * @throws ApiError
     */
    public static deleteRosbagFileFlightFlightIdFileRosbagFileDelete(
        fileId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/flight/{flight_id}/file/rosbag-file',
            query: {
                'file_id': fileId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * List Files
     * @param flightId
     * @returns FlightFilesListResponse Successful Response
     * @throws ApiError
     */
    public static listFilesFlightFlightIdFilesListGet(
        flightId: number,
    ): CancelablePromise<FlightFilesListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/flight/{flight_id}/files/list',
            path: {
                'flight_id': flightId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

}
