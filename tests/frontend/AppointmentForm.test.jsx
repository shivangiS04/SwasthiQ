import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppointmentForm from '../../src/components/AppointmentForm'

// Mock functions
const mockOnClose = jest.fn()
const mockOnSubmit = jest.fn()

describe('AppointmentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders form when isOpen is true', () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.getByText('New Appointment')).toBeInTheDocument()
    expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/doctor name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mode/i)).toBeInTheDocument()
  })

  test('does not render form when isOpen is false', () => {
    render(
      <AppointmentForm
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.queryByText('New Appointment')).not.toBeInTheDocument()
  })

  test('calls onClose when close button is clicked', () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('calls onClose when cancel button is clicked', () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('validates required fields', async () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    // Try to submit empty form
    fireEvent.click(screen.getByText('Create Appointment'))

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Patient name is required')).toBeInTheDocument()
      expect(screen.getByText('Date is required')).toBeInTheDocument()
      expect(screen.getByText('Time is required')).toBeInTheDocument()
      expect(screen.getByText('Doctor name is required')).toBeInTheDocument()
    })

    // onSubmit should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  test('validates patient name length', async () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    const patientNameInput = screen.getByLabelText(/patient name/i)
    
    // Test too short name
    fireEvent.change(patientNameInput, { target: { value: 'A' } })
    fireEvent.blur(patientNameInput)

    await waitFor(() => {
      expect(screen.getByText('Patient name must be at least 2 characters')).toBeInTheDocument()
    })
  })

  test('validates date is not in the past', async () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    const dateInput = screen.getByLabelText(/date/i)
    
    // Set date to yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toISOString().split('T')[0]
    
    fireEvent.change(dateInput, { target: { value: yesterdayString } })
    fireEvent.blur(dateInput)

    await waitFor(() => {
      expect(screen.getByText('Date cannot be in the past')).toBeInTheDocument()
    })
  })

  test('validates time is within business hours', async () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    const timeInput = screen.getByLabelText(/time/i)
    
    // Test time before 8 AM
    fireEvent.change(timeInput, { target: { value: '07:00' } })
    fireEvent.blur(timeInput)

    await waitFor(() => {
      expect(screen.getByText('Time must be between 8:00 AM and 6:00 PM')).toBeInTheDocument()
    })

    // Test time after 6 PM
    fireEvent.change(timeInput, { target: { value: '19:00' } })
    fireEvent.blur(timeInput)

    await waitFor(() => {
      expect(screen.getByText('Time must be between 8:00 AM and 6:00 PM')).toBeInTheDocument()
    })
  })

  test('validates duration constraints', async () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    const durationInput = screen.getByLabelText(/duration/i)
    
    // Test duration too short
    fireEvent.change(durationInput, { target: { value: '10' } })
    fireEvent.blur(durationInput)

    await waitFor(() => {
      expect(screen.getByText('Duration must be at least 15 minutes')).toBeInTheDocument()
    })

    // Test duration too long
    fireEvent.change(durationInput, { target: { value: '500' } })
    fireEvent.blur(durationInput)

    await waitFor(() => {
      expect(screen.getByText('Duration cannot exceed 8 hours')).toBeInTheDocument()
    })
  })

  test('submits form with valid data', async () => {
    mockOnSubmit.mockResolvedValue()

    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    // Fill out the form with valid data
    fireEvent.change(screen.getByLabelText(/patient name/i), { 
      target: { value: 'John Smith' } 
    })
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowString = tomorrow.toISOString().split('T')[0]
    
    fireEvent.change(screen.getByLabelText(/date/i), { 
      target: { value: tomorrowString } 
    })
    
    fireEvent.change(screen.getByLabelText(/time/i), { 
      target: { value: '10:00' } 
    })
    
    fireEvent.change(screen.getByLabelText(/duration/i), { 
      target: { value: '30' } 
    })
    
    fireEvent.change(screen.getByLabelText(/doctor name/i), { 
      target: { value: 'Dr. Sarah Johnson' } 
    })
    
    fireEvent.change(screen.getByLabelText(/mode/i), { 
      target: { value: 'Virtual' } 
    })

    // Submit the form
    fireEvent.click(screen.getByText('Create Appointment'))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        patient_name: 'John Smith',
        date: tomorrowString,
        time: '10:00',
        duration: 30,
        doctor_name: 'Dr. Sarah Johnson',
        mode: 'Virtual',
        status: 'Scheduled'
      })
    })
  })

  test('shows loading state when isSubmitting is true', () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    )

    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  test('clears errors when user starts typing', async () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    const patientNameInput = screen.getByLabelText(/patient name/i)
    
    // Trigger validation error
    fireEvent.blur(patientNameInput)
    
    await waitFor(() => {
      expect(screen.getByText('Patient name is required')).toBeInTheDocument()
    })

    // Start typing to clear error
    fireEvent.change(patientNameInput, { target: { value: 'J' } })
    
    await waitFor(() => {
      expect(screen.queryByText('Patient name is required')).not.toBeInTheDocument()
    })
  })

  test('generates time slots correctly', () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    const timeSelect = screen.getByLabelText(/time/i)
    
    // Check if time slots are generated (8:00 AM to 6:00 PM in 15-minute intervals)
    expect(timeSelect).toBeInTheDocument()
    
    // Check for some specific time slots
    fireEvent.click(timeSelect)
    expect(screen.getByDisplayValue('')).toBeInTheDocument() // Default empty option
  })

  test('has correct default values', () => {
    render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.getByDisplayValue('30')).toBeInTheDocument() // Default duration
    expect(screen.getByDisplayValue('In-person')).toBeInTheDocument() // Default mode
  })

  test('resets form when closed and reopened', () => {
    const { rerender } = render(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    // Fill out some fields
    fireEvent.change(screen.getByLabelText(/patient name/i), { 
      target: { value: 'John Smith' } 
    })

    // Close form
    rerender(
      <AppointmentForm
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    // Reopen form
    rerender(
      <AppointmentForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    // Check if form is reset
    expect(screen.getByLabelText(/patient name/i)).toHaveValue('')
  })
})