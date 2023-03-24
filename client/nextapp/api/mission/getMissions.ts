import axios from "axios";
import { MissionSchema } from "@schema/MissionSchema";
import { missionData } from '~/modules/TableComponents/mockData'
import { useQuery } from "react-query";
export const getMissions = async () => {
    await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mission`)
        .then((res) => {
            return res
        })
}

export const getMissionsMock = (): MissionSchema[] => {
    return missionData
}

export const fetchAllMissions = () =>
    useQuery<MissionSchema[]>(['ALL_MISSIONS'], () =>
        getMissionsMock(),
    )


