/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AllowedFiles } from './AllowedFiles';

export type FlightFileSerializer = {
    id: number;
    createdAt: string;
    updatedAt?: string;
    location: string;
    fileType: AllowedFiles;
    fkFlight: number;
    version?: number;
};

