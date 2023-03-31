/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseMissionSchema } from '../models/BaseMissionSchema';
import type { MissionDeletion } from '../models/MissionDeletion';
import type { MissionSchema } from '../models/MissionSchema';
import type { Page_MissionSchema_ } from '../models/Page_MissionSchema_';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MissionService {

    /**
     * Retrieve Mission
     * @param missionAlias
     * @param page
     * @param size
     * @param path
     * @returns Page_MissionSchema_ Successful Response
     * @throws ApiError
     */
    public static retrieveMissionMissionGet(
        missionAlias?: string,
        page: number = 1,
        size: number = 50,
        path: string = '/base',
    ): CancelablePromise<Page_MissionSchema_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mission',
            query: {
                'mission_alias': missionAlias,
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
     * Add Mission
     * @param requestBody
     * @returns MissionSchema Successful Response
     * @throws ApiError
     */
    public static addMissionMissionPost(
        requestBody: BaseMissionSchema,
    ): CancelablePromise<MissionSchema> {
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
     * Delete Mission
     * @param missionId
     * @returns MissionDeletion Successful Response
     * @throws ApiError
     */
    public static deleteMissionMissionMissionIdDelete(
        missionId?: string,
    ): CancelablePromise<MissionDeletion> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/mission/<mission_id>',
            query: {
                'mission_id': missionId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Mission
     * @param missionId
     * @param requestBody
     * @returns MissionSchema Successful Response
     * @throws ApiError
     */
    public static updateMissionMissionMissionIdPatch(
        missionId: number,
        requestBody: BaseMissionSchema,
    ): CancelablePromise<MissionSchema> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/mission/<mission_id>',
            query: {
                'mission_id': missionId,
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
