import { ReactNode } from 'react'
import Header from '~/modules/Header'
import HeaderNavigation from '../HeaderNavigation'

export type Props = { children: ReactNode }

export const Layout = ({ children }: Props) => {
  return (
    <>
      <div
        className={`flex
                    min-h-screen
                    flex-col`}
      >
        <HeaderNavigation />{' '}
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
