import { addSeconds } from "date-fns"

export const getDatesBetween = (startDate: string, endDate: string) => {

    const timestamps = []
    const startJSDate = new Date(startDate)
    const endJSDate = new Date(endDate)
    let currentDate = new Date(startJSDate.setTime(startJSDate.getTime() + startJSDate.getTimezoneOffset() * 60 * 1000))
    const endDateWithOffSet = new Date(endJSDate.setTime(endJSDate.getTime() + endJSDate.getTimezoneOffset() * 60 * 1000))

    while (currentDate <= endDateWithOffSet) {
        timestamps.push(new Date(currentDate))
        currentDate = addSeconds(currentDate, 1)

    }
    return timestamps
}


