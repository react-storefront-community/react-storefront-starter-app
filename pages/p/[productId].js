import { useContext, useState } from 'react'
import clsx from 'clsx'
import Head from 'next/head'
import useLazyState from 'react-storefront/hooks/useLazyState'
import Breadcrumbs from 'react-storefront/Breadcrumbs'
import CmsSlot from 'react-storefront/CmsSlot'
import MediaCarousel from 'react-storefront-amp/carousel/AmpMediaCarousel'
import PWAContext from 'react-storefront/PWAContext'
import { Container, Grid, Typography, Hidden, Button } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Row from 'react-storefront/Row'
import { Hbox } from 'react-storefront/Box'
import Label from 'react-storefront/Label'
import Rating from 'react-storefront/Rating'
import get from 'lodash/get'
import HiddenInput from 'react-storefront-amp/HiddenInput'
import fetch from 'react-storefront/fetch'
import SessionContext from 'react-storefront/session/SessionContext'
import AddToCartConfirmation from '../../components/product/AddToCartConfirmation'
import SuggestedProducts from '../../components/product/SuggestedProducts'
import Lazy from 'react-storefront/Lazy'
import TabPanel from 'react-storefront-amp/AmpTabPanel'
import Text from 'react-storefront-amp/Text'
import DataBindingProvider from 'react-storefront-amp/bind/DataBindingProvider'
import QuantitySelector from 'react-storefront-amp/AmpQuantitySelector'
import ProductOptionSelector from 'react-storefront-amp/option/AmpProductOptionSelector'
import { TrackPageView } from 'react-storefront-analytics'
import { useAmp } from 'next/amp'
import fetchFromAPI from 'react-storefront/props/fetchFromAPI'
import createLazyProps from 'react-storefront/props/createLazyProps'

const styles = theme => ({
  carousel: {
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(0, -2),
      width: '100vw',
    },
  },
  confirmation: {
    padding: '2px 0',
  },
  dockedSnack: {
    [theme.breakpoints.down('xs')]: {
      left: '0',
      bottom: '0',
      right: '0',
    },
  },
  docked: {
    [theme.breakpoints.down('xs')]: {
      fontSize: theme.typography.subtitle1.fontSize,
      padding: `${theme.spacing(2)}px`,
      position: 'fixed',
      left: 0,
      bottom: 0,
      width: '100%',
      zIndex: 10,
      borderRadius: '0',
    },
  },
  noShadow: {
    [theme.breakpoints.down('xs')]: {
      boxShadow: 'none',
    },
  },
})

const useStyles = makeStyles(styles)

