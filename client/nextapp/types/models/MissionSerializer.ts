/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MissionSerializer = {
    id: number;
    createdAt: string;
    updatedAt?: string;
    name: string;
    description?: string;
    location: string;
    startDate: string;
    endDate: string;
    partnerOrganization?: string;
};

