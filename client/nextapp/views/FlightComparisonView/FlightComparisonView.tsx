import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuery } from '@tanstack/react-query'
import database, { type DexieLogOverallData } from '@idbSchema'
import { PlotPropsDrawer, PLOT_DRAWER_EXTENDED } from '~/modules/PlotInterfaceComponents'

export const FlightComparisonView = ({}) => {
  const router = useRouter()

  const { firstid, secondid } = router.query

  const overallData = useLiveQuery(
    () =>
      firstid && secondid
        ? //TODO: solve dexie ts error
          // @ts-expect-error: Dexie not working with TS right now
          database.overallDataForFlight
            .orderBy('flightid')
            .filter(
              (data: DexieLogOverallData) =>
                (data.flightid === parseInt(firstid as string) ||
                  data.flightid === parseInt(secondid as string)) &&
                !data.isIndividualFlight,
            )
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
            `ml-side-drawer-width
             h-screen
             overflow-x-hidden`,
          )}
          style={{
            minWidth: sideNavExtended ? `calc(100vw - ${overallData.length * 270})` : `100vw`,
            transform: sideNavExtended
              ? `translateX(0px)`
              : `translateX(-${overallData.length * 270}px)`,
          }}
        >
          <main
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
                sideNavExtended ? 'pl-8' : 'pl-28',
              )}
            >
              {/* <LineChartComponent flightModeData={logOverallData.flightModeTimeSeries} /> */}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
