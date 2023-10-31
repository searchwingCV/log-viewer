/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BatchUpdateResponse_MissionSerializer_ } from '../models/BatchUpdateResponse_MissionSerializer_';
import type { CreateMissionSerializer } from '../models/CreateMissionSerializer';
import type { MissionSerializer } from '../models/MissionSerializer';
import type { Page_MissionSerializer_ } from '../models/Page_MissionSerializer_';
import type { UpdateSerializer_MissionUpdate_ } from '../models/UpdateSerializer_MissionUpdate_';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MissionService {

    /**
     * Retrieve All Missions
     * @param page
     * @param size
     * @returns Page_MissionSerializer_ Successful Response
     * @throws ApiError
     */
    public static retrieveAllMissionsMissionGet(
        page: number = 1,
        size: number = 20,
    ): CancelablePromise<Page_MissionSerializer_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mission',
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
     * Add Mission
     * @param requestBody
     * @returns MissionSerializer Successful Response
     * @throws ApiError
     */
    public static addMissionMissionPost(
        requestBody: CreateMissionSerializer,
    ): CancelablePromise<MissionSerializer> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mission',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Missions
     * Update missions in batch
     * @param requestBody
     * @returns BatchUpdateResponse_MissionSerializer_ Successful Response
     * @throws ApiError
     */
    public static updateMissionsMissionPatch(
        requestBody: UpdateSerializer_MissionUpdate_,
    ): CancelablePromise<BatchUpdateResponse_MissionSerializer_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/mission',
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
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteMissionMissionIdDelete(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/mission/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

}
