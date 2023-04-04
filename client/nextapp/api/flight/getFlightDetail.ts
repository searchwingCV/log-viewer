//TODO: Exchange mock request with real one
import axios from "axios";
import { flightData } from '~/modules/TableComponents/mockData'
import { useQuery } from "@tanstack/react-query";
import { FlightSchemaTable } from "@schema/FlightSchema";
export const getFlights = async () => {
    await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/flights`)
        .then((res) => {
            return res
        })
}

export const getFlightMock = (id: string): any[] => {
    return flightData
}

export const fetchFlight = (id: string) =>
    useQuery<FlightSchemaTable[]>([`flight-${id}`], () =>
        getFlightMock(id),
    )
