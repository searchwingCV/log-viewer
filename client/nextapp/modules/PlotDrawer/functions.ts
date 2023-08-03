/*
    Helper function to determine which color is not taken yet in the colorMatrix of a flight
*/
import { type DexieLogOverallData, type DexieTakenColorMatrix, OverallDataForFlightTable } from "@idbSchema"


export const getFreeColor = async ({ overallData }: { overallData: DexieLogOverallData }) => {
    if (overallData) {
        //check which color from the colorMatrix is not taken yet
        const freeColors = overallData?.colorMatrix?.filter(
            (color: DexieTakenColorMatrix) => !color.taken,
        )

        const assignedColor = freeColors?.[0]?.color || 'black'
        const newColorMatrix = overallData?.colorMatrix?.map((colorItem: DexieTakenColorMatrix) => ({
            color: colorItem.color,
            taken: assignedColor === colorItem.color ? true : colorItem.taken
        }))
        if (overallData?.id) {
            //update the color matrix in the IndexedDB Database if color is now assigned to a plot
            await OverallDataForFlightTable.update(overallData?.id, {
                colorMatrix: newColorMatrix,
            })
        }
        return assignedColor
    }
    return 'black'
}

