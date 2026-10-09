import { useAnecdotes } from '../hooks/useAnecdotes'

const AnecdoteForm = () => {
  const { addAnecdote } = useAnecdotes()

  const onCreate = (event) => {
    event.preventDefault()
    const form = event.target
    const content = form.anecdote.value

    // clear the form only when the server has saved the anecdote
    addAnecdote(content, {
      onSuccess: () => form.reset(),
    })
  }

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input name="anecdote" />
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
