// SwasthiQ Frontend Tests
// Unit tests for React components

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../../src/App'

describe('SwasthiQ App Component', () => {
  test('renders SwasthiQ title', () => {
    render(<App />)
    const titleElement = screen.getByText(/SwasthiQ/i)
    expect(titleElement).toBeInTheDocument()
  })
  
  test('renders healthcare appointment management subtitle', () => {
    render(<App />)
    const subtitleElement = screen.getByText(/Modern Healthcare Appointment Management/i)
    expect(subtitleElement).toBeInTheDocument()
  })

  test('renders footer with copyright', () => {
    render(<App />)
    const footerElement = screen.getByText(/Developed by Shivangi Singh/i)
    expect(footerElement).toBeInTheDocument()
  })
})