import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuery } from '@tanstack/react-query'
import { LogOverallData } from '@schema'
import database, { DexieLogOverallData } from '@idbSchema'
import {
  PlotPropsDrawer,
  LineChartComponent,
  PLOT_DRAWER_EXTENDED,
} from '~/modules/PlotInterfaceComponents'

export type FlightDetailViewProps = {
  logOverallData: LogOverallData
}

export const FlightDetailView = ({ logOverallData }: FlightDetailViewProps) => {
  const router = useRouter()
  const { data: isExtended } = useQuery([PLOT_DRAWER_EXTENDED], () => {
    return true
  })
  const { id } = router.query

  const overallData = useLiveQuery(() =>
    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.overallDataForFlight
      .orderBy('timestamp')
      .filter((customPlot: DexieLogOverallData) => customPlot.flightid === parseInt(id as string))
      .toArray(),
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
        <PlotPropsDrawer
          groupedProperties={logOverallData.groupedProperties}
          overallData={overallData[0]}
        />

        <div
          className={clsx(
            `ml-side-drawer-width
             h-screen
             overflow-x-hidden`,

            sideNavExtended
              ? `min-w-[calc(100vw_-_270px)]
                 translate-x-0
                 translate-y-0`
              : `min-w-[calc(100vw_-_0px)]
                 translate-x-[-260px]`,
          )}
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
              <LineChartComponent
                flightModeData={logOverallData.flightModeTimeSeries}
                flightId={parseInt(id as string)}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
