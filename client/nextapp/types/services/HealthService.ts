/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppHealth } from '../models/AppHealth';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class HealthService {

    /**
     * Liveness Probe
     * Indicates the status of the service
     * @returns AppHealth Successful Response
     * @throws ApiError
     */
    public static livenessProbeHealthGet(): CancelablePromise<AppHealth> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
            errors: {
                404: `Not found`,
            },
        });
    }

}
