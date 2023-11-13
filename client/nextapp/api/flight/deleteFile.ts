import axios from "axios";


export const deleteFile = async ({ url }: { url: string }) => {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${url}`)
        .then((res) => {
            return res.data
        })
    return response
}
