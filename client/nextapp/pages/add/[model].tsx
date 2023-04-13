import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Button from '~/modules/Button'
import { CreateObjectLayout } from '~/modules/Layouts/CreateObjectLayout'
import { AddDroneView } from '~/views/AddDroneView/AddDroneView'
import AddMissionView from '~/views/AddMissionView'
import { NextPageWithLayout } from '../_app'

const models = ['flight', 'drone', 'mission']

export const AddInstanceScreen: NextPageWithLayout = ({}) => {
  const router = useRouter()
  const { model } = router.query

  const renderForm = () => {
    switch (model) {
      case 'flight':

      case 'drone':
        return <AddDroneView />
      case 'mission':
        return <AddMissionView />
      default:
        return null
    }
  }

  return renderForm()
}

AddInstanceScreen.getLayout = (page) => <CreateObjectLayout>{page}</CreateObjectLayout>

export const getStaticPaths = async () => {
  const paths = models.map((item) => ({
    params: { model: item },
  }))

  return { paths, fallback: false }
}

// This also gets called at build time
export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  }
}

export default AddInstanceScreen
