
import { useRouter } from 'next/router'



export const useGoToLastTablePage = ({ tableName }: { tableName: string }) => {

    const router = useRouter()
    const { curentPageSize, currentPageCount, totalNumber } = router.query

    const goToLastTablePage = async () => {
        if (totalNumber && currentPageCount && curentPageSize) {
            const totalNumberConverted = parseInt(totalNumber as string)
            const curentPageSizeConverted = parseInt(curentPageSize as string)
            const curentPageCountConverted = parseInt(currentPageCount as string)

            const hasToOpenNewPage =
                (totalNumberConverted + 1) / curentPageSizeConverted > curentPageCountConverted
            await new Promise((resolve) => setTimeout(resolve, 1000))
            await router.push(
                `/${tableName}?page=${hasToOpenNewPage ? curentPageCountConverted + 1 : curentPageCountConverted
                }&pagesize=${curentPageSizeConverted}&backwards=true`,
            )



        }

    }

    return goToLastTablePage

}