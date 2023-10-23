/*
  Currently the user is immediately redirected to the flights view
*/
import type { GetStaticProps } from 'next'
import { Layout } from '@modules/Layouts'

const Index = ({}) => {
  return (
    <>
      <Layout>
        <div
          className={`flex
                      h-screen
                      w-screen
                      items-center
                      justify-center
                      text-xl`}
        >
          {`Welcome to SearchWing's log viewer`}
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = ({}) => {
  return {
    props: {},
    revalidate: 60 * 15, //15m
  }
}

export default Index
