import { useAnecdoteActions } from '../store'

// an uncontrolled form: the input keeps its own value, which is read when the form is sent
const AnecdoteForm = () => {
  const { add } = useAnecdoteActions()

  const addAnecdote = (event) => {
    event.preventDefault()
    const content = event.target.anecdote.value
    event.target.anecdote.value = ''
    add(content)
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={addAnecdote}>
        <div>
          <input name="anecdote" data-testid="new" />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
