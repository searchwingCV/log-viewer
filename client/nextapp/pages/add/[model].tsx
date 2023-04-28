import type { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { CreateObjectLayout } from '~/modules/Layouts/CreateObjectLayout'
import { AddDroneView } from '~/views/AddDroneView/AddDroneView'
import AddFlightView from '~/views/AddFlightView'
import AddMissionView from '~/views/AddMissionView'
import type { NextPageWithLayout } from '../_app'

const models = ['flight', 'drone', 'mission']

export const AddInstanceScreen: NextPageWithLayout = ({}) => {
  const router = useRouter()
  const { model } = router.query

  const renderForm = () => {
    switch (model) {
      case 'flight':
        return <AddFlightView />
        return
      case 'drone':
        return <AddDroneView />
      case 'mission':
        return <AddMissionView />
      default:
        return null
    }
  }
  return <>{renderForm()}</>
}

AddInstanceScreen.getLayout = (page) => <CreateObjectLayout>{page}</CreateObjectLayout>

export const getStaticPaths = () => {
  const paths = models.map((item) => ({
    params: { model: item },
  }))

  return { paths, fallback: false }
}
export const getStaticProps: GetStaticProps = () => {
  return {
    props: {},
  }
}

export default AddInstanceScreen
