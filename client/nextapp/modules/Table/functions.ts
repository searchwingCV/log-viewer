import type { FlightWithFilesResponse } from "@schema";
import { FileListResponse, FlightFilesListResponse } from "@schema"

type ColumnType =
    | 'number'
    | 'text'
    | 'textInputLong'
    | 'textInputSmall'
    | 'selectInput'
    | 'date'
    | 'dateInput'
    | 'numberInput'
    | 'buttons'

export const determineWidth = (columnType: ColumnType) => {
    switch (columnType) {
        case 'number':
            return 'w-[80px]'
        case 'buttons':
            return 'w-[150px]'
        case 'text':
            return 'w-[100px]'
        case 'date':
            return 'w-[130px]'
        case 'dateInput':
            return 'w-[200px]'
        case 'textInputLong':
            return 'w-[250px]'
        case 'textInputSmall':
            return 'w-[200px]'
        case 'numberInput':
            return 'w-[100px]'
        case 'selectInput':
            return 'w-[200px]'
        default:
            return 'w-[150px]'
    }
}


export const numberOfFilesSavedForFlight = (flight: FlightWithFilesResponse) => {

    if (flight?.files) {
        const { flightId, ...flightIdRemoved } = flight.files

        return (Object.values(flightIdRemoved)).map(fileData => (fileData?.count || 0)).reduce((acc: number, curr: number) => {
            return acc + curr
        }, 0)
    }
    return 0
}