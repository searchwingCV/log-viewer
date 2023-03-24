/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Final Pydantic model that represents the DB schema
 */
export type MissionSchema = {
    missionAlias: string;
    description: string;
    location: string;
    latitude: number;
    longitude: number;
    isTest: boolean;
    missionId: string;
    updatedAt?: string;
    createdAt?: string;
};

