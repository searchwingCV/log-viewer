

import axios from "axios";
import type { CreateDroneSerializer, DroneSerializer } from '@schema'


export const postDrone = async (drone: CreateDroneSerializer) => {
    const response: DroneSerializer = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/drone`,
        {
            ...drone
        })
        .then((res) => {
            return res.data
        })

    return response
}
