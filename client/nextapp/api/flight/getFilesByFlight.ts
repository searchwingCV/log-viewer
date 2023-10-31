import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { FlightFilesListResponse } from '@schema'

export const ALL_FILES_BY_FLIGHT = "ALL_FILES_BY_FLIGHT"

export const getFilesByFlight = async (id: number) => {
    const data: FlightFilesListResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/flight/${id}/file`)
        .then((res) => {
            return res.data
        })
    return data
}


export const useFetchAllFilesByFlightQuery = (id: number) =>
    useQuery<FlightFilesListResponse>([ALL_FILES_BY_FLIGHT, id], () =>
        getFilesByFlight(id),
        {
            keepPreviousData: true,
            staleTime: 10 * (60 * 100), // 1 mins
        })
