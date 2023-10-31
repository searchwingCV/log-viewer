import axios from "axios";


export const deleteFile = async ({ url }: { url: string }) => {
    const response = await axios.delete(url)
        .then((res) => {
            return res.data
        })
    return response
}
