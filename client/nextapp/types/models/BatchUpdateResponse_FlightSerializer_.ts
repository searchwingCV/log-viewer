/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FlightSerializer } from './FlightSerializer';
import type { UnprocessableEntityError } from './UnprocessableEntityError';

export type BatchUpdateResponse_FlightSerializer_ = {
    success?: boolean;
    items: Array<FlightSerializer>;
    errors?: Array<UnprocessableEntityError>;
};

