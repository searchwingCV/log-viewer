import '../styles/globals.css'
import 'react-tippy/dist/tippy.css'
import 'react-toastify/dist/ReactToastify.css'
import { ReactElement, ReactNode, useState } from 'react'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { appWithTranslation } from 'next-i18next'
import { NextPage } from 'next'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import {
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faEye,
  faFile,
  faCalendar,
  faUser,
  faStickyNote,
  faStopCircle,
  faSun,
  faKeyboard,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faPencil,
  faPenSquare,
  faAngleLeft,
  faAngleRight,
  faCircleXmark,
  faUndo,
  faAdd,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons'
import { createIDBPersister } from '@lib/createIDBPersister'

config.autoAddCss = false
library.add(
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faEye,
  faFile,
  faCalendar,
  faUser,
  faStickyNote,
  faStopCircle,
  faSun,
  faKeyboard,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faPencil,
  faPenSquare,
  faAngleLeft,
  faAngleRight,
  faCircleXmark,
  faUndo,
  faAdd,
  faPlusCircle,
)

export type NextPageWithLayout<Props = object> = NextPage<Props> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const persister = createIDBPersister()

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  // https://nextjs.org/docs/basic-features/layouts#with-typescript
  const getLayout = Component.getLayout ?? ((page) => page)
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient} contextSharing={false}>
      <Hydrate state={pageProps.dehydratedState}>{getLayout(<Component {...pageProps} />)}</Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default appWithTranslation(MyApp)
