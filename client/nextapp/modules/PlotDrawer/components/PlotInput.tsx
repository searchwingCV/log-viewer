/* 
   Input component that enables custom plotting
   - each timeseries is a variable represented by a calculator expression, for instance XKF1$0_VE
   - by writing "XKF1$0_VE + 10", the component maps over the values array and adds +10 to each 
     single value of the timeseries
 */

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import { evaluate } from 'mathjs'
import { useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { ApiErrorMessage, IndexDBErrorMessage } from '@lib/ErrorMessage'
import { getBulkLTTBSampledTimeseries } from '~/api/flight/getLTTBSampledTimeseries'
import database, {
  type DexieGroupedProps,
  CustomFunctionTable,
  type DexieLogFileTimeSeries,
  LogFileTimeSeriesTable,
  type DexieCustomPlot,
  type DexieLogOverallData,
  type DexieOverallDataTimeSeries,
} from '@idbSchema'
import { PlotCustomizeButtons } from './PlotCustomizeButtons'
import { getFreeColor } from '../functions'

export type PlotInputProps = {
  initialValue: string
  timeseriesId?: string
  customPlotId?: string
  isCustom?: boolean
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
  hidden?: boolean
  currentColor?: string
  overallData: DexieLogOverallData
}

export const PlotInput = ({
  initialValue,
  timeseriesId,
  customPlotId,
  isCustom,
  activeTimeSeries,
  customPlots,
  hidden,
  currentColor,
  overallData,
}: PlotInputProps) => {
  const [value, setValue] = useState(initialValue)
  const [isValid, setIsValid] = useState(true)
  const router = useRouter()
  const { id: flightid } = router.query

  //array of all timeseries, just flatted out and not nested
  const flatCalculatorVarArray = useMemo(() => {
    return overallData.groupedProperties
      ?.map((grouped: DexieGroupedProps) =>
        grouped.timeSeriesProperties.map((item) => ({
          ...item,
          messageType: grouped.messageType,
        })),
      )
      .flat()
  }, [overallData])

  //if timeseries not in IndexedDB yet, we have to use this fetch mutation that can get multiple
  const fetchTimeSeries = useMutation(getBulkLTTBSampledTimeseries, {
    onSuccess: async (data) => {
      try {
        const identifiedPropertyVars = determineTypedInTimeseriesNames(
          flatCalculatorVarArray,
          value,
        )

        if (data?.length) {
          const newData = data?.map((item) => {
            if (item !== undefined) {
              const { messageType, messageField, ...rest } = item
              const dataForIDB = {
                ...rest,
                id: `${flightid}-${messageField}-${messageType}`
                  .toLowerCase()
                  .replace('[', '')
                  .replace(']', ''),
                propId: `${messageField}-${messageType}`
                  .toLowerCase()
                  .replace('[', '')
                  .replace(']', ''),
                flightid: overallData.flightid,
                timestamp: new Date(),
                messageField,
                messageType,
                overallDataId: overallData.id,
                hidden: containsOnlyIndividualField(value, flatCalculatorVarArray) ? false : true,
                calculatorExpression: `${messageType
                  .replace('[', '$')
                  .replace(']', '')}_${messageField}`.toUpperCase(),
                /*TODO: add smarter color assignment for series fetched with smart input
                Due to several async color updates, it is hard to work with color assignments
                for newly fetched timeseries and newly created custom plots at the same time
                 */
                color: 'black',
              }
              return dataForIDB
            }
          })

          await LogFileTimeSeriesTable.bulkAdd(newData).then(async () => {
            setValue(initialValue)

            if (!containsOnlyIndividualField(value, flatCalculatorVarArray)) {
              await createOrUpdateCustomPlot(
                identifiedPropertyVars,
                //TODO: remove this later
                activeTimeSeries.concat(newData as DexieLogFileTimeSeries[]),
              )
            }
            await deleteCustomIfIndividualField()
          })
        }
      } catch (e: any) {
        if ('message' in e && 'name' in e) {
          toast(
            <IndexDBErrorMessage
              error={e}
              event="adding timeseries to indexeddb on typing in expression"
            />,
            {
              type: 'error',
              delay: 1,
              position: toast.POSITION.BOTTOM_CENTER,
            },
          )
        }
      }
    },
    onError: (error: any) => {
      toast(<ApiErrorMessage error={error} />, {
        type: 'error',
        delay: 1,
      })
    },
  })

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const createOrUpdateCustomPlot = async (
    identifiedPropertyVars: {
      [x: string]: {
        messageField: string
        messageType: string
      }
    }[],
    availableTimeseries: DexieLogFileTimeSeries[],
  ) => {
    // if all timeseries in the input are alreasy in indexeddb we can either create a new custom plot
    // or update the custom plot
    const scope = createScopeForMathJs(identifiedPropertyVars, availableTimeseries)

    const finalNewTimeseriesArray = createFinalTimeseriesArray(scope, value)

    try {
      if (!isCustom) {
        const assignedColor = await getFreeColor({ overallData })

        //if the original input field was for plotting individualFields and has be en
        //enriched with custom expressions
        //we create a new custom function but keep the original individual field
        const customFunction = {
          timestamp: new Date(),
          customFunction: value,
          flightid: overallData.flightid,
          values: finalNewTimeseriesArray,
          color: assignedColor,
          overallDataId: overallData.id,
          calculatorExpressions: identifiedPropertyVars.map((calculatorExpression) =>
            Object.keys(calculatorExpression)[0]?.toUpperCase(),
          ),
        }
        await CustomFunctionTable.add(customFunction)
        setValue(initialValue)
      } else {
        //otherwise we update the customplot
        await CustomFunctionTable.update(customPlotId, {
          customFunction: value,
          overallDataId: overallData.id,
          values: finalNewTimeseriesArray,
          calculatorExpressions: identifiedPropertyVars.map((calculatorExpression) =>
            Object.keys(calculatorExpression)[0]?.toUpperCase(),
          ),
          ...(!initialValue && { color: await getFreeColor({ overallData }) }),
        })
      }
    } catch (e: any) {
      if ('message' in e && 'name' in e) {
        toast(<IndexDBErrorMessage error={e} event="create or update custom plot" />, {
          type: 'error',
          delay: 1,
          position: toast.POSITION.BOTTOM_CENTER,
        })
      }
    }
  }

  const clearCustomPlot = (customPlotId: string) => {
    //deletes custom plot, here we need to delete empty customPlots

    // TODO: solve dexie ts error
    // @ts-expect-error: Dexie not working with TS right now
    database.customFunction.delete(customPlotId).catch((e) =>
      toast(<IndexDBErrorMessage error={e} event="clear custom plots" />, {
        type: 'error',
        delay: 1,
        position: toast.POSITION.BOTTOM_CENTER,
      }),
    )
  }

  const deleteCustomIfIndividualField = () => {
    //if input only represents one individual field and used to be a customPlot, delete the custom
    if (isCustom && containsOnlyIndividualField(value, flatCalculatorVarArray) && customPlotId) {
      clearCustomPlot(customPlotId)
    }
  }

  const validateIfHasPropertyExpressions = async (
    identifiedPropertyVars: {
      [x: string]: {
        messageField: string
        messageType: string
      }
    }[],
  ) => {
    //Covers validation for inputs with property expressions
    const timeseriesNotFetchedYet = determineTimeseriesNotFetchedYet(
      identifiedPropertyVars,
      activeTimeSeries,
    )

    if (!containsOnlyIndividualField(value, flatCalculatorVarArray)) {
      if (timeseriesNotFetchedYet.length) {
        //if there are timeseries in the input that are not fetched yet, fetch them first

        fetchTimeSeries.mutate({
          timeseriesIdentifiers: timeseriesNotFetchedYet.map((identifiers) => ({
            ...identifiers,
            flightid: overallData.flightid,
            n_datapoints: 100,
          })),
        })
      } else {
        //if all properties are already in indexedDB, just createor update  custom plots
        await createOrUpdateCustomPlot(identifiedPropertyVars, activeTimeSeries)
      }
    } else {
      //If it is just one individual field, then don't create a new custom plot
      if (timeseriesNotFetchedYet.length) {
        //But fetch the individual field if it is not in indexedDB yet
        fetchTimeSeries.mutate({
          timeseriesIdentifiers: timeseriesNotFetchedYet.map((identifiers) => ({
            ...identifiers,
            flightid: overallData.flightid,
            n_datapoints: 100,
          })),
        })
      } else {
        //If the user did not change the initialValue at all, then set it back to the initial value
        setValue(initialValue)
      }
    }
    //delete redundant custom field
    //in case the user has created an empty input custom field but just fetched an individual field
    await deleteCustomIfIndividualField()
  }

  useEffect(() => {
    if (activeTimeSeries) {
      //debouncing the input with a setTimeout to not trigger the validate function with every change
      const validate = setTimeout(async () => {
        try {
          const identifiedPropertyVars = determineTypedInTimeseriesNames(
            flatCalculatorVarArray,
            value,
          )

          if (identifiedPropertyVars.length) {
            await validateIfHasPropertyExpressions(identifiedPropertyVars)
          } else {
            if (!initialValue) {
              setIsValid(false)
            } else {
              setValue(initialValue)
            }
          }
        } catch (e) {
          console.error('er', e)
          setIsValid(false)
        }
      }, 3000)

      return () => clearTimeout(validate)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, activeTimeSeries])

  if (!activeTimeSeries) {
    return null
  }

  return (
    <div className={`relative`}>
      <div
        className={`flex
                    w-full
                    justify-between`}
      >
        <input
          className={clsx(
            `my-2
             -ml-3
             mr-2
             block
             w-full
             rounded-md
             px-3
             py-1
             text-[9px]`,
            !isValid
              ? `border
               border-primary-red
               text-primary-red`
              : `text-grey-dark`,
            hidden &&
              `pointer-events-non
               opacity-50`,
          )}
          value={value}
          onChange={(e) => {
            setIsValid(true)
            setValue(e.target.value.toUpperCase())
          }}
        />
        <PlotCustomizeButtons
          hidden={hidden}
          currentColor={currentColor}
          overallData={overallData}
          customPlotId={customPlotId}
          timeseriesId={timeseriesId}
          activeTimeSeries={activeTimeSeries}
          customPlots={customPlots}
          value={value}
          isValid={isValid}
          initialValue={initialValue}
        />
      </div>
      <div
        className={`absolute
                    right-11
                    top-[14px]
                    text-[9px]
                    text-primary-red`}
      >
        {/* {!isValid ? 'not valid' : null} */}
      </div>
    </div>
  )
}

//Helper functions

const determineTypedInTimeseriesNames = (
  flatCalculatorVarArray: DexieOverallDataTimeSeries[],
  value: string,
) => {
  //identifies all calculator expressions (vars) in input

  const typedInPropertyVars: DexieOverallDataTimeSeries[] = []
  flatCalculatorVarArray?.forEach((item: DexieOverallDataTimeSeries) => {
    if (value.toLowerCase().includes(item?.calculatorExpression?.toLowerCase())) {
      typedInPropertyVars.push(item)
    }
  })

  const identifiedPropertyVars = typedInPropertyVars.map((typedInVar) => {
    return {
      [typedInVar.calculatorExpression]: {
        messageType: typedInVar.messageType,
        messageField: typedInVar.messageField,
      },
    }
  })

  return identifiedPropertyVars
}

const determineTimeseriesNotFetchedYet = (
  identifiedPropertyVars: {
    [x: string]: {
      messageField: string
      messageType: string
    }
  }[],
  activeTimeSeries: DexieLogFileTimeSeries[],
) => {
  //identifies all timeseries in input that are not in Indexeddb yet

  return identifiedPropertyVars
    .filter((item) => {
      return !activeTimeSeries
        .map((activeSeries: DexieLogFileTimeSeries) =>
          activeSeries.calculatorExpression.toUpperCase(),
        )
        .includes(Object.keys(item)[0].toUpperCase())
    })
    .map((timeseries) => {
      return Object.values(timeseries)[0]
    })
}

const createScopeForMathJs = (
  identifiedPropertyVars: {
    [x: string]: {
      messageField: string
      messageType: string
    }
  }[],
  activeTimeSeries: DexieLogFileTimeSeries[],
) => {
  //maps a calculatorExpression to its values array and puts it in a scope

  //the evaluate function of math.js can have a scope (mapping of value to a variable)
  //check out https://mathjs.org/docs/expressions/parsing.html
  return identifiedPropertyVars.map((timeseries) => {
    //TODO: following lines have to be changed probably if real data comes in

    const calculatorExpression = Object.keys(timeseries)[0]

    const messageTypeFieldPair = Object.values(timeseries)[0]
    const { messageField, messageType } = messageTypeFieldPair
    const timeseriesKey = `${messageField}-${messageType}`
      .toLowerCase()
      .replace('[', '')
      .replace(']', '')

    const values = activeTimeSeries.find(
      (savedSeries) => savedSeries.propId === timeseriesKey,
    )?.values

    return { [calculatorExpression.toLowerCase()]: values }
  })
}

const createFinalTimeseriesArray = (
  scope: {
    [x: string]:
      | {
          timestamp: string
          value: number
        }[]
      | undefined
  }[],
  value: string,
) => {
  //creates a final values array of a custom plot with math.js' evaluate function
  return Object.values(scope[0])?.[0]?.map((valuesSet, valueArrayIndex) => {
    const scopeForIndex = scope
      ?.map((calculatorValues: any) => {
        const key = Object.keys(calculatorValues)[0]

        const expressionValue: number = Object.values(
          calculatorValues as {
            [x: string]: {
              timestamp: string
              value: number
            }[]
          },
        )[0][valueArrayIndex].value

        return {
          [key]: expressionValue,
        }
      })
      .reduce((a, b) => ({ ...a, ...b }))

    const finalValue = evaluate(value.toLowerCase(), scopeForIndex)

    return {
      timestamp: valuesSet.timestamp,
      value: finalValue,
    }
  })
}

const containsOnlyIndividualField = (
  value: string,
  flatCalculatorVarArray: DexieOverallDataTimeSeries[],
) => {
  //checks if the new input just represents one calculator expression aka one individual timeseries
  const itendifiedVars = flatCalculatorVarArray?.filter((item: DexieOverallDataTimeSeries) =>
    value.toLowerCase().includes(item.calculatorExpression.toLowerCase()),
  )

  return (
    itendifiedVars?.length === 1 &&
    value?.toLowerCase() === (itendifiedVars?.[0]?.calculatorExpression?.toLowerCase() || '')
  )
}
