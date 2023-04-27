import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { PlotPropsDrawer, LineChartComponent } from '~/modules/PlotInterfaceComponents'
import { animated, useSpring } from '@react-spring/web'
import { LogOverallData } from '@schema'

const DRAWER_EXTENDED = 'drawer-extended'

export type FlightDetailViewProps = {
  logOverallData: LogOverallData
}

export const FlightDetailView = ({ logOverallData }: FlightDetailViewProps) => {
  const router = useRouter()
  const { id } = router.query
  const { data: sideNavExtended } = useQuery([DRAWER_EXTENDED])

  console.log('djdj', logOverallData)

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
              ? 'min-w-[calc(100vw_-_270px)] translate-x-0 translate-y-0'
              : 'min-w-[calc(100vw_-_0px)] translate-x-[-260px]',
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
            <div className={clsx('w-full pr-8  pt-8', sideNavExtended ? 'pl-8' : 'pl-28')}>
              {/* <LineChartComponent
                data={mockData}
                flightModeData={logOverallData.flightModeTimeSeries}
                flightId={parseInt(id as string)}
              /> */}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
