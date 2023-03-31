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
    //actual columns
    flightId: string;
    description?: string
    pilot?: string;
    location?: string
    rating?: string
    droneNeedsRepair?: boolean
    planeId: string;
    purpose?: string
    missionId?: string;
    notes: string;
    //weather api

    temperature: number;
    weatherConditions: string[]

    //from log
    startTime: string;
    createdAt: string
    energyConsumed: number //Wh
    minPower: number //W
    maxPower: number //W
    avgPower: number //W
    minBatVoltage: number //V
    maxBatVoltage: number //V
    avgBatVoltage: number //V
    deltaBatVoltage: number //V
    minBatCurrent: number //A
    maxBatCurrent: number //A
    avgBatCurrent: number //A
    minGroundSpeed: number //km/h
    maxGroundSpeed: number //km/h
    avgGroundSpeed: number //km/h
    minAirSpeed: number //km/h
    maxAirSpeed: number //km/h
    avgAirSpeed: number //km/h
    avgWindSpeed: number //km/h

    maxSpeedUp: number //km/h
    maxSpeedDown: number //km/h
    maxSpeedHorizontal: number //km/h

    maxTelemetaryDistance: number  //km
    flightDuration: number //hh:mm:ss
    logDuration: number //hh:mm:ss
    totalDistance: number //km
    hardwareVersion: string
    firmwareVersion: string
}