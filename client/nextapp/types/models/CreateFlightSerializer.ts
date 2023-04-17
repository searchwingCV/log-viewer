/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FlightPurpose } from './FlightPurpose';
import type { FlightRating } from './FlightRating';

export type CreateFlightSerializer = {
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
};

