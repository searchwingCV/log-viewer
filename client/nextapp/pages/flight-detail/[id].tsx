import { useRouter } from 'next/router'
import FlightDetailView from '~/views/FlightDetailView'

const FlightDetailScreen = ({}) => {
  const router = useRouter()
  const { id } = router.query

  return (
    <>
      <FlightDetailView />
    </>
  )
}

export default FlightDetailScreen
