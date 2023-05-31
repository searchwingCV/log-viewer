import React, { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useAsyncDebounce } from 'react-table'
import Input from 'modules/Input'

export type GlobalTextFilterProps = {
  globalFilter: string
  setGlobalFilter: (filterValue: string) => void
}
export const GlobalTextFilter = ({ globalFilter, setGlobalFilter }: GlobalTextFilterProps) => {
  const { t } = useTranslation()
  const [value, setValue] = useState(globalFilter)
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <Input
      name="global-filter"
      defaultValue={value || ''}
      onChangeInput={(val: string) => {
        setValue(val)
        onChange(val)
      }}
      placeholder={t(`Search`)}
      hasResetButton={true}
    />
  )
}
