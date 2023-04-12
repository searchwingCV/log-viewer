import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Page_MissionSerializer_ } from '@schema'

export const ALL_MISSIONS_KEY = "ALL_MISSIONS"

export const getMissions = async (page: number, size: number) => {
    const data: Page_MissionSerializer_ = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mission?page=${page}&size=${size}`)
        .then((res) => {
            return res.data
        })

    return data
}

export const fetchAllMissionsQuery = (page: number, size: number) =>
    useQuery<Page_MissionSerializer_>([ALL_MISSIONS_KEY, page, size], () =>
        getMissions(page, size),
        {
            keepPreviousData: true,
            staleTime: 10 * (60 * 100), // 1 mins
        })
