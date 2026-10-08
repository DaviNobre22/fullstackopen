import axios from 'axios'
// Open-Meteo is free and needs no API key
const baseUrl = 'https://api.open-meteo.com/v1/forecast'

const getCurrent = (lat, lon) => {
  const params = {
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,wind_speed_10m,weather_code',
    wind_speed_unit: 'ms'
  }
  const request = axios.get(baseUrl, { params })
  return request.then(response => response.data.current)
}

export default { getCurrent }
