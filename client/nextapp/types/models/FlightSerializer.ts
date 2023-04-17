/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FlightPurpose } from './FlightPurpose';
import type { FlightRating } from './FlightRating';
import type { WindIntensity } from './WindIntensity';

export type FlightSerializer = {
    id: number;
    createdAt: string;
    updatedAt?: string;
    fkDrone: number;
    fkMission?: number;
    /**
     * A short description of the location
     */
    location: string;
    /**
     * The pilot reference (to be replaced with ID)
     */
    pilot?: string;
    /**
     * The observer while flying
     */
    observer?: string;
    /**
     * A rating for the flight: good/problems/crash
     */
    rating?: FlightRating;
    /**
     * The purpose of the flight: test/training/mission
     */
    purpose?: FlightPurpose;
    /**
     * Some notes about the flight
     */
    notes?: string;
    droneNeedsRepair?: boolean;
    /**
     * Air temperature in degrees Celsius
     */
    temperatureCelsius?: number;
    /**
     * The wind intensity: Strong > 5 bft, Medium 2..4 bft, Calm 1..2 bft
     */
    wind?: WindIntensity;
    logStartTime?: string;
    logEndTime?: string;
    logDuration?: number;
    startLatitude?: string;
    startLongitude?: string;
    endLatitude?: string;
    endLongitude?: string;
    hardwareVersion?: string;
    firmwareVersion?: string;
    distanceKm?: number;
    maxGroundspeedKmh?: number;
    minGroundspeedKmh?: number;
    avgGroundspeedKmh?: number;
    maxAirspeedKmh?: number;
    minAirspeedKmh?: number;
    avgAirspeedKmh?: number;
    maxVerticalSpeedUpKmh?: number;
    maxVerticalSpeedDownKmh?: number;
    maxTelemetryDistanceKm?: number;
    maxBatteryVoltage?: number;
    minBatteryVoltage?: number;
    deltaBatteryVoltage?: number;
    maxBatteryCurrentA?: number;
    minBatteryCurrentA?: number;
    avgBatteryCurrentA?: number;
    minPowerW?: number;
    maxPowerW?: number;
    avgPowerW?: number;
    minWindspeedKmh?: number;
    avgWindspeedKmh?: number;
    maxWindspeedKmh?: number;
    energyConsumedWh?: number;
};

