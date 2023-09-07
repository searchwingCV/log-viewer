import { useContext } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import database, { type DexieLogOverallData } from '@idbSchema'
import { UIContext } from '@lib/Context/ContextProvider'
import { PlotDrawer } from '@modules/PlotDrawer'
import { LineChartComponent } from '@modules/Chart'

export const FlightComparisonView = ({ ids }: { ids: string[] }) => {
  const { plotDrawerExtended } = useContext(UIContext)

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
            `
             h-screen
             overflow-x-hidden`,
          )}
          style={{
            marginLeft: `${overallData.length * 270}px`,
            minWidth: plotDrawerExtended ? `calc(100vw - ${overallData.length * 270}px)` : `100vw`,
            transform: plotDrawerExtended
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
                plotDrawerExtended ? 'pl-12' : 'pl-28',
              )}
            >
              <LineChartComponent overallData={overallData} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
