import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { resetServerContext } from 'react-beautiful-dnd'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    resetServerContext()

    return {
      ...initialProps,
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,800;1,900&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body id="tailwind-id">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
