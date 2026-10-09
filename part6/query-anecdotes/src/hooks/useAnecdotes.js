import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAnecdotes, createAnecdote, updateAnecdote } from '../requests'

// all the TanStack Query details in one place: components only see
// the anecdotes, the query's status, and functions to add and vote
export const useAnecdotes = () => {
  const queryClient = useQueryClient()

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    // try only once more if the request fails, so the error page appears quickly
    retry: 1,
    // do not refetch when the browser window gets focus again
    refetchOnWindowFocus: false,
  })

  const newAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (newAnecdote) => {
      // add the saved anecdote to the cached list, so it shows without a new request
      const anecdotes = queryClient.getQueryData(['anecdotes'])
      queryClient.setQueryData(['anecdotes'], anecdotes.concat(newAnecdote))
    },
  })

  const voteMutation = useMutation({
    mutationFn: updateAnecdote,
    onSuccess: (updatedAnecdote) => {
      // replace the voted anecdote in the cached list with the one the server returned
      const anecdotes = queryClient.getQueryData(['anecdotes'])
      queryClient.setQueryData(
        ['anecdotes'],
        anecdotes.map((a) => (a.id === updatedAnecdote.id ? updatedAnecdote : a))
      )
    },
  })

  return {
    anecdotes: result.data,
    isPending: result.isPending,
    isError: result.isError,
    // options can contain onSuccess / onError callbacks for this one call
    addAnecdote: (content, options) => newAnecdoteMutation.mutate(content, options),
    voteAnecdote: (anecdote, options) =>
      voteMutation.mutate({ ...anecdote, votes: anecdote.votes + 1 }, options),
  }
}
