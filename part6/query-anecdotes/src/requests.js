// the backend from server.js: start it with "npm run server"
const baseUrl = 'http://localhost:3001/anecdotes'

// fetch() does not throw for responses like 400 or 500, so do it here;
// TanStack Query then sees the request as failed
const checkResponse = async (response) => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `${response.status} ${response.statusText}`)
  }
}

export const getAnecdotes = async () => {
  const response = await fetch(baseUrl)
  await checkResponse(response)
  return await response.json()
}

export const createAnecdote = async (content) => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // the server adds the id and votes: 0, and rejects content shorter than 5 characters
    body: JSON.stringify({ content }),
  })
  await checkResponse(response)
  return await response.json()
}

export const updateAnecdote = async (anecdote) => {
  const response = await fetch(`${baseUrl}/${anecdote.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(anecdote),
  })
  await checkResponse(response)
  return await response.json()
}
