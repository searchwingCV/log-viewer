import Tippy from '@tippyjs/react'
import React from 'react'
type TippyValueWrapper = {
  tableHeadName: string
  value: string
  children?: React.ReactNode
}

const TippyValueWrapper = ({ tableHeadName, value, children }: TippyValueWrapper) => {
  return (
    <Tippy content={`${tableHeadName}: ${value} `}>
      <div className="overflow-hidden">{children || value}</div>
    </Tippy>
  )
}

export default TippyValueWrapper
