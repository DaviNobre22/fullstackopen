import { useAnecdoteActions } from '../store'
import { useNotificationActions } from '../notificationStore'

// an uncontrolled form: the input keeps its own value, which is read when the form is sent
const AnecdoteForm = () => {
  const { add } = useAnecdoteActions()
  const { notify } = useNotificationActions()

  const addAnecdote = async (event) => {
    event.preventDefault()
    const input = event.target.anecdote
    const content = input.value

    try {
      await add(content)
      input.value = ''
      notify(`you created '${content}'`)
    } catch (error) {
      notify(error.message)
    }
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
