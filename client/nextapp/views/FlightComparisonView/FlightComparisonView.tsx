import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuery } from '@tanstack/react-query'
import database, { type DexieLogOverallData } from '@idbSchema'
import {
  PlotPropsDrawer,
  PLOT_DRAWER_EXTENDED,
  LineChartComponent,
} from '~/modules/PlotInterfaceComponents'

export const FlightComparisonView = ({ ids }: { ids: string[] }) => {
  const { data: isExtended } = useQuery([PLOT_DRAWER_EXTENDED], () => {
    return true
  })
  const router = useRouter()

  const { firstid, secondid } = router.query

  const overallData = useLiveQuery(
    () =>
      firstid && secondid
        ? //TODO: solve dexie ts error
          // @ts-expect-error: Dexie not working with TS right now
          database.overallDataForFlight
            .orderBy('flightid')
            .filter((data: DexieLogOverallData) => ids.includes(data.id))
            .toArray()
        : null,
    [firstid, secondid],
  )

  const { data: sideNavExtended } = useQuery([PLOT_DRAWER_EXTENDED])

  if (!overallData) {
    return null
  }

  return (
    <>
      <div
        className={`flex-column
                    flex
                    min-h-screen
                    bg-grey-light
                    `}
      >
        <PlotPropsDrawer overallData={overallData} />

        <div
          className={clsx(
            `
             h-screen
             overflow-x-hidden`,
          )}
          style={{
            marginLeft: `${overallData.length * 270}px`,
            minWidth: sideNavExtended ? `calc(100vw - ${overallData.length * 270}px)` : `100vw`,
            transform: sideNavExtended
              ? `translateX(0px)`
              : `translateX(-${overallData.length * 270}px)`,
          }}
        >
          <div
            className={`flex
                        min-h-screen  
                        w-full
                        items-center
                      bg-grey-light
                        pr-5
                        pt-8
                        `}
          >
            <div
              className={clsx(
                `r-8
                 w-full
                 `,
                sideNavExtended ? 'pl-12' : 'pl-28',
              )}
            >
              <LineChartComponent overallData={overallData} isComparingTwoFlights />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
