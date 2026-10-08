import { useState, useEffect } from 'react'
import countryService from './services/countries'
import Countries from './components/Countries'

const App = () => {
  const [countries, setCountries] = useState([])
  const [query, setQuery] = useState('')

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
      {query && <Countries countries={countriesToShow} />}
    </div>
  )
}

export default App
