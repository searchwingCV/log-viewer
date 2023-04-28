import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { LogOverallData } from '@schema'
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
  const { id } = router.query
  const { data: sideNavExtended } = useQuery([PLOT_DRAWER_EXTENDED])

  return (
    <>
      <div
        className={`flex-column
                    flex
                    min-h-screen
                    bg-grey-light
                    `}
      >
        <PlotPropsDrawer groupedProperties={logOverallData.groupedProperties} />

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
                        `}
          >
            <div
              className={clsx(
                `r-8
                 w-full
                 pt-8`,
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
