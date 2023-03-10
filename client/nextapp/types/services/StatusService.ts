/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class StatusService {

    /**
     * Liveness Probe
     * Indicates the status of the service
     * @returns any Successful Response
     * @throws ApiError
     */
    public static livenessProbeStatusGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/status',
            errors: {
                404: `Not found`,
            },
        });
    }

}
