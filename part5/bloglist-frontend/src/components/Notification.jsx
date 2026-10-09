import { Alert } from '@mui/material'

// shows nothing when there is no message; type is 'success' (green) or 'error' (red)
const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }

  // the className is kept so tests can find the message with .success / .error
  return (
    <Alert severity={type} className={type} sx={{ mb: 2 }}>
      {message}
    </Alert>
  )
}

export default Notification
