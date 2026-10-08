import Country from './Country'

const Countries = (props) => {
  const countries = props.countries

  if (countries.length > 10) {
    return <div>Too many matches, specify another filter</div>
  }

  if (countries.length === 1) {
    return <Country country={countries[0]} />
  }

  return (
    <div>
      {countries.map(country =>
        <div key={country.cca3}>
          {country.name.common}{' '}
          <button onClick={() => props.onShow(country)}>show</button>
        </div>
      )}
    </div>
  )
}

export default Countries
