import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { PlotPropsDrawer } from '~/modules/PlotInterfaceComponents'
import LineChartComponent from '~/modules/LineChartComponent'
import { animated, useSpring } from '@react-spring/web'

const Series = require('time-series-data-generator')

const numOfData = 30
const series1 = new Series({
  from: '2016-01-01T00:24:33Z',
  until: '2016-01-01T01:10:00Z',

  numOfData,
  interval: 1,
})

const series2 = new Series({
  from: '2016-01-01T00:24:33Z',
  until: '2016-01-01T01:10:00Z',
  numOfData,
  interval: 1,
})

const mockData: { propName: string; values: { timestamp: string; value: number }[] }[] = [
  {
    propName: 'VE',
    values: series1.cos().map((item: { timestamp: string; value: number }) => ({
      timestamp: item.timestamp,
      value: item.value * 10,
    })),
  },
  {
    propName: 'STH',
    values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
      timestamp: item.timestamp,
      value: item.value * 10,
    })),
  },
  {
    propName: 'VN',
    values: series2.gaussian().map((item: { timestamp: string; value: number }) => ({
      timestamp: item.timestamp,
      value: item.value * 10,
    })),
  },
]

series2
  .gaussian()
  .map((item: { timestamp: string; value: number }) => ({
    timestamp: item.timestamp,
    value: item.value * 10,
  }))
  .map((it: any, index: number) => {
    if (index < 12) {
      return { time: it.timestamp, mode: 'FBWA' }
    } else if (index < 200) {
      return { time: it.timestamp, mode: 'MANUAL' }
    } else if (index < 450) {
      return { time: it.timestamp, mode: 'AUTO' }
    } else if (index < 80) {
      return { time: it.timestamp, mode: 'AUTOTUNE' }
    } else if (index < 1100) {
      return { time: it.timestamp, mode: 'MANUAL' }
    } else if (index < 1500) {
      return { time: it.timestamp, mode: 'FBWA' }
    } else if (index < 2100) {
      return { time: it.timestamp, mode: 'AUTO' }
    } else if (index < 2600) {
      return { time: it.timestamp, mode: 'MANUAL' }
    } else {
      return { time: it.timestamp, mode: '' }
    }
  })

const mockFlightModes = series2
  .gaussian()
  .map((item: { timestamp: string; value: number }) => ({
    timestamp: item.timestamp,
    value: item.value * 10,
  }))
  .map((it: any, index: number) => {
    if (index < 120) {
      return { time: it.timestamp, mode: 'FBWA' }
    } else if (index < 200) {
      return { time: it.timestamp, mode: 'MANUAL' }
    } else if (index < 450) {
      return { time: it.timestamp, mode: 'AUTO' }
    } else if (index < 80) {
      return { time: it.timestamp, mode: 'AUTOTUNE' }
    } else if (index < 1100) {
      return { time: it.timestamp, mode: 'MANUAL' }
    } else if (index < 1500) {
      return { time: it.timestamp, mode: 'FBWA' }
    } else if (index < 2100) {
      return { time: it.timestamp, mode: 'AUTO' }
    } else if (index < 2600) {
      return { time: it.timestamp, mode: 'MANUAL' }
    } else {
      return { time: it.timestamp, mode: '' }
    }
  })

const DRAWER_EXTENDED = 'drawer-extended'

export const FlightDetailView = () => {
  const router = useRouter()
  const { id } = router.query
  const { data: sideNavExtended } = useQuery([DRAWER_EXTENDED])

  return (
    <>
      <div
        className={`flex-column
                    flex
                    min-h-screen
                    bg-grey-light
                    `}
      >
        <PlotPropsDrawer />

        <div
          className={clsx(
            `ml-side-drawer-width
                       h-screen
                       overflow-x-hidden`,

            sideNavExtended
              ? 'min-w-[calc(100vw_-_270px)] translate-x-0 translate-y-0'
              : 'min-w-[calc(100vw_-_0px)] translate-x-[-260px]',
          )}
          //style={slideX}
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
              <LineChartComponent
                data={mockData}
                flightModeData={mockFlightModes}
                flightId={parseInt(id as string)}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
