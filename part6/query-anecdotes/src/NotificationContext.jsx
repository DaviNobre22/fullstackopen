import { createContext, useContext, useReducer, useRef } from 'react'

// the notification state is just the message, or null when nothing is shown
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SHOW':
      return action.payload
    case 'HIDE':
      return null
    default:
      return state
  }
}

const NotificationContext = createContext()

export const NotificationContextProvider = ({ children }) => {
  const [message, dispatch] = useReducer(notificationReducer, null)
  // the timer that will hide the current message
  const hideTimeout = useRef(null)

  // shows the message for the given number of seconds; a new message replaces
  // the old one and gets its own full time
  const notify = (newMessage, seconds = 5) => {
    clearTimeout(hideTimeout.current)
    dispatch({ type: 'SHOW', payload: newMessage })
    hideTimeout.current = setTimeout(() => dispatch({ type: 'HIDE' }), seconds * 1000)
  }

  return (
    <NotificationContext.Provider value={{ message, notify }}>
      {children}
    </NotificationContext.Provider>
  )
}

// the message to show, or null
// eslint-disable-next-line react-refresh/only-export-components
export const useNotificationValue = () => useContext(NotificationContext).message

// a function for showing a message: notify('you voted ...')
// eslint-disable-next-line react-refresh/only-export-components
export const useNotify = () => useContext(NotificationContext).notify

export default NotificationContext
