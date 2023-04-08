/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FlightPurpose } from './FlightPurpose';
import type { FlightRating } from './FlightRating';

export type FlightUpdate = {
    id: number;
    fkDrone?: number;
    fkMission?: number;
    location?: string;
    pilot?: string;
    observer?: string;
    rating?: FlightRating;
    purpose?: FlightPurpose;
    notes?: string;
    droneNeedsRepair?: boolean;
};

