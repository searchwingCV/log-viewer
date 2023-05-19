/* 
   Side Drawer that can be extended or minimized and shows all timeseries and plots
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { useRouter } from 'next/router'
import { ToastContainer } from 'react-toastify'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import type { GroupedProps } from '@schema'
import database, {
  type DexieLogFileTimeSeries,
  type DexieCustomPlot,
  type DexieLogOverallData,
} from '@idbSchema'
import CircleIconButton from 'modules/CircleIconButton'
import { CurrentPlotSetup } from './CurrentPlotSetup'
import { PropertyList } from './PropertyList'
import Link from 'next/link'

type Props = {
  overallData: DexieLogOverallData
  groupedProperties: GroupedProps[]
}

export const PLOT_DRAWER_EXTENDED = 'PLOT_DRAWER_EXTENDED'

export const PlotPropsDrawer = ({ overallData, groupedProperties }: Props) => {
  const router = useRouter()
  const { id: flightid } = router.query

  //get customPlots from IndexedDB
  const customPlots = useLiveQuery(() =>
    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.customFunction
      .orderBy('timestamp')
      .filter((customPlot: DexieCustomPlot) => customPlot.flightid === parseInt(flightid as string))
      .toArray(),
  )

  //get activeTimeSeries from IndexedDB
  const activeTimeSeries = useLiveQuery(() =>
    // TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.logFileTimeSeries
      .orderBy('timestamp')
      .filter((series: DexieLogFileTimeSeries) => series.flightid === parseInt(flightid as string))
      .toArray(),
  )

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
         w-side-drawer
         `,

        isExtended
          ? `translate-x-0
             translate-y-0`
          : 'translate-x-[-200px]',
      )}
    >
      <>
        <ToastContainer />
        <div
          className={`relative
                    h-full
                    overflow-scroll 
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
                className={`pl-6
                            pt-4`}
              >
                <Link href={'/flight-overview'}>
                  <span
                    className={`text-xs
                              text-white
                                hover:underline
                                hover:underline-offset-8
                               `}
                  >
                    Back to FLIGHTS
                  </span>
                </Link>
              </div>
              <CurrentPlotSetup
                activeTimeSeries={activeTimeSeries}
                customPlots={customPlots}
                overallData={overallData}
              />

              <PropertyList
                groupedProperties={groupedProperties}
                activeTimeSeries={activeTimeSeries}
                customPlots={customPlots}
                overallData={overallData}
              />
            </>
          ) : null}
        </div>
      </>
    </div>
  )
}
