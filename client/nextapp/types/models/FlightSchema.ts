/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { WeatherCondititions } from './WeatherCondititions';

/**
 * Final Pydantic model that represents the DB schema
 */
export type FlightSchema = {
    /**
     * The average flight speed in km/h
     */
    averageSpeed?: number;
    planeId: number;
    missionId?: number;
    /**
     * The flown distance in km
     */
    distance?: number;
    latitude?: number;
    longitude?: number;
    pilot?: string;
    observer?: string;
    weatherConditions?: WeatherCondititions;
    /**
     * The temperature in ˚C
     */
    temperature?: number;
    startTime?: string;
    endTime?: string;
    notes?: string;
    flightId?: number;
    updatedAt?: string;
    createdAt?: string;
};

//TODO: Remove this and replace all uses of FlightSchemaTable with generated FlightSchema once database is populated with appropriate data
export type FlightSchemaTable = {
    startTime: string;
    temperature: number;
    missionId?: string;
    flightId: number;
    planeId: number;
    pilot: string;
    averageSpeed: number;
    longitude: number;
    latitude: number;
    notes: string;
    //missionId?: number;
    createdAt?: string;
    observer?: number

}