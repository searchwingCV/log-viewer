/*
  Very simple Header Nav that leads user to tables
*/
import React from 'react'
import clsx from 'clsx'
import Link from 'modules/Link'

const navItems = [
  { name: 'FLIGHT TABLE', url: '/flight-overview/' },
  { name: 'MISSION TABLE', url: '/mission-overview/' },
  { name: 'DRONE TABLE', url: '/drone-overview/' },
]

export type HeaderNavigationProps = {
  isHeaderMinimalist?: boolean
}

export const HeaderNavigation = ({ isHeaderMinimalist }: HeaderNavigationProps) => {
  return (
    <nav
      className={clsx(
        `fixed
          right-0
          left-0
          z-10
          flex
          flex-col
          flex-wrap
          items-center
          py-1
          pl-2`,
        isHeaderMinimalist
          ? `justify-end
             bg-transparent
             text-primary-black`
          : `justify-between
             bg-primary-light-petrol
             text-primary-white`,
      )}
    >
      <div
        className={`container
                    mx-auto
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    pl-4`}
      >
        {!isHeaderMinimalist ? (
          <Link
            className={`mr-4
                        inline-block
                        whitespace-nowrap
                        py-2
                        text-sm
                        font-bold
                        uppercase
                        leading-relaxed
                        text-inherit
                        text-white`}
            href="/"
          >
            Log Viewer
          </Link>
        ) : null}
        <ul
          className={`flex
                      list-none
                      flex-col
                      pr-8
                      lg:ml-auto
                      lg:flex-row`}
        >
          {navItems.map((item) => (
            <li
              key={item.name}
              className={clsx(
                `nav-item
                 flex
                 w-[150px]
                 justify-end
                 text-inherit`,
                isHeaderMinimalist ? `text-primary-black` : `text-primary-white`,
              )}
            >
              <Link href={item.url} isWhite={!isHeaderMinimalist}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
