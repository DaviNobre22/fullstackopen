import Weather from './Weather'

const Country = (props) => {
  const country = props.country
  // a few countries (e.g. Antarctica) have no capital or languages
  const capital = country.capital ? country.capital.join(', ') : 'none'
  const languages = country.languages ? Object.values(country.languages) : []
  const capitalLatlng = country.capitalInfo && country.capitalInfo.latlng

  return (
    <div>
      <h1>{country.name.common}</h1>
      <div>Capital {capital}</div>
      <div>Area {country.area}</div>

      <h2>Languages</h2>
      <ul>
        {languages.map(language =>
          <li key={language}>{language}</li>
        )}
      </ul>

      <img src={country.flags.png} alt={country.flags.alt} width="200" />

      {country.capital && capitalLatlng &&
        <Weather capital={country.capital[0]} latlng={capitalLatlng} />
      }
    </div>
  )
}

export default Country
