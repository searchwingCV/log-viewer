import { Layout } from 'modules/Layouts/Layout'
import { FileList } from 'modules/FileList'
import type { NextPageWithLayout } from '../_app'

const FileManagerScreen: NextPageWithLayout = ({}) => {
  return (
    <>
      <div className={`flex h-screen w-full px-6 pt-24`}>
        <div className="w-1/2">
          <FileList
            files={[
              {
                id: 1,
                downloadLink: 'https://codesandbox.io/s/xil63?file=/src/App.js',
                name: 'somefile.png',
                uploaded: '2021-08-04T12:00:00',
                size: '1.2MB',
              },
              {
                id: 2,
                downloadLink: 'https://codesandbox.io/s/xil63?file=/src/App.js',
                name: 'somefile2.png',
                uploaded: '2021-08-04T12:00:00',
                size: '10MB',
              },
            ]}
          />
        </div>
        <div>upload</div>
      </div>
    </>
  )
}

FileManagerScreen.getLayout = (page) => <Layout>{page}</Layout>

export default FileManagerScreen
