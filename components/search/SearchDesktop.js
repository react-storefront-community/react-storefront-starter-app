import React, { memo, useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Popover } from '@material-ui/core'
import SearchForm from 'react-storefront/search/SearchForm'
import SearchField from 'react-storefront/search/SearchField'
import SearchSuggestions from 'react-storefront/search/SearchSuggestions'
import SearchProvider from 'react-storefront/search/SearchProvider'

export const styles = theme => ({
  /**
   * Styles applied to the root element.
   */
  root: {
    display: 'flex',
  },
  searchinput: {
    border: '1px solid',
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5, 0, 0.5, 0),
  },
  paper: {
    boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14)',
    minWidth: theme.spacing(84),
    minHeight: theme.spacing(75),
  },
})

const useStyles = makeStyles(styles, { name: 'RSFSearchDesktop' })

function SearchDesktop({ classes }) {
  const [open, setOpen] = useState(false)
  const isFetchedRef = useRef(false)
  const myRef = useRef(null)
  classes = useStyles({ classes })

  return (
    <SearchProvider
      onFetch={() => {
        setOpen(true)
        isFetchedRef.current = true
      }}
      onClose={() => setOpen(false)}
    >
      <div ref={myRef} className={classes.root}>
        <SearchForm>
          <SearchField
            onFocus={() => {
              if (isFetchedRef.current) {
                setOpen(true)
              }
            }}
            fetchOnFirstFocus
            submitButtonVariant="none"
            showClearButton={false}
            classes={{ input: classes.searchinput }}
          />
        </SearchForm>
        <Popover
          open={open}
          disableAutoFocus
          disableEnforceFocus
          disableRestoreFocus
          disablePortal
          onClose={() => setOpen(false)}
          anchorEl={myRef.current}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            square: true,
            className: classes.paper,
          }}
        >
          <SearchSuggestions />
        </Popover>
      </div>
    </SearchProvider>
  )
}

export default memo(SearchDesktop)
