import { useState, useEffect } from 'react'
import weatherService from '../services/weather'

// Open-Meteo returns a WMO weather code instead of an icon
const describe = (code) => {
  if (code === 0) return { icon: '☀️', text: 'clear sky' }
  if (code <= 2) return { icon: '🌤️', text: 'partly cloudy' }
  if (code === 3) return { icon: '☁️', text: 'overcast' }
  if (code <= 48) return { icon: '🌫️', text: 'fog' }
  if (code <= 57) return { icon: '🌦️', text: 'drizzle' }
  if (code <= 67) return { icon: '🌧️', text: 'rain' }
  if (code <= 77) return { icon: '❄️', text: 'snow' }
  if (code <= 82) return { icon: '🌧️', text: 'rain showers' }
  if (code <= 86) return { icon: '🌨️', text: 'snow showers' }
  return { icon: '⛈️', text: 'thunderstorm' }
}

const Weather = (props) => {
  const [weather, setWeather] = useState(null)
  const [lat, lon] = props.latlng

  // fetch again whenever a different capital is shown
  useEffect(() => {
    weatherService
      .getCurrent(lat, lon)
      .then(current => {
        setWeather(current)
      })
  }, [lat, lon])

  if (weather === null) {
    return null
  }

  const { icon, text } = describe(weather.weather_code)

  return (
    <div>
      <h2>Weather in {props.capital}</h2>
      <div>Temperature {weather.temperature_2m} Celsius</div>
      <div style={{ fontSize: 64 }} title={text}>{icon}</div>
      <div>{text}</div>
      <div>Wind {weather.wind_speed_10m} m/s</div>
    </div>
  )
}

export default Weather
