

import axios from "axios";
import { CreateMissionSerializer, MissionSerializer } from '@schema'


export const postMission = async (mission: CreateMissionSerializer) => {
    const response: MissionSerializer = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mission`,
        {
            ...mission
        })
        .then((res) => {
            return res.data
        })

    return response
}
