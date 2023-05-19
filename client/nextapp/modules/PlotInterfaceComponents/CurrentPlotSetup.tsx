/*
    Component at the top of the drawer on the FlightDetailPage,
    shows the currently fetched timeseries and created custom plots
    with input fields
*/
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from 'modules/Button'
import database, {
  type DexieLogFileTimeSeries,
  CustomFunctionTable,
  type DexieCustomPlot,
  OverallDataForFlightTable,
  type DexieLogOverallData,
} from '@idbSchema'
import { Disclosure, DisclosurePanel } from './Disclosure'
import { PlotInput } from './PlotInput'

export const CurrentPlotSetup = ({
  activeTimeSeries,
  customPlots,
  overallData,
}: {
  activeTimeSeries: DexieLogFileTimeSeries[]
  customPlots: DexieCustomPlot[]
  overallData: DexieLogOverallData
}) => {
  const router = useRouter()
  const { id: flightid } = router.query

  const clearAllPlots = () => {
    //delete all logFileTimeSeries and customPlots from IndexedDB
    database
      .table('logFileTimeSeries')
      .clear()
      .then(() => {
        console.info('logFileTimeSeries data for flight deleted')
      })
      .catch((e) =>
        toast(`deleting logFileTimeSeries, ${e}`, {
          type: 'error',
        }),
      )

    database
      .table('customFunction')
      .clear()
      .then(() => {
        console.info('customFunction data for flight deleted')
      })
      .catch((e) =>
        toast(`deleting customFunctions, ${e}`, {
          type: 'error',
        }),
      )

    OverallDataForFlightTable.update(overallData.id, {
      colorMatrix: overallData.colorMatrix.map((color) => ({
        color: color.color,
        taken: false,
      })),
    })
      .then(() => {
        console.info('Colormatrix data for flight reset')
      })
      .catch((e) =>
        toast(`error resetting color matrix , ${e}`, {
          type: 'error',
        }),
      )
  }

  const addEmptyField = async () => {
    //for adding an empty CustomPlot
    const emptyCustomFunction = {
      timestamp: new Date(),
      customFunction: '',
      flightid: parseInt(flightid as string),
    }
    await CustomFunctionTable.add(emptyCustomFunction)
  }

  return (
    <div
      className={`
                     px-4
                     pt-4
                     text-white`}
    >
      <Disclosure buttonContent={'Current Plot Setup'} isSpecialButton>
        <DisclosurePanel
          className={`mb-8
                      pl-4`}
        >
          <div
            className={`ml-2
                        mt-4
                        w-full`}
          >
            {!activeTimeSeries?.length && !customPlots?.length ? (
              <div
                className={`flex
                            w-full`}
              >
                No Plots
              </div>
            ) : null}
            {activeTimeSeries?.length ? (
              <div
                className={`-ml-3
                            text-xs`}
              >
                Individual Fields
              </div>
            ) : null}

            {activeTimeSeries?.map((currentChosenTimeSeries) => (
              <PlotInput
                key={currentChosenTimeSeries.id}
                hidden={currentChosenTimeSeries.hidden}
                activeTimeSeries={activeTimeSeries}
                initialValue={`${currentChosenTimeSeries.group
                  .replace('[', '$')
                  .replace(']', '')}_${currentChosenTimeSeries.name}`.toUpperCase()}
                timeseriesId={currentChosenTimeSeries.id}
                customPlots={customPlots}
                currentColor={currentChosenTimeSeries.color}
                overallData={overallData}
              />
            ))}

            {customPlots?.length ? (
              <div
                className={`-ml-3
                            mt-4
                            text-xs`}
              >
                Custom Plots
              </div>
            ) : null}
            <div className="mb-4">
              {customPlots?.map((customPlot: DexieCustomPlot) => (
                <PlotInput
                  key={customPlot.id}
                  hidden={customPlot.hidden}
                  activeTimeSeries={activeTimeSeries}
                  initialValue={customPlot.customFunction}
                  customPlotId={customPlot.id}
                  isCustom
                  customPlots={customPlots}
                  currentColor={customPlot.color}
                  overallData={overallData}
                ></PlotInput>
              ))}
            </div>

            <div
              className={`-ml-3
                          mt-4
                          mr-4
                          grid
                          grid-cols-2
                          gap-4`}
            >
              <Button
                buttonStyle="Tertiary"
                className={`bg-text-primary-rose
                            flex
                            w-full
                            justify-center
                            py-1
                            px-1`}
                onClick={clearAllPlots}
                disabled={!!!activeTimeSeries?.length}
              >
                <div
                  className={`mr-1
                            text-primary-red`}
                >
                  <FontAwesomeIcon icon={'circle-xmark'}></FontAwesomeIcon>
                </div>
                Clear All
              </Button>
              <Button
                buttonStyle="Tertiary"
                className={`bg-text-primary-rose
                            flex
                            w-full
                            justify-center
                            py-1
                            px-1`}
                onClick={addEmptyField}
              >
                <div
                  className={`mr-1
                            text-primary-green`}
                >
                  <FontAwesomeIcon icon={'plus-circle'}></FontAwesomeIcon>
                </div>{' '}
                Add Plot
              </Button>
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>
  )
}
