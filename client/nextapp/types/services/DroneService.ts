/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BatchUpdateResponse_DroneSerializer_ } from '../models/BatchUpdateResponse_DroneSerializer_';
import type { CreateDroneSerializer } from '../models/CreateDroneSerializer';
import type { DroneSerializer } from '../models/DroneSerializer';
import type { Page_DroneSerializer_ } from '../models/Page_DroneSerializer_';
import type { UpdateSerializer_DroneUpdate_ } from '../models/UpdateSerializer_DroneUpdate_';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DroneService {

    /**
     * Retrieve Drones
     * @param page
     * @param size
     * @returns Page_DroneSerializer_ Successful Response
     * @throws ApiError
     */
    public static retrieveDronesDroneGet(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<Page_DroneSerializer_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/drone',
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
     * Add Drone
     * @param requestBody
     * @returns DroneSerializer Successful Response
     * @throws ApiError
     */
    public static addDroneDronePost(
        requestBody: CreateDroneSerializer,
    ): CancelablePromise<DroneSerializer> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/drone',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Drones
     * Update drones in batch
     * @param requestBody
     * @returns BatchUpdateResponse_DroneSerializer_ Successful Response
     * @throws ApiError
     */
    public static updateDronesDronePatch(
        requestBody: UpdateSerializer_DroneUpdate_,
    ): CancelablePromise<BatchUpdateResponse_DroneSerializer_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/drone',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

}
