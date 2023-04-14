

//TODO: Exchange mock request with real one
import axios from "axios";
import { BatchUpdateResponse_DroneSerializer_, DroneUpdate } from '@schema'


export const patchDrones = async (items: DroneUpdate[]) => {
    const response: BatchUpdateResponse_DroneSerializer_ = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/drone`,
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
