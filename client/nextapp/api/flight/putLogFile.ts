import axios from "axios";
import { AllowedFiles, FlightFileSerializer } from '@schema'

type AllowedFilesType = `${AllowedFiles}`

type PutFileProps = {
    file: Blob, fileType: AllowedFilesType, flightId: number
}

export const putLogFile = async (params: PutFileProps) => {

    const { file, fileType, flightId } = params
    const fd = new FormData();
    fd.append('file', file);

    const response: FlightFileSerializer = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/flight/${flightId}/file?file_type=${fileType}`,
        fd,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    )
        .then((res) => {
            return res.data
        })


    return response
}
