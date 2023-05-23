import { type ReactNode } from 'react'
import HeaderNavigation from '../HeaderNavigation'

export type LayoutProps = { children: ReactNode; isHeaderMinimalist?: boolean }

export const Layout = ({ children, isHeaderMinimalist }: LayoutProps) => {
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
