

import axios from "axios";
import { BatchUpdateResponse_MissionSerializer_, MissionUpdate } from '@schema'


export const patchMissions = async (items: MissionUpdate[]) => {
    const response: BatchUpdateResponse_MissionSerializer_ = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/mission`,
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
