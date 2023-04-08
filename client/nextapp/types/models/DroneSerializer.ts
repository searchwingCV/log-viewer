/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DroneStatus } from './DroneStatus';

export type DroneSerializer = {
    id: number;
    createdAt: string;
    updatedAt?: string;
    name: string;
    model: string;
    description?: string;
    status?: DroneStatus;
    sysThismav: number;
};

