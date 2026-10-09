import { create } from 'zustand'

// a separate store, so other parts of the app (e.g. a future login) can show notifications too
let hideTimeout = null

const useNotificationStore = create((set) => ({
  message: null,
  actions: {
    // shows the message for the given number of seconds; a new message replaces
    // the old one and gets its own full time
    notify: (message, seconds = 5) => {
      clearTimeout(hideTimeout)
      set({ message })
      hideTimeout = setTimeout(() => set({ message: null }), seconds * 1000)
    },
  },
}))

export const useNotification = () => useNotificationStore((state) => state.message)
export const useNotificationActions = () => useNotificationStore((state) => state.actions)
