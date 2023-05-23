import axios from "axios";
import type { AllowedFiles, FlightFileSerializer } from '@schema'

type AllowedFilesType = `${AllowedFiles}`

type PutFileProps = {
    file: Blob, fileType: AllowedFilesType, flightId: number
}

export const putLogFile = async (params: PutFileProps) => {

    const { file, flightId } = params
    const fd = new FormData();
    fd.append('file', file);

    const response: FlightFileSerializer = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/flight/${flightId}/file?file_type=log`,
        // TODO: for now, we are hardcoding log type, in the future this should be dynamic.
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
