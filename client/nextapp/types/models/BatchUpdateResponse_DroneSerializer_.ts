/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DroneSerializer } from './DroneSerializer';
import type { UnprocessableEntityError } from './UnprocessableEntityError';

export type BatchUpdateResponse_DroneSerializer_ = {
    success?: boolean;
    items: Array<DroneSerializer>;
    errors?: Array<UnprocessableEntityError>;
};

