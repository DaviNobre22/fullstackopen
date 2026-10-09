import { useAnecdotes, useFilter, useAnecdoteActions } from '../store'
import { useNotificationActions } from '../notificationStore'

const AnecdoteList = () => {
  const anecdotes = useAnecdotes()
  const filter = useFilter()
  const { vote, remove } = useAnecdoteActions()
  const { notify } = useNotificationActions()

  // only the anecdotes containing the filter text (ignoring case), most votes first.
  // filter() and toSorted() both return new arrays, so the store's array is not changed
  const anecdotesToShow = anecdotes
    .filter((anecdote) => anecdote.content.toLowerCase().includes(filter.toLowerCase()))
    .toSorted((a, b) => b.votes - a.votes)

  const handleVote = async (anecdote) => {
    try {
      await vote(anecdote.id)
      notify(`you voted '${anecdote.content}'`)
    } catch (error) {
      notify(error.message)
    }
  }

  const handleDelete = async (anecdote) => {
    try {
      await remove(anecdote.id)
      notify(`you deleted '${anecdote.content}'`)
    } catch (error) {
      notify(error.message)
    }
  }

  return (
    <div>
      {anecdotesToShow.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
            {/* only anecdotes nobody has voted for can be deleted */}
            {anecdote.votes === 0 && (
              <button onClick={() => handleDelete(anecdote)}>delete</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AnecdoteList
