import Tippy from '@tippyjs/react'
import type { ReactNode } from 'react'

type TippyValueWrapper = {
  tableHeadName: string
  children: ReactNode
}

const TippyValueWrapper = ({ tableHeadName, children }: TippyValueWrapper) => {
  return (
    <Tippy content={tableHeadName}>
      <div>{children}</div>
    </Tippy>
  )
}

export default TippyValueWrapper
