import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { Layout } from 'modules/Layout/Layout'
import { AddDroneView } from '~/views/AddDroneView/AddDroneView'

const models = ['flight', 'drone', 'mission']

export const AddInstanceScreen = ({}) => {
  const router = useRouter()
  const { model } = router.query

  const renderForm = () => {
    switch (model) {
      case 'flight':

      case 'drone':
        return <AddDroneView />
      case 'mission':

      default:
        return null
    }
  }

  return <Layout>{renderForm()}</Layout>
}

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
