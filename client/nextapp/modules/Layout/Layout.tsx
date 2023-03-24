import { ReactNode } from 'react'
import Header from '~/modules/Header'

export type Props = { children: ReactNode }

export const Layout = ({ children }: Props) => {
  return (
    <>
      <div
        className={`flex-column
                    flex
                    min-h-screen`}
      >
        <Header />
        <main
          className={`
                      min-h-screen
                      w-full
                      bg-grey-light
                      px-8
                    `}
        >
          {children}
        </main>
      </div>
    </>
  )
}
