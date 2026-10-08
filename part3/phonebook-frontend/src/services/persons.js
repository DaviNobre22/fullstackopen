import axios from 'axios'
// relative URL: in development Vite forwards /api to the backend (see vite.config.js)
const baseUrl = '/api/persons'

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = newObject => {
  const request = axios.post(baseUrl, newObject)
  return request.then(response => response.data)
}

const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}

// "delete" is a reserved word, so this is called remove
const remove = id => {
  return axios.delete(`${baseUrl}/${id}`)
}

export default { getAll, create, update, remove }
