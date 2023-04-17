import { useRouter } from 'next/router'
import { Layout } from '~/modules/Layouts/Layout'

const FlightDetailScreen = ({}) => {
  const router = useRouter()
  const { id } = router.query

  return (
    <>
      <Layout>{`Welcome to the detail screen of flight ${id} `}</Layout>
    </>
  )
}

export default FlightDetailScreen
