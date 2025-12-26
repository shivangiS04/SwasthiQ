// Frontend test file
// Unit tests for React components will be implemented here

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../../src/App'

describe('App Component', () => {
  test('renders EMR title', () => {
    render(<App />)
    const titleElement = screen.getByText(/EMR Appointment Management System/i)
    expect(titleElement).toBeInTheDocument()
  })
  
  test('renders healthcare provider dashboard subtitle', () => {
    render(<App />)
    const subtitleElement = screen.getByText(/Healthcare Provider Dashboard/i)
    expect(subtitleElement).toBeInTheDocument()
  })
})