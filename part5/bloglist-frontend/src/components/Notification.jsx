// shows nothing when there is no message; type is 'success' (green) or 'error' (red)
const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }

  return <div className={type}>{message}</div>
}

export default Notification
