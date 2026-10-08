import { useState, useEffect } from 'react'
import countryService from './services/countries'
import Countries from './components/Countries'
import Country from './components/Country'

const App = () => {
  const [countries, setCountries] = useState([])
  const [query, setQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)

  // fetch all countries once, then filter them in the browser
  useEffect(() => {
    countryService
      .getAll()
      .then(allCountries => {
        setCountries(allCountries)
      })
  }, [])

  const handleQueryChange = (event) => {
    setQuery(event.target.value)
    // typing a new search goes back to the search results
    setSelectedCountry(null)
  }

  // case insensitive: "fin" also matches "Finland"
  const countriesToShow = countries.filter(country =>
    country.name.common.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <div>
        find countries <input value={query} onChange={handleQueryChange} />
      </div>
      {selectedCountry
        ? <Country country={selectedCountry} />
        : query && <Countries countries={countriesToShow} onShow={setSelectedCountry} />
      }
    </div>
  )
}

export default App
