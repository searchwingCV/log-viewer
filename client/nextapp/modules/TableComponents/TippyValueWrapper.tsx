import Tippy from '@tippyjs/react'
import { ReactNode } from 'react'

type TippyValueWrapper = {
  tableHeadName: string
  children: ReactNode
}

export const TippyValueWrapper = ({ tableHeadName, children }: TippyValueWrapper) => {
  return (
    <Tippy content={tableHeadName}>
      <div>{children}</div>
    </Tippy>
  )
}
