import { create } from 'zustand'

// the feedback counts, and the actions that change them.
// set() merges the returned object into the state, so only the changed count is given
const useFeedbackStore = create((set) => ({
  good: 0,
  neutral: 0,
  bad: 0,
  actions: {
    addGood: () => set((state) => ({ good: state.good + 1 })),
    addNeutral: () => set((state) => ({ neutral: state.neutral + 1 })),
    addBad: () => set((state) => ({ bad: state.bad + 1 })),
  },
}))

// each hook reads only one value, so a component re-renders only when that value changes
export const useGood = () => useFeedbackStore((state) => state.good)
export const useNeutral = () => useFeedbackStore((state) => state.neutral)
export const useBad = () => useFeedbackStore((state) => state.bad)
// the actions never change, so components that only use them never re-render
export const useFeedbackActions = () => useFeedbackStore((state) => state.actions)
