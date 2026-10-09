import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
// adds matchers like expect(element).toBeVisible() and .toHaveTextContent()
import '@testing-library/jest-dom/vitest'

// remove the rendered components after each test, so tests do not affect each other
afterEach(() => {
  cleanup()
})
