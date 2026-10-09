import { useNotification } from '../notificationStore'

const Notification = () => {
  const message = useNotification()

  // nothing at all on the page when there is no message
  if (message === null) {
    return null
  }

  const style = {
    border: 'solid',
    padding: 10,
    borderWidth: 1,
    marginBottom: 10
  }

  return (
    <div style={style} data-testid="notification">
      {message}
    </div>
  )
}

export default Notification
