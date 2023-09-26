import axios from "axios";


export const deleteFlight = async ({ flightId }: { flightId: number }) => {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/flight/${flightId}`)
        .then((res) => {
            return res.data
        })
    return response
}
