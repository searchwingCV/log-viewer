import { useRouter } from 'next/router'
import { Layout } from 'modules/Layouts/Layout'
import { FileList } from 'modules/FileList'
import { FileUploadForm } from 'modules/FileUploadForm'
import { useGoToLastTablePage } from '@lib/hooks/useGoToLastTablePage'
import type { NextPageWithLayout } from '../_app'

const files = [
  {
    id: 1,
    downloadLink: 'https://codesandbox.io/s/xil63?file=/src/App.js',
    name: 'somefile.png',
    uploaded: '2021-08-04T12:00:00',
    size: '1.2MB',
    deleteLink: 'https://codesandbox.io/s/xil63?file=/src/App.js',
  },
  {
    id: 2,
    downloadLink: 'https://codesandbox.io/s/xil63?file=/src/App.js',
    name: 'somefile2.png',
    uploaded: '2021-08-04T12:00:00',
    size: '10MB',
    deleteLink: 'https://codesandbox.io/s/xil63?file=/src/App.js',
  },
  {
    id: 3,
    downloadLink: 'https://codesandbox.io/s/xil63?file=/src/App.js',
    name: 'somefile3.png',
    uploaded: '2021-08-04T12:00:00',
    size: '10MB',
    deleteLink: 'https://codesandbox.io/s/xil63?file=/src/App.js',
  },
  {
    id: 4,
    downloadLink: 'https://codesandbox.io/s/xil63?file=/src/App.js',
    name: 'somefile4.png',
    uploaded: '2021-08-04T12:00:00',
    size: '10MB',
    deleteLink: 'https://codesandbox.io/s/xil63?file=/src/App.js',
  },
]
const FileManagerScreen: NextPageWithLayout = ({}) => {
  const router = useRouter()
  const { id } = router.query
  return (
    <>
      <div className={`flex h-screen w-full`}>
        <div className="flex h-screen min-w-[60vw] flex-col  items-center  border-r-2 pb-8 pt-48 ">
          <h2 className="mb-16 text-xl font-bold">{`FILES FOR FLIGHT ${id}`}</h2>

          {files?.length > 0 ? (
            <div className="h-24 text-xl">No files found</div>
          ) : (
            <FileList files={[]} />
          )}
        </div>
        <div>upload</div>

        <FileUploadForm />
      </div>
    </>
  )
}

FileManagerScreen.getLayout = (page) => <Layout>{page}</Layout>

export default FileManagerScreen
