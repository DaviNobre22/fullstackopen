import axios from 'axios'
const baseUrl = '/api/login'

// returns { token, username, name } when the username and password are right
const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login }
