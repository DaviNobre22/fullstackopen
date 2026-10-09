import { useNotificationValue } from '../NotificationContext'

const Notification = () => {
  const message = useNotificationValue()

  const style = {
    border: "solid",
    padding: 10,
    borderWidth: 1,
    marginBottom: 5,
  }

  // nothing at all on the page when there is no message
  if (message === null) return null

  return <div data-testid="notification" style={style}>{message}</div>
}

export default Notification
