/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ErrorCodes } from './ErrorCodes';

export type UnprocessableEntityError = {
    id: number;
    title?: string;
    code?: ErrorCodes;
    detail: string;
};

