import type { AxiosError } from 'axios'
import type { DexieError } from 'dexie'
export const ApiErrorMessage = ({ error }: { error: AxiosError<any> }) => {
  const getErrorMessage = () => {
    const status = error?.response?.status
    const statusText = error?.response?.statusText
    let finalErrorDetail = ''

    const errorDetail = error?.response?.data?.detail

    if (status) {
      if (status === 422) {
        errorDetail.forEach((detailObject: any) => {
          finalErrorDetail =
            finalErrorDetail +
            `${
              detailObject?.loc?.[1]
                ? `Field ${detailObject?.loc?.[1]}`
                : 'no error location available'
            }: ${detailObject?.msg || 'no detail message available'} <br/>`
        })
      } else {
        finalErrorDetail = errorDetail
      }
    }

    return `Error submitting data: code ${status || 'no status code available'} - ${
      statusText || 'no status text available'
    } <br/> Details:  <br/> ${finalErrorDetail} `
  }

  return <div dangerouslySetInnerHTML={{ __html: getErrorMessage() }}></div>
}

export const IndexDBErrorMessage = ({ error, event }: { error: DexieError; event: string }) => {
  const getErrorMessage = () => {
    return `Error caused by event: ${event} <br/> IndexedDB Error Message: ${error.message} <br/>
    Consult the FE Dev if an IndexedDB error occurs.`
  }

  return <div dangerouslySetInnerHTML={{ __html: getErrorMessage() }}></div>
}
