import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheets } from '@material-ui/core/styles'
import theme from '../components/theme'
import renderAmp from 'react-storefront-amp/renderAmp'

class MyDocument extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          <meta charSet="utf-8" />
          {/* <meta
            key="viewport"
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
          /> */}
          {/* PWA primary color */}
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link rel="preconnect" href="https://opt.moovweb.net" crossorigin />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}

MyDocument.getInitialProps = async ctx => {
  const isAmp = ctx.req.url.includes('amp=1')

  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets()
  const originalRenderPage = ctx.renderPage

  ctx.res.setHeader('service-worker-allowed', '/')

  ctx.renderPage = async () => {
    const document = originalRenderPage({
      enhanceApp: App => props => sheets.collect(<App {...props} />),
    })

    return isAmp ? await renderAmp(document, sheets) : document
  }

  const initialProps = await Document.getInitialProps(ctx)

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: (
      <>
        {initialProps.styles}
        {isAmp ? (
          <style
            dangerouslySetInnerHTML={{
              __html: initialProps.head.find(item => item.key === 'amp-custom').props['amp-custom'],
            }}
          />
        ) : (
          sheets.getStyleElement()
        )}
      </>
    ),
  }
}

export default MyDocument
