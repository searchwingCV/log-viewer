//TODO: Exchange mock request with real one
import axios from "axios";
import { FlightSchemaTable } from "@schema/FlightSchema";


export const putFlights = async (flights: FlightSchemaTable[]) => {
    await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/flights`,
        { flights: flights }
    )
        .then((res) => {
            return res
        })
}
export const putFlightsMock = async ({ flights, changedIds }: { flights: FlightSchemaTable[], changedIds: string[] }) => {
    await axios.put('https://dummyjson.com/products/1',
        {
            err: 'iPhone Galaxy +1'
        }
    )
        .then((res) => {
            return res
        })
    return changedIds
}

