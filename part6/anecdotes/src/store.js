import { create } from 'zustand'
import anecdoteService from './services/anecdotes'

// the state is never changed in place: each action builds a new array,
// so Zustand (and React) can see that something changed
const useAnecdoteStore = create((set, get) => ({
  // empty until the anecdotes have been fetched from the backend
  anecdotes: [],
  // the text typed in the filter; an empty filter shows every anecdote
  filter: '',
  actions: {
    setFilter: (filter) => set({ filter }),

    initialize: async () => {
      const anecdotes = await anecdoteService.getAll()
      set({ anecdotes })
    },

    // returns the saved anecdote, so the caller can e.g. show it in a notification
    add: async (content) => {
      const newAnecdote = await anecdoteService.createNew(content)
      set((state) => ({ anecdotes: state.anecdotes.concat(newAnecdote) }))
      return newAnecdote
    },

    vote: async (id) => {
      const anecdote = get().anecdotes.find((a) => a.id === id)
      const updated = await anecdoteService.update({ ...anecdote, votes: anecdote.votes + 1 })
      set((state) => ({
        anecdotes: state.anecdotes.map((a) => (a.id === id ? updated : a)),
      }))
      return updated
    },

    remove: async (id) => {
      await anecdoteService.remove(id)
      set((state) => ({ anecdotes: state.anecdotes.filter((a) => a.id !== id) }))
    },
  },
}))

export const useAnecdotes = () => useAnecdoteStore((state) => state.anecdotes)
export const useFilter = () => useAnecdoteStore((state) => state.filter)
// the actions never change, so components that only use them never re-render
export const useAnecdoteActions = () => useAnecdoteStore((state) => state.actions)
