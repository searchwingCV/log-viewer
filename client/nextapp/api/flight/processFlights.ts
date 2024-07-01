import axios from "axios"

export const processFlight = async ({ flightId }: { flightId: number }) => {
    const data = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/flight/${flightId}/process`)
        .then((res) => {
            return res.data
        })
    return data
}
