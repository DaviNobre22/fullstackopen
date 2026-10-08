const Country = (props) => {
  const country = props.country
  // a few countries (e.g. Antarctica) have no capital or languages
  const capital = country.capital ? country.capital.join(', ') : 'none'
  const languages = country.languages ? Object.values(country.languages) : []

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
    </div>
  )
}

export default Country
