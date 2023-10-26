/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MavlinkMessageField } from './MavlinkMessageField';

export type MavLinkMessagePropertiesSerializer = {
    messageType: string;
    messageFields: Array<MavlinkMessageField>;
};

