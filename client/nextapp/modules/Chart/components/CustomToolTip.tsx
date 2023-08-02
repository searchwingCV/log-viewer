export const CustomTooltip = ({
  toolTipProps,
  flightIds,
}: {
  toolTipProps: any
  flightIds: number[]
}) => {
  return (
    <div
      className={`rounded-md
                  border
                  border-grey-medium
                  bg-white
                  px-4
                  py-4
                  text-[9px]`}
    >
      {flightIds.map((flightid) => (
        <div key={`tooltip-${flightid}`} className={`mb-2`}>
          <div>{`Flight ${flightid}`}</div>
          {toolTipProps?.payload
            ?.filter((payload: any) => payload.name.split('-')[0] === flightid.toString())
            .map((payload: any, i: number) => (
              <div key={`tooltip-payload-${payload.name}`}>
                {i === 0 ? <p> {payload.payload[`${flightid}-formattedTime`]}</p> : null}
                {i === 0 ? <p> {payload.payload[`${flightid}-timestamp`]}</p> : null}
                <p style={{ color: payload.stroke }}>{`${payload.name}: ${payload.value}`}</p>
              </div>
            ))}
          {!toolTipProps?.payload?.filter(
            (payload: any) => payload.name.split('-')[0] === flightid.toString(),
          )?.length ? (
            <p>nothing</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
