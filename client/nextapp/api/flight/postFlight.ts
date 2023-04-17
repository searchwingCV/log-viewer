

import axios from "axios";
import { CreateFlightSerializer, FlightSerializer } from '@schema'


export const postFlight = async (flight: CreateFlightSerializer) => {
    const response: FlightSerializer = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/flight`,
        {
            ...flight
        })
        .then((res) => {
            return res.data
        })


    return response
}
