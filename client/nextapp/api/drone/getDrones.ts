import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Page_DroneSerializer_ } from '@schema/Page_DroneSerializer_'

export const ALL_DRONES_KEY = "ALL_DRONES"

export const getDrones = async (page: number, size: number) => {
    const data: Page_DroneSerializer_ = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/drone?page=${page}&size=${size}`)
        .then((res) => {
            return res.data
        })

    return data
}

export const fetchAllDronesQuery = (page: number, size: number) =>
    useQuery<Page_DroneSerializer_>([ALL_DRONES_KEY, page, size], () =>
        getDrones(page, size),
        {
            keepPreviousData: true
        })
