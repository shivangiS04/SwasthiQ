import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Mock fetch for tests that don't explicitly mock it
global.fetch = jest.fn()

// Reset fetch mock before each test
beforeEach(() => {
  fetch.mockClear()
})