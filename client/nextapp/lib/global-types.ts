export type BrushDataProps = {
    startIndex: number
    endIndex: number
    flightid: number
    startTimestamp: string
    endTimestamp: string
    intervalVisibleInChart: boolean
}


export enum FixedTimeIntervals {
    First30 = 'First 30s',
    Middle30 = 'Middle 30s',
    Last30 = 'Last 30s',
    Reset = 'Reset',
}