/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DroneStatus } from './DroneStatus';

export type CreateDroneSerializer = {
    name: string;
    model: string;
    description?: string;
    status?: DroneStatus;
    sysThismav: number;
};

