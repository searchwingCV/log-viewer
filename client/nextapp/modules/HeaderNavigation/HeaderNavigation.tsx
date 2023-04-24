import React from 'react'
import Link from 'modules/Link'

const navItems = [
  { name: 'FLIGHT TABLE', url: '/flight-overview/' },
  { name: 'MISSION TABLE', url: '/mission-overview/' },
  { name: 'DRONE TABLE', url: '/drone-overview/' },
]

export const HeaderNavigation = () => {
  const [navbarOpen, setNavbarOpen] = React.useState(false)
  return (
    <nav className="fixed right-0 left-0 z-10 flex flex-wrap items-center justify-between bg-primary-light-petrol py-3 pl-2">
      <div className="container mx-auto flex flex-wrap items-center justify-between pl-4">
        <div className="relative flex w-full justify-between lg:static lg:block lg:w-auto lg:justify-start">
          <a
            className="mr-4 inline-block whitespace-nowrap py-2 text-sm font-bold uppercase leading-relaxed text-primary-white"
            href="/"
          >
            Log Viewer
          </a>
          <button
            className="text-white block cursor-pointer rounded border border-solid border-transparent bg-transparent py-1 pl-3 text-xl leading-none outline-none focus:outline-none lg:hidden"
            type="button"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
        <div
          className={'flex-grow items-center pr-8 lg:flex' + (navbarOpen ? ' flex' : ' hidden')}
          id="example-navbar-danger"
        >
          <ul className="flex list-none flex-col lg:ml-auto lg:flex-row">
            {navItems.map((item) => (
              <li className="nav-item flex w-[150px] justify-end">
                <Link href={item.url} isWhite>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
