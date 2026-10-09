import axios from 'axios'
const baseUrl = '/api/blogs'

// "Bearer <token>" of the logged-in user, sent with requests that need a login
let token = null

const setToken = (newToken) => {
  token = newToken ? `Bearer ${newToken}` : null
}

const authConfig = () => ({
  headers: { Authorization: token },
})

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const create = async (newBlog) => {
  const response = await axios.post(baseUrl, newBlog, authConfig())
  return response.data
}

const update = async (id, updatedBlog) => {
  const response = await axios.put(`${baseUrl}/${id}`, updatedBlog)
  return response.data
}

// "delete" is a reserved word, so this is called remove
const remove = async (id) => {
  await axios.delete(`${baseUrl}/${id}`, authConfig())
}

export default { getAll, create, update, remove, setToken }
