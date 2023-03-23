import { GetStaticProps } from 'next'

import { Layout } from 'modules/Layout/Layout'

const Index = ({}) => {
  return (
    <>
      <Layout>Welcome to the log viewer dashboard</Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale, preview, previewData }) => {
  return {
    props: {},
    revalidate: 60 * 15, //15m
  }
}

export default Index
