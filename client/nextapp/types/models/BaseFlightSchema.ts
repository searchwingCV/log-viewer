/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { WeatherCondititions } from './WeatherCondititions';

export type BaseFlightSchema = {
    /**
     * The average flight speed in km/h
     */
    averageSpeed?: number;
    planeId: number;
    missionId: number;
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
};

