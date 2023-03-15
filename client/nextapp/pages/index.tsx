// import getConfig from 'next/config'
// const { publicRuntimeConfig: config } = getConfig()
// console.log('config:', JSON.stringify(config))
import { GetStaticProps } from 'next'

import { Layout } from 'modules/Layout/Layout'

const Index = ({}) => {
  return (
    <>
      <Layout>hello hello hello djdhjhjd kjdjkbds</Layout>
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
