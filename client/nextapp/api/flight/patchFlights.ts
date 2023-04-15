

import axios from "axios";
import { BatchUpdateResponse_FlightSerializer_, FlightUpdate } from '@schema'


export const patchFlights = async (items: FlightUpdate[]) => {
    const response: BatchUpdateResponse_FlightSerializer_ = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/flight`,
        {
            items
        })
        .then((res) => {
            return res.data
        }).catch((e) =>
            console.error(e)
        )

    return response
}