const Product = React.memo(lazyProps => {
  const theme = useTheme()
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [addToCartInProgress, setAddToCartInProgress] = useState(false)
  const [state, updateState] = useLazyState(lazyProps, {
    pageData: { quantity: 1, carousel: { index: 0 }, color: { id: null } },
  })
  const classes = useStyles()
  const product = get(state, 'pageData.product') || {}
  const color = get(state, 'pageData.color', {})
  const size = get(state, 'pageData.size')
  const quantity = get(state, 'pageData.quantity')
  const { actions } = useContext(SessionContext)
  const { loading } = state

  // This is provided when <ForwardThumbnail> is wrapped around product links
  const { thumbnail } = useContext(PWAContext)

  // Adds an item to the cart
  const handleSubmit = async event => {
    event.preventDefault() // prevent the page location from changing
    setAddToCartInProgress(true) // disable the add to cart button until the request is finished

    try {
      // send the data to the server
      const { cartCount } = await fetch('/api/cart', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          color: get(color, 'id'),
          size: get(size, 'id'),
          quantity,
        }),
      }).then(res => res.json())

      // open the confirmation dialog
      setConfirmationOpen(true)

      // update the number of items in the cart in the header
      actions.updateCartCount(cartCount)
    } finally {
      // re-enable the add to cart button
      setAddToCartInProgress(false)
    }
  }

  const header = (
    <Row>
      <Typography variant="h6" component="h1" gutterBottom>
        {product ? <Text bind="product.name" /> : <Skeleton style={{ height: '1em' }} />}
      </Typography>
      <Hbox>
        <Typography style={{ marginRight: theme.spacing(2) }}>{product.priceText}</Typography>
        <Rating value={product.rating} reviewCount={10} />
      </Hbox>
    </Row>
  )

  return (
    <DataBindingProvider
      // If data is not already available in the model during SSR,
      // you can instruct the DataBindingProvider to fetch new state
      // when the `remote` URL changes.
      //
      // If no data will need to be fetched and is available in the page state
      // this property is not needed and should be removed
      remote="/api/p/{product.id}?color={color.id}"
      store={state}
      updateStore={updateState}
      root="pageData"
    >
      {useAmp() && (
        <Head>
          <script
            async
            custom-element="amp-form"
            src="https://cdn.ampproject.org/v0/amp-form-0.1.js"
          />
        </Head>
      )}
      {!loading && <TrackPageView />}
      <Breadcrumbs items={!loading && state.pageData.breadcrumbs} />
      <Container maxWidth="lg" style={{ paddingTop: theme.spacing(2) }}>
        <form onSubmit={handleSubmit} method="post" action-xhr="/api/cart">
          <Grid container spacing={4}>
            <HiddenInput name="id" bind="product.id" />
            <Grid item xs={12} sm={6} md={5}>
              <Hidden implementation="css" smUp>
                {header}
              </Hidden>
              <MediaCarousel
                className={classes.carousel}
                thumbnail={thumbnail.current}
                height="100%"
                bind={{
                  media: ['color.media', 'product.media'],
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={7}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Hidden implementation="css" xsDown>
                    <div style={{ paddingBottom: theme.spacing(1) }}>{header}</div>
                  </Hidden>
                  {product ? (
                    <>
                      <Hbox style={{ marginBottom: 10 }}>
                        <Label>COLOR: </Label>
                        <Typography>
                          <HiddenInput name="color" bind="color.id" />
                          <Text bind="color.text" />
                        </Typography>
                      </Hbox>
                      <ProductOptionSelector
                        optionProps={{
                          showLabel: false,
                        }}
                        bind={{ value: 'color', options: 'product.colors' }}
                      />
                    </>
                  ) : (
                    <div>
                      <Skeleton style={{ height: 14, marginBottom: theme.spacing(2) }}></Skeleton>
                      <Hbox>
                        <Skeleton style={{ height: 48, width: 48, marginRight: 10 }}></Skeleton>
                        <Skeleton style={{ height: 48, width: 48, marginRight: 10 }}></Skeleton>
                        <Skeleton style={{ height: 48, width: 48, marginRight: 10 }}></Skeleton>
                      </Hbox>
                    </div>
                  )}
                </Grid>
                <Grid item xs={12}>
                  {product ? (
                    <>
                      <Hbox style={{ marginBottom: 10 }}>
                        <Label>SIZE: </Label>
                        <Typography>
                          <HiddenInput name="size" bind="size.id" />
                          <Text bind="size.text" />
                        </Typography>
                      </Hbox>
                      <ProductOptionSelector bind={{ value: 'size', options: 'product.sizes' }} />
                    </>
                  ) : (
                    <div>
                      <Skeleton style={{ height: 14, marginBottom: theme.spacing(2) }}></Skeleton>
                      <Hbox>
                        <Skeleton style={{ height: 48, width: 48, marginRight: 10 }}></Skeleton>
                        <Skeleton style={{ height: 48, width: 48, marginRight: 10 }}></Skeleton>
                        <Skeleton style={{ height: 48, width: 48, marginRight: 10 }}></Skeleton>
                      </Hbox>
                    </div>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Hbox>
                    <Label>QTY:</Label>
                    <QuantitySelector bind="quantity" />
                  </Hbox>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    key="button"
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    data-th="add-to-cart"
                    className={clsx(classes.docked, classes.noShadow)}
                    disabled={addToCartInProgress}
                  >
                    Add to Cart
                  </Button>
                  <AddToCartConfirmation
                    open={confirmationOpen}
                    setOpen={setConfirmationOpen}
                    product={product}
                    color={color}
                    size={size}
                    quantity={quantity}
                    price={product.priceText}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TabPanel>
              <CmsSlot label="Description">{product.description}</CmsSlot>
              <CmsSlot label="Specs">{product.specs}</CmsSlot>
            </TabPanel>
          </Grid>
          {!useAmp() && (
            <Grid item xs={12}>
              <Lazy style={{ minHeight: 285 }}>
                <SuggestedProducts product={product} />
              </Lazy>
            </Grid>
          )}
        </form>
      </Container>
    </DataBindingProvider>
  )
})

Product.getInitialProps = createLazyProps(fetchFromAPI)

export default Product
export const config = { amp: 'hybrid' }
