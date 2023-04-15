import { useRouter } from 'next/router'
import { Layout } from 'modules/Layout/Layout'

const FlightCompareScreen = ({}) => {
  const router = useRouter()
  const { firstid, secondid } = router.query

  return (
    <>
      <Layout>{`Welcome to the detail screen of flight ${firstid} and ${secondid}`}</Layout>
    </>
  )
}

export default FlightCompareScreen
