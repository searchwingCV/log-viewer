import axios from "axios";
import type { AllowedFiles, FlightFileSerializer } from '@schema'

type AllowedFilesType = `${AllowedFiles}`

type PutFileProps = {
    file: Blob, fileType: AllowedFilesType, flightId: number, producePlots?: boolean
}

export const uploadFileForFlight = async ({ file, fileType, flightId, producePlots = false }: PutFileProps) => {
    const fd = new FormData();
    fd.append('file', (file as any)[0]);

    const response: FlightFileSerializer = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/flight/${flightId}/file?file_type=${fileType}&process=${producePlots}`,
        // TODO: for now, we are hardcoding log type, in the future this should be dynamic.
        fd,
        {
            headers: {
                "Content-Type": "multipart/form-data",
                'Accept': 'application/json',
            },
        }
    )
    return response
}
