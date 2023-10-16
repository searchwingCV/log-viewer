import '../styles/globals.css'
import 'tippy.js/dist/tippy.css'
import 'react-toastify/dist/ReactToastify.css'
import type { ReactElement, ReactNode } from 'react'
import { useState } from 'react'
import type { AppProps } from 'next/app'
import {
  QueryClient,
  QueryClientProvider,
  Hydrate,
  type DehydratedState,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import type { NextPage } from 'next'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { ContextProvider } from '@lib/Context/ContextProvider'

const { library, config } = require('@fortawesome/fontawesome-svg-core')
config.autoAddCss = false
library.add(far, fas, fab)

export type NextPageWithLayout<Props = object> = NextPage<Props> & {
  getLayout?: (page: ReactElement) => ReactNode
}

function MyApp({
  Component,
  pageProps,
}: AppProps<{ dehydratedState: DehydratedState }> & {
  Component: NextPageWithLayout
}) {
  // Use the layout defined at the page level, if available
  // https://nextjs.org/docs/basic-features/layouts#with-typescript
  const getLayout = Component.getLayout ?? ((page) => page)
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient} contextSharing={false}>
      <Hydrate state={pageProps.dehydratedState}>
        <ContextProvider>{getLayout(<Component {...pageProps} />)}</ContextProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default MyApp
