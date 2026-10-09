import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import AnecdoteList from './components/AnecdoteList'
import { useAnecdoteStore } from './store'
import anecdoteService from './services/anecdotes'

// replace the backend with fake functions; each test decides what they return
vi.mock('./services/anecdotes', () => ({
  default: {
    getAll: vi.fn(),
    createNew: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

// deliberately not sorted by votes
const backendAnecdotes = [
  { content: 'Make it work, then make it fast', id: '5', votes: 0 },
  { content: 'Real artists ship code', id: '1', votes: 7 },
  { content: 'Untested code is broken code', id: '3', votes: 3 },
  { content: 'Simplicity is the ultimate sophistication', id: '2', votes: 5 },
  { content: 'There are two hard things in computer science', id: '4', votes: 1 },
]

const actions = () => useAnecdoteStore.getState().actions

// the anecdote texts in the order AnecdoteList shows them
const shownContents = (container) =>
  [...container.firstChild.children].map((item) => item.firstChild.textContent)

beforeEach(() => {
  // every test starts from an empty store and fresh fake functions
  useAnecdoteStore.setState({ anecdotes: [], filter: '' })
  vi.clearAllMocks()
  anecdoteService.getAll.mockResolvedValue(backendAnecdotes)
})

describe('anecdote store', () => {
  // 6.12
  it('is initialized with the anecdotes returned by the backend', async () => {
    await actions().initialize()

    expect(anecdoteService.getAll).toHaveBeenCalledTimes(1)
    expect(useAnecdoteStore.getState().anecdotes).toEqual(backendAnecdotes)
  })

  // 6.15
  it('voting increases the votes of the anecdote by one', async () => {
    await actions().initialize()
    const anecdote = backendAnecdotes.find((a) => a.id === '3')
    anecdoteService.update.mockImplementation(async (updated) => updated)

    await actions().vote('3')

    // the backend got the anecdote with one more vote
    expect(anecdoteService.update).toHaveBeenCalledWith({ ...anecdote, votes: 4 })

    const anecdotes = useAnecdoteStore.getState().anecdotes
    expect(anecdotes.find((a) => a.id === '3').votes).toBe(4)
    // the other anecdotes keep their votes
    expect(anecdotes.find((a) => a.id === '2').votes).toBe(5)
  })
})

describe('<AnecdoteList />', () => {
  // 6.13
  it('receives the anecdotes from the store sorted by votes', async () => {
    await actions().initialize()

    const { container } = render(<AnecdoteList />)

    expect(shownContents(container)).toEqual([
      'Real artists ship code',
      'Simplicity is the ultimate sophistication',
      'Untested code is broken code',
      'There are two hard things in computer science',
      'Make it work, then make it fast',
    ])
  })

  // 6.14
  it('receives only the anecdotes matching the filter, still sorted by votes', async () => {
    await actions().initialize()
    actions().setFilter('CODE')

    const { container } = render(<AnecdoteList />)

    expect(shownContents(container)).toEqual([
      'Real artists ship code',
      'Untested code is broken code',
    ])
  })
})
