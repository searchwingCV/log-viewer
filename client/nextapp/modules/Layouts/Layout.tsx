import { ReactNode } from 'react'
import HeaderNavigation from '../HeaderNavigation'

export type Props = { children: ReactNode; isHeaderMinimalist?: boolean }

export const Layout = ({ children, isHeaderMinimalist }: Props) => {
  return (
    <>
      <div
        className={`flex
                    min-h-screen
                    flex-col`}
      >
        <HeaderNavigation isHeaderMinimalist={isHeaderMinimalist} />{' '}
        <main
          className={`
                      min-h-screen
                      w-full
                      bg-grey-light
                    `}
        >
          {children}
        </main>
      </div>
    </>
  )
}
