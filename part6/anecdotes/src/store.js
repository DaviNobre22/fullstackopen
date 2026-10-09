import { create } from 'zustand'

const anecdotesAtStart = [
  'If it hurts, do it more often',
  'Adding manpower to a late software project makes it later!',
  'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
  'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
  'Premature optimization is the root of all evil.',
  'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.'
]

const getId = () => (100000 * Math.random()).toFixed(0)

const asObject = anecdote => ({
  content: anecdote,
  id: getId(),
  votes: 0
})

// the state is never changed in place: each action builds a new array,
// so Zustand (and React) can see that something changed
const useAnecdoteStore = create((set) => ({
  anecdotes: anecdotesAtStart.map(asObject),
  // the text typed in the filter; an empty filter shows every anecdote
  filter: '',
  actions: {
    setFilter: (filter) => set({ filter }),
    vote: (id) => set((state) => ({
      anecdotes: state.anecdotes.map((anecdote) =>
        anecdote.id === id ? { ...anecdote, votes: anecdote.votes + 1 } : anecdote
      ),
    })),
    add: (content) => set((state) => ({
      anecdotes: state.anecdotes.concat(asObject(content)),
    })),
  },
}))

export const useAnecdotes = () => useAnecdoteStore((state) => state.anecdotes)
export const useFilter = () => useAnecdoteStore((state) => state.filter)
// the actions never change, so components that only use them never re-render
export const useAnecdoteActions = () => useAnecdoteStore((state) => state.actions)
