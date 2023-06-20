/* 
   Renders a list of all TimeSeries properties of a flight log in a grouped shape
   - by clicking on the timeseries, it is fetched and saved to IndexedDB
 */

import { useState, useMemo } from 'react'
import Tippy from '@tippyjs/react'
import type { AxiosError } from 'axios'
import useElementSize from '@charlietango/use-element-size'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  LogFileTimeSeriesTable,
  type DexieLogFileTimeSeries,
  type DexieCustomPlot,
  type DexieLogOverallData,
} from '@idbSchema'
import { ApiErrorMessage, IndexDBErrorMessage } from '@lib/ErrorMessage'
import { getLogPropertyTimeSeriesMock } from 'api/flight/getLogTimeSeries'
import { Disclosure, DisclosurePanel } from './Disclosure'
import { PlotCustomizeButtons } from './PlotCustomizeButtons'
import { getFreeColor } from './colorUpdateFunctions'

type DrawerProperty = {
  label: string
  combinedName: string
  originalName: string
  messageType: string
}

export type PropertyListProps = {
  overallData: DexieLogOverallData
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
}

export const PropertyList = ({ overallData, activeTimeSeries, customPlots }: PropertyListProps) => {
  const [ref, size] = useElementSize()

  //fetch timeseries on click
  const fetchTimeSeriesOnClick = useMutation(getLogPropertyTimeSeriesMock, {
    onSuccess: async (data) => {
      try {
        const { messageType, messageField, flightid, ...rest } = data
        const assignedColor = await getFreeColor({ overallData })

        const dataForIDB = {
          ...rest,
          id: `${
            overallData.isIndividualFlight
              ? `${flightid}-${messageField}-${messageType}`
              : `${flightid}-${overallData.id}-${messageField}-${messageType}`
          }`
            .toLowerCase()
            .replace(',', '')
            .replace('[', '')
            .replace(']', ''),
          propId: `${messageField}-${messageType}`.toLowerCase().replace('[', '').replace(']', ''),
          overallDataId: overallData.id,
          flightid: overallData.flightid,
          messageField,
          messageType,
          timestamp: new Date(),
          hidden: false,
          color: assignedColor,
          calculatorExpression: `${messageType
            .replace('[', '$')
            .replace(']', '')}_${messageField}`.toUpperCase(),
        }

        await LogFileTimeSeriesTable.add(dataForIDB)
      } catch (e: any) {
        if ('message' in e && 'name' in e) {
          toast(<IndexDBErrorMessage error={e} event="fetch new timeseries on click" />, {
            type: 'error',
            delay: 1,
            position: toast.POSITION.BOTTOM_CENTER,
          })
        }
      }
    },
    onError: (error: AxiosError<any>) => {
      toast(<ApiErrorMessage error={error} />, {
        type: 'error',
        delay: 1,
        position: toast.POSITION.BOTTOM_CENTER,
      })
    },
  })

  const [query, setQuery] = useState('')

  const fetchClickedProperty = (messageType: string, messageField: string) => {
    //performs fetch mutation
    fetchTimeSeriesOnClick.mutate({
      messageType,
      messageField,
      flightid: overallData.flightid,
    })
  }

  //timeseries data are grouped, each group is a disclosure in PropertyList
  const groups = useMemo(
    () =>
      overallData.groupedProperties?.map((prop) => ({
        messageType: prop.messageType,
        items: prop.timeSeriesProperties.map((item) => ({
          label: `${item.messageField}` + (item?.unit ? `(${item?.unit})` : ''),
          combinedName: `${prop.messageType} ${item.messageField}`,
          originalName: item.messageField,
          propId: `${item.messageField}-${prop.messageType}`
            .toLowerCase()
            .replace('[', '')
            .replace(']', ''),
          messageType: prop.messageType,
        })),
      })),
    [overallData],
  )

  const getExpresson = (propItem: DrawerProperty) => {
    //get the calculator expression that is important for PlotInput
    return `${propItem.messageType.replace('[', '$').replace(']', '')}_${
      propItem.originalName
    }`.toUpperCase()
  }

  const getDexieActiveTimeSeries = (propId: string) => {
    //returns timeseries linked the the given id from IndexedDb
    return activeTimeSeries?.find((item) => item.propId === propId)
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
                   pl-2
                   pr-1`}
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
                  ?.filter((group) => {
                    return (
                      group.items.filter((item) =>
                        item.combinedName.toLowerCase().includes(query.toLowerCase()),
                      ).length > 0
                    )
                  })
                  .map((group) => (
                    <Disclosure buttonContent={group.messageType} key={group.messageType}>
                      <>
                        {group.items.map((item) => (
                          <DisclosurePanel key={`${group.messageType}-${item.combinedName}`}>
                            <Tippy
                              content={`Copy calculator expression ${item.messageType
                                .replace('[', '$')
                                .replace(']', '')
                                .toUpperCase()}_${item.originalName.toUpperCase()} to clipboard`}
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
                                        `${item.messageType.replace('[', '$').replace(']', '')}_${
                                          item.originalName
                                        }`.toUpperCase(),
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
                                    text-xs
                                    text-white`,
                                getDexieActiveTimeSeries(item.propId)
                                  ? `pointer-events-none
                                     w-full
                                     opacity-30
                                    `
                                  : 'text-grey-light',
                              )}
                              onClick={() =>
                                fetchClickedProperty(item.messageType, item.originalName)
                              }
                            >
                              <span>{item.label}</span>
                            </button>

                            {getDexieActiveTimeSeries(item.propId) ? (
                              <PlotCustomizeButtons
                                hidden={getDexieActiveTimeSeries(item.propId)?.hidden}
                                activeTimeSeries={activeTimeSeries}
                                isValid={true}
                                customPlots={customPlots}
                                initialValue={getExpresson(item)}
                                timeseriesId={`${overallData.id}-${item.originalName}-${item.messageType}`
                                  .toLowerCase()
                                  .replace('[', '')
                                  .replace(']', '')}
                                currentColor={getDexieActiveTimeSeries(item.propId)?.color}
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
