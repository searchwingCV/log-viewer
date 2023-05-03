import { useState } from 'react'

export type PlotInputProps = {
  initialValue: string
}

export const PlotInput = ({ initialValue }: PlotInputProps) => {
  const [value, setValue] = useState(initialValue)
  return (
    <input
      className={`my-2 -ml-3 mr-2 w-full rounded-md px-3 py-1 text-xs text-grey-dark`}
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
      }}
    />
  )
}
