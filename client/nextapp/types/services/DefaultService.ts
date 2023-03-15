/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * Main
     * Welcome
     * @returns any Successful Response
     * @throws ApiError
     */
    public static mainGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }

    /**
     * Get File From Uri
     * @param uri
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFileFromUriFileGet(
        uri: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/file',
            query: {
                'uri': uri,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Handle Http Get
     * @returns any The GraphiQL integrated development environment.
     * @throws ApiError
     */
    public static handleHttpGetGraphqlMetaGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/graphql-meta',
            errors: {
                404: `Not found if GraphiQL is not enabled.`,
            },
        });
    }

    /**
     * Handle Http Post
     * @returns any Successful Response
     * @throws ApiError
     */
    public static handleHttpPostGraphqlMetaPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/graphql-meta',
        });
    }

}
