/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MissionSerializer } from './MissionSerializer';
import type { UnprocessableEntityError } from './UnprocessableEntityError';

export type BatchUpdateResponse_MissionSerializer_ = {
    success?: boolean;
    items: Array<MissionSerializer>;
    errors?: Array<UnprocessableEntityError>;
};

