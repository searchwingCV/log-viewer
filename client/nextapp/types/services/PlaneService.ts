/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BasePlaneSchema } from '../models/BasePlaneSchema';
import type { Page_PlaneDetailsSchema_ } from '../models/Page_PlaneDetailsSchema_';
import type { PlaneDetailsSchema } from '../models/PlaneDetailsSchema';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PlaneService {

    /**
     * Retrieve Plane
     * @param planeAlias
     * @param page
     * @param size
     * @param path
     * @returns Page_PlaneDetailsSchema_ Successful Response
     * @throws ApiError
     */
    public static retrievePlanePlaneGet(
        planeAlias?: string,
        page: number = 1,
        size: number = 50,
        path: string = '/base',
    ): CancelablePromise<Page_PlaneDetailsSchema_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/plane',
            query: {
                'plane_alias': planeAlias,
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
     * Add Plane
     * @param requestBody
     * @returns PlaneDetailsSchema Successful Response
     * @throws ApiError
     */
    public static addPlanePlanePost(
        requestBody: BasePlaneSchema,
    ): CancelablePromise<PlaneDetailsSchema> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/plane',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Plane
     * @param planeId
     * @param requestBody
     * @returns PlaneDetailsSchema Successful Response
     * @throws ApiError
     */
    public static updatePlanePlanePlaneIdPatch(
        planeId: number,
        requestBody: BasePlaneSchema,
    ): CancelablePromise<PlaneDetailsSchema> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/plane/<plane_id>',
            query: {
                'plane_id': planeId,
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
