import React, { useState, memo } from 'react'
import SearchHeader from 'react-storefront/search/SearchHeader'
import SearchForm from 'react-storefront/search/SearchForm'

import SearchField from 'react-storefront/search/SearchField'
import SearchDrawer from 'react-storefront/search/SearchDrawer'
import SearchButton from 'react-storefront/search/SearchButton'
import SearchSuggestions from 'react-storefront/search/SearchSuggestions'

function Search() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const toggleSearch = () => {
    setSearchOpen(!searchOpen)
    if (!mounted) {
      setMounted(true)
    }
  }

  return (
    <>
      <SearchButton onClick={toggleSearch} />
      {mounted && (
        <SearchDrawer open={searchOpen} onClose={toggleSearch}>
          <SearchForm>
            <SearchHeader>
              <SearchField />
            </SearchHeader>
            <SearchSuggestions />
          </SearchForm>
        </SearchDrawer>
      )}
    </>
  )
}

export default memo(Search)
