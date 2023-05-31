/* 
   Component for switching colors, hide/show and deleting plot:
   - used in CurrentPlotSetup and PropertyList,
   - represents one single plot (either an individual timeseries or a custom plot)
 */
import Tippy from '@tippyjs/react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Menu } from '@headlessui/react'

import database, {
  type DexieLogOverallData,
  type DexieLogFileTimeSeries,
  type DexieCustomPlot,
  type DexieTakenColorMatrix,
  OverallDataForFlightTable,
} from '@idbSchema'

export type PlotCustomizeButtonsProps = {
  currentColor?: string
  hidden?: boolean
  overallData: DexieLogOverallData
  customPlotId?: string
  timeseriesId?: string
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots?: DexieCustomPlot[]
  value: string
  isValid: boolean
  initialValue: string
  isInPropertyList?: boolean
}

export const PlotCustomizeButtons = ({
  hidden,
  currentColor,
  overallData,
  customPlotId,
  timeseriesId,
  activeTimeSeries,
  customPlots,
  value,
  isValid,
  initialValue,
  isInPropertyList,
}: PlotCustomizeButtonsProps) => {
  const switchColor = async (chosenNewColor: string) => {
    //if switching colors, the colorMatrix in the overallData has to be updated
    const newColorMatrix = overallData?.colorMatrix?.map((colorItem: DexieTakenColorMatrix) => ({
      color: colorItem.color,
      taken:
        chosenNewColor === colorItem.color
          ? true
          : colorItem.color === currentColor
          ? false
          : colorItem.taken,
    }))

    await OverallDataForFlightTable.update(overallData?.id, {
      colorMatrix: newColorMatrix,
    })

    if (timeseriesId) {
      //TODO: solve dexie ts error
      // @ts-expect-error: Dexie not working with TS right now
      await database.logFileTimeSeries.update(timeseriesId, {
        color: chosenNewColor,
      })
    } else if (customPlotId) {
      //TODO: solve dexie ts error
      // @ts-expect-error: Dexie not working with TS right now
      await database.customFunction.update(customPlotId, {
        color: chosenNewColor,
      })
    }
  }

  const releaseColor = async () => {
    //Updates the colorMatrix and set it to taken:false
    const newColorMatrix = overallData?.colorMatrix?.map((colorItem: DexieTakenColorMatrix) => ({
      color: colorItem.color,
      taken: colorItem.color === currentColor ? false : colorItem.taken,
    }))
    if (overallData?.id) {
      await OverallDataForFlightTable.update(overallData.id, {
        colorMatrix: newColorMatrix,
      })
    }
  }

  const hidePlot = () => {
    //just hides the plot or the timeseries and does not delete it
    if (timeseriesId) {
      //TODO: solve dexie ts error
      // @ts-expect-error: Dexie not working with TS right now
      database.logFileTimeSeries.update(timeseriesId, {
        hidden: true,
      })
    } else if (customPlotId) {
      //TODO: solve dexie ts error
      // @ts-expect-error: Dexie not working with TS right now
      database.customFunction.update(customPlotId, {
        hidden: true,
      })
    }
  }

  const showPlot = () => {
    //sets the hidden property of the addressed logFileTimeSeries or customFunction to false
    if (timeseriesId) {
      //TODO: solve dexie ts error
      // @ts-expect-error: Dexie not working with TS right now
      database.logFileTimeSeries.update(timeseriesId, {
        hidden: false,
      })
    } else if (customPlotId) {
      //TODO: solve dexie ts error
      // @ts-expect-error: Dexie not working with TS right now
      database.customFunction.update(customPlotId, {
        hidden: false,
      })
    }
  }

  const isVisibleInChart = () => {
    //checks whether current plot is not hidden
    if (timeseriesId) {
      return (
        activeTimeSeries?.map((item: DexieLogFileTimeSeries) => item.id).includes(timeseriesId) &&
        activeTimeSeries?.filter(
          (item: DexieLogFileTimeSeries) => item.id === timeseriesId && !item.hidden,
        )?.length
      )
    } else if (customPlotId) {
      return (
        customPlots?.map((item: DexieCustomPlot) => item.id).includes(customPlotId) &&
        customPlots?.filter((item: DexieCustomPlot) => item.id === customPlotId && !item.hidden)
          ?.length
      )
    }
  }

  const isIndividualFieldInCustomPlot = (expression: string) => {
    //checks whether any saved customPlot contains a calculator expression
    return !!customPlots?.filter((customPlot: DexieCustomPlot) =>
      customPlot.customFunction.includes(expression),
    ).length
  }

  const clearProperty = async (timeseriesId: string) => {
    //deletes timeseries from IndexedDB & updates colorMatrix

    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    await database.logFileTimeSeries.delete(timeseriesId)
    await releaseColor()
  }

  const clearCustomPlot = async (customPlotId: string) => {
    //deletes customPlot from IndexedDB & updates colorMatrix

    //TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    await database.customFunction.delete(customPlotId)
    await releaseColor()
  }

  return (
    <div className={`flex`}>
      {initialValue ? (
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button
                className={clsx(
                  `
                   mr-1
                   flex
                   h-4
                   w-6
                   items-center
                   justify-center
                   rounded-md
                   bg-white
                   shadow-subtle`,
                  open &&
                    `border
                   border-primary-rose
                   bg-grey-dark`,
                  isInPropertyList ? `mt-2` : `mt-3`,
                  hidden && `opacity-40`,
                )}
                disabled={hidden}
              >
                {currentColor ? (
                  <div
                    className={`h-2
                                w-2`}
                    style={{
                      backgroundColor: currentColor,
                    }}
                  ></div>
                ) : null}
              </Menu.Button>
              <Menu.Items
                className={clsx(
                  `fixed
                    z-[200]
                    w-7
                    rounded-md
                  bg-black
                    shadow-xl`,
                  isInPropertyList
                    ? `bottom-0
                       right-3`
                    : `top-6
                       right-3`,
                )}
              >
                {overallData?.colorMatrix
                  .filter((colorItem: DexieTakenColorMatrix) => !colorItem.taken)
                  .map((matrixColor: DexieTakenColorMatrix) => (
                    <Menu.Item key={matrixColor.color}>
                      <div
                        className={`py
                                    px-2`}
                      >
                        <button
                          className={clsx(matrixColor.taken ? `bg-grey-medium` : ``)}
                          onClick={async () => {
                            await switchColor(matrixColor.color)
                          }}
                        >
                          <span
                            className={`block
                                        h-3
                                        w-3`}
                            style={{
                              backgroundColor: matrixColor.color,
                            }}
                          ></span>
                        </button>
                      </div>
                    </Menu.Item>
                  ))}
              </Menu.Items>
            </>
          )}
        </Menu>
      ) : null}
      {initialValue && isValid ? (
        isVisibleInChart() ? (
          <Tippy content={`Hide timeseries in chart`}>
            <button
              className={`mr-1
                        text-white`}
              onClick={() => {
                hidePlot()
              }}
            >
              <FontAwesomeIcon width={14} icon={'eye-slash'}></FontAwesomeIcon>
            </button>
          </Tippy>
        ) : (
          <Tippy content={`Show timeseries in chart`}>
            <button
              className={`mr-1
                          text-white
                          hover:opacity-50`}
              onClick={() => {
                showPlot()
              }}
            >
              <FontAwesomeIcon width={14} icon={'eye'}></FontAwesomeIcon>
            </button>
          </Tippy>
        )
      ) : null}

      <Tippy
        content={
          customPlotId
            ? 'Clear this custom plot from indexedDB.'
            : isIndividualFieldInCustomPlot(value)
            ? `Delete custom plot containing the expression ${value} first before you can delete this timeseries from IndexedDB`
            : 'Clear this property entirely from indexedDB'
        }
      >
        <button
          onClick={async () => {
            if (timeseriesId && !isIndividualFieldInCustomPlot(value)) {
              await clearProperty(timeseriesId)
            } else if (customPlotId) {
              await clearCustomPlot(customPlotId)
            }
          }}
        >
          <span
            className={clsx(
              `
                              pr-4
                              text-primary-white
                              `,
              !customPlotId && isIndividualFieldInCustomPlot(value) && 'opacity-40',
            )}
          >
            <FontAwesomeIcon icon={'trash-can'} width={10}></FontAwesomeIcon>
          </span>
        </button>
      </Tippy>
    </div>
  )
}