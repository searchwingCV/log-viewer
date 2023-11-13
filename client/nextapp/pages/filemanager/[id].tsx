import { useRouter } from 'next/router'
import type { GetServerSideProps } from 'next'
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query'
import type { FlightFilesListResponse } from '@schema'
import { FileList } from 'modules/FileList'
import { Layout } from 'modules/Layouts/Layout'

import { FileUploadForm } from 'modules/FileUploadForm'
import { ALL_FILES_BY_FLIGHT, getFilesByFlight } from '@api/flight'
import type { NextPageWithLayout } from '../_app'

const normalizeDataForTable = (data: FlightFilesListResponse) => {
  const { flightId, ...flightIdRemoved } = data
  return Object.keys(flightIdRemoved)
    .map(
      (key) =>
        flightIdRemoved[key as keyof typeof flightIdRemoved]?.data?.map((item) => ({
          ...item,
          type: key,
          deleteLink: `/flight/file/${item.id}`,
        })) || [],
    )
    .flat()
}

const FileManagerScreen: NextPageWithLayout = ({}) => {
  const router = useRouter()
  const { id } = router.query
  const { data } = useQuery<FlightFilesListResponse>(
    [ALL_FILES_BY_FLIGHT, id],
    () => getFilesByFlight(parseInt(id as string)),
    {
      keepPreviousData: true,
      staleTime: 10 * (60 * 100), // 1 mins
    },
  )

  return (
    <>
      <div className={'flex h-screen w-full'}>
        <div className="flex h-screen min-w-[60vw] flex-col items-center border-r-2 pb-8 pt-48">
          <div className="mb-16">
            <h2 className="text-xl">{`FILES FOR FLIGHT ${id}`}</h2>
          </div>
          {!data ? (
            <div className="h-24 text-xl">No files found</div>
          ) : (
            <FileList files={normalizeDataForTable(data)} />
          )}
        </div>
        <FileUploadForm flightId={parseInt(id as string)} />
      </div>
    </>
  )
}

FileManagerScreen.getLayout = (page) => <Layout>{page}</Layout>

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query.id
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery([ALL_FILES_BY_FLIGHT, 1, 10], () =>
    getFilesByFlight(parseInt((id || '-1') as string)),
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default FileManagerScreen
