import { useContext } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import type { LogOverallData } from '@schema'
import { UIContext } from '@lib/Context/ContextProvider'
import database, { type DexieLogOverallData } from '@idbSchema'
import { PlotDrawer } from '@modules/PlotDrawer'
import { LineChartComponent } from '@modules/Chart'

export type FlightDetailViewProps = {
  logOverallData: LogOverallData
}

export const FlightDetailView = () => {
  const router = useRouter()
  const { plotDrawerExtended } = useContext(UIContext)

  const { id } = router.query

  const overallData = useLiveQuery(() =>
    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.overallDataForFlight
      ?.orderBy('timestamp')
      ?.filter(
        (flightData: DexieLogOverallData) =>
          flightData.flightid === parseInt(id as string) && flightData.isIndividualFlight,
      )
      ?.toArray(),
  )

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
        <PlotDrawer overallData={overallData} />

        <div
          className={clsx(
            `ml-side-drawer-width
             h-screen
             overflow-x-hidden`,

            plotDrawerExtended
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
                plotDrawerExtended ? 'pl-8' : 'pl-28',
              )}
            >
              <LineChartComponent overallData={overallData} flightId={overallData?.[0]?.flightid} />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
