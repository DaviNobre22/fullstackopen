// the JSON Server backend: start it with "npm run server"
const baseUrl = 'http://localhost:3001/anecdotes'

// fetch() does not throw for responses like 404 or 500, so check them here
const checkResponse = (response, action) => {
  if (!response.ok) {
    throw new Error(`Failed to ${action}: ${response.status} ${response.statusText}`)
  }
}

const getAll = async () => {
  const response = await fetch(baseUrl)
  checkResponse(response, 'fetch anecdotes')
  return await response.json()
}

const createNew = async (content) => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // no id: the backend creates one
    body: JSON.stringify({ content, votes: 0 }),
  })
  checkResponse(response, 'create anecdote')
  return await response.json()
}

const update = async (anecdote) => {
  const response = await fetch(`${baseUrl}/${anecdote.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(anecdote),
  })
  checkResponse(response, 'update anecdote')
  return await response.json()
}

const remove = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`, { method: 'DELETE' })
  checkResponse(response, 'delete anecdote')
}

export default { getAll, createNew, update, remove }
