/* 
   Renders a list of all TimeSeries properties of a flight log in a grouped shape
   - by clicking on the timeseries, it is fetched and saved to IndexedDB
 */

import { useState, useMemo } from 'react'
import Tippy from '@tippyjs/react'
import useElementSize from '@charlietango/use-element-size'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  LogFileTimeSeriesTable,
  type DexieLogFileTimeSeries,
  type DexieCustomPlot,
  type DexieLogOverallData,
} from '@idbSchema'
import type { GroupedProps } from '@schema'
import { getLogPropertyTimeSeriesMock } from 'api/flight/getLogTimeSeries'

import { Disclosure, DisclosurePanel } from './Disclosure'
import { PlotCustomizeButtons } from './PlotCustomizeButtons'
import { getFreeColor } from './colorUpdateFunctions'

export type PropertyListType = {
  groupedProperties: GroupedProps[]
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
  overallData: DexieLogOverallData
}

type DrawerProperty = {
  label: string
  name: string
  originalName: string
  id: string
  groupName: string
}

export const PropertyList = ({
  groupedProperties,
  activeTimeSeries,
  customPlots,
  overallData,
}: PropertyListType) => {
  const [ref, size] = useElementSize()

  const router = useRouter()
  const { id: flightid } = router.query

  //fetch timeseries on click
  const fetchTimeSeriesOnClick = useMutation(getLogPropertyTimeSeriesMock, {
    onSuccess: async (data) => {
      const { id, ...rest } = data
      const assignedColor = await getFreeColor({ overallData })
      const dataForIDB = {
        ...rest,
        id: `${parseInt(flightid as string)}-${id}`,
        propId: id,
        flightid: parseInt(flightid as string),
        timestamp: new Date(),
        hidden: false,
        color: assignedColor,
      }

      await LogFileTimeSeriesTable.add(dataForIDB)
    },
    onError: (e) => {
      toast(`error fetching timeseries data, ${e}`, {
        type: 'error',
        position: toast.POSITION.BOTTOM_CENTER,
      })
    },
  })

  const [query, setQuery] = useState('')

  const isSavedToIndexedDB = (id: string) => {
    //checks if timeseries is already in IndexedDB
    return activeTimeSeries?.map((item: DexieLogFileTimeSeries) => item.propId).includes(id)
  }

  const fetchClickedProperty = (timeseriesId: string) => {
    //performs fetch mutation
    fetchTimeSeriesOnClick.mutate({
      key: timeseriesId,
      flightid: parseInt(flightid as string),
    })
  }

  //timeseries data are grouped, each group is a disclosure in PropertyList
  const groups = useMemo(
    () =>
      groupedProperties?.map((prop) => ({
        name: prop.name,
        items: prop.timeSeriesProperties.map((item) => ({
          label: `${item.name} (${item.unit})`,
          name: `${prop.name} ${item.id} ${item.name}`,
          originalName: item.name,
          id: item.id,
          groupName: prop.name,
        })),
      })),
    [groupedProperties],
  )

  const getExpresson = (propItem: DrawerProperty) => {
    //get the calculator expression that is important for PlotInput
    return `${propItem.groupName.replace('[', '$').replace(']', '')}_${
      propItem.originalName
    }`.toUpperCase()
  }

  const getDexieActiveTimeSeries = (id: string) => {
    //returns timeseries linked the the given id from IndexedDb
    return activeTimeSeries?.find((item) => item.id === `${flightid}-${id}`)
  }

  return (
    <div
      style={{
        height: size.height + 100,
      }}
    >
      <div
        ref={ref}
        className={`
                   overflow-visible
                  px-4`}
      >
        <Disclosure buttonContent={'Plot individual fields'} isSpecialButton>
          <DisclosurePanel>
            <div
              className={`relative
                          w-full
                          overflow-hidden
                          px-2`}
            >
              <ul
                className={`relative
                          z-30
                 `}
              >
                <input
                  className={`mt-6
                            mb-4
                            w-full
                            rounded-md
                            py-2
                            pl-4
                            text-xs`}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search for individual property..."
                />
                {groups
                  .filter((group) => {
                    return (
                      group.items.filter((item) =>
                        item.name.toLowerCase().includes(query.toLowerCase()),
                      ).length > 0
                    )
                  })
                  .map((group) => (
                    <Disclosure buttonContent={group.name} key={group.name}>
                      <>
                        {group.items.map((item) => (
                          <DisclosurePanel key={`${group.name}-${item.name}`}>
                            <Tippy
                              content={`Copy calculator expression ${item.groupName
                                .replace('[', '$')
                                .replace(']', '')}_${item.originalName} to clipboard`}
                            >
                              <div
                                className={`pl-2
                                            pt-1`}
                              >
                                <button
                                  className={`text-white
                                              opacity-40
                                              hover:opacity-100`}
                                  onClick={async () => {
                                    await navigator.clipboard
                                      .writeText(
                                        `${item.groupName.replace('[', '$').replace(']', '')}_${
                                          item.originalName
                                        }`,
                                      )
                                      .then(() => console.info('copied'))
                                      .catch((e) => console.error(e))
                                  }}
                                >
                                  <FontAwesomeIcon icon="copy" width={10} />
                                </button>
                              </div>
                            </Tippy>

                            <button
                              className={clsx(
                                `
                                    py-2
                                    pl-2
                                    text-left
                                    text-xs`,
                                isSavedToIndexedDB(item.id)
                                  ? `pointer-events-none
                                     w-full
                                   text-grey-light
                                    `
                                  : 'text-grey-light',
                              )}
                              onClick={() => fetchClickedProperty(item.id)}
                            >
                              <span>{item.label}</span>
                            </button>

                            {getDexieActiveTimeSeries(item.id) ? (
                              <PlotCustomizeButtons
                                hidden={getDexieActiveTimeSeries(item.id)?.hidden}
                                activeTimeSeries={activeTimeSeries}
                                isValid={true}
                                customPlots={customPlots}
                                initialValue={getExpresson(item)}
                                timeseriesId={`${flightid}-${item.id}`}
                                currentColor={getDexieActiveTimeSeries(item.id)?.color}
                                overallData={overallData}
                                value={getExpresson(item)}
                                isInPropertyList
                              />
                            ) : null}
                          </DisclosurePanel>
                        ))}
                      </>
                    </Disclosure>
                  ))}
              </ul>
            </div>
          </DisclosurePanel>
        </Disclosure>
      </div>
    </div>
  )
}
