/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AllowedFiles } from './AllowedFiles';

export type FileUploadResponse = {
    id: number;
    createdAt: string;
    updatedAt?: string;
    uri: string;
    location: string;
    fileType: AllowedFiles;
    fkFlight: number;
    version?: number;
};

