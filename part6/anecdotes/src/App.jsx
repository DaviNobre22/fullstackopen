import { useEffect } from 'react'
import AnecdoteForm from './components/AnecdoteForm'
import AnecdoteList from './components/AnecdoteList'
import Filter from './components/Filter'
import Notification from './components/Notification'
import { useAnecdoteActions } from './store'
import { useNotificationActions } from './notificationStore'

const App = () => {
  const { initialize } = useAnecdoteActions()
  const { notify } = useNotificationActions()

  // fetch the anecdotes from the backend once, when the app starts
  useEffect(() => {
    initialize().catch((error) => notify(error.message))
  }, [initialize, notify])

  return (
    <div>
      <h2>Anecdotes</h2>
      <Notification />
      <Filter />
      <AnecdoteList />
      <AnecdoteForm />
    </div>
  )
}

export default App
