/* 
   Side Drawer that can be extended or minimized and shows all timeseries and plots
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { ToastContainer } from 'react-toastify'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import Link from 'next/link'
import database, {
  type DexieLogFileTimeSeries,
  type DexieCustomPlot,
  type DexieLogOverallData,
} from '@idbSchema'
import CircleIconButton from 'modules/CircleIconButton'
import { CurrentPlotSetup } from './CurrentPlotSetup'
import { PropertyList } from './PropertyList'

export type PlotPropsDrawerProps = {
  overallData: DexieLogOverallData[]
}

export const PLOT_DRAWER_EXTENDED = 'PLOT_DRAWER_EXTENDED'

type InteractiveDrawerSectionProps = {
  flightData: DexieLogOverallData
}

export const InteractiveDrawerSection = ({ flightData }: InteractiveDrawerSectionProps) => {
  const customPlots = useLiveQuery(() =>
    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.customFunction
      .orderBy('timestamp')
      .filter((customPlot: DexieCustomPlot) => customPlot.overallDataId === flightData.id)
      .toArray(),
  )

  //get activeTimeSeries from IndexedDB
  const activeTimeSeries = useLiveQuery(() =>
    // TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.logFileTimeSeries
      .orderBy('timestamp')
      .filter((series: DexieLogFileTimeSeries) => series.overallDataId === flightData.id)
      .toArray(),
  )

  return (
    <>
      <div className="px-4 pt-4 text-xs text-white">{`FLIGHT ${flightData.flightid}`} </div>
      <CurrentPlotSetup
        activeTimeSeries={activeTimeSeries}
        customPlots={customPlots}
        overallData={flightData}
      />
      <PropertyList
        overallData={flightData}
        activeTimeSeries={activeTimeSeries}
        customPlots={customPlots}
      />
    </>
  )
}

export const PlotPropsDrawer = ({ overallData }: PlotPropsDrawerProps) => {
  const { data: isExtended } = useQuery([PLOT_DRAWER_EXTENDED], () => {
    return true
  })

  const queryClient = useQueryClient()

  const handleToggleSideNav = () => {
    //toggle drawer extension with react-query
    queryClient.setQueryData<boolean>([PLOT_DRAWER_EXTENDED], (prev) => {
      return !prev
    })
  }

  if (!overallData) {
    return null
  }

  return (
    <div
      className={clsx(
        `fixed
         top-0
         bottom-0
         z-10
         h-full
         `,
      )}
      style={{
        width: overallData.length * 270,
        transform: isExtended
          ? `translateX(0px)`
          : `translateX(-${overallData.length * 270 - 40}px`,
      }}
    >
      <>
        <ToastContainer />
        <div
          className={`relative
                    flex
                    h-full 
                    flex-row
                    bg-y-indigo-to-petrol
                    `}
        >
          <CircleIconButton
            addClasses={`fixed
                       top-[100px]
                       -right-9
                       z-30`}
            iconClassName={isExtended ? 'chevron-left' : 'chevron-right'}
            onClick={() => {
              handleToggleSideNav()
            }}
          />

          {isExtended ? (
            <>
              <div
                className={`absolute
                            left-2
                            top-4
                            z-[50]`}
              >
                <Link href={'/flights'}>
                  <span
                    className={`cursor-pointer rounded-md
                                bg-[#a3a3e2]
                                px-2
                                py-1
                                text-xs
                                text-white
                                hover:bg-[#b8b8ee]
                               `}
                  >
                    Back to FLIGHTS
                  </span>
                </Link>
              </div>

              {overallData?.map((flightData) => (
                <div
                  key={`drawer-${flightData.id}`}
                  className={`h-full
                              w-full
                              overflow-scroll
                              pt-12
                              pr-3`}
                >
                  <InteractiveDrawerSection flightData={flightData} />
                </div>
              ))}
            </>
          ) : null}
        </div>
      </>
    </div>
  )
}
