import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppointmentCard from '../../src/components/AppointmentCard'

// Mock appointment data
const mockAppointment = {
  id: 'apt_001',
  patient_name: 'John Smith',
  date: '2024-12-27',
  time: '09:00',
  duration: 30,
  doctor_name: 'Dr. Sarah Johnson',
  status: 'Confirmed',
  mode: 'In-person'
}

// Mock functions
const mockOnStatusUpdate = jest.fn()
const mockOnDelete = jest.fn()

// Mock window.confirm
global.confirm = jest.fn()

describe('AppointmentCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders appointment information correctly', () => {
    render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Check if all appointment details are displayed
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('In-person')).toBeInTheDocument()
    expect(screen.getByText(/30min/)).toBeInTheDocument()
  })

  test('displays correct status color for different statuses', () => {
    const { rerender } = render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Test Confirmed status
    expect(screen.getByText('Confirmed')).toHaveClass('bg-green-100', 'text-green-800')

    // Test Scheduled status
    rerender(
      <AppointmentCard
        appointment={{ ...mockAppointment, status: 'Scheduled' }}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Scheduled')).toHaveClass('bg-blue-100', 'text-blue-800')

    // Test Cancelled status
    rerender(
      <AppointmentCard
        appointment={{ ...mockAppointment, status: 'Cancelled' }}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Cancelled')).toHaveClass('bg-red-100', 'text-red-800')
  })

  test('displays correct mode icon for different modes', () => {
    const { rerender } = render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Test In-person mode (MapPin icon)
    expect(screen.getByText('In-person')).toBeInTheDocument()

    // Test Virtual mode
    rerender(
      <AppointmentCard
        appointment={{ ...mockAppointment, mode: 'Virtual' }}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Virtual')).toBeInTheDocument()

    // Test Phone mode
    rerender(
      <AppointmentCard
        appointment={{ ...mockAppointment, mode: 'Phone' }}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Phone')).toBeInTheDocument()
  })

  test('formats date and time correctly', () => {
    render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Check if date is formatted correctly (should show as "Fri, Dec 27, 2024")
    expect(screen.getByText(/Dec 27, 2024/)).toBeInTheDocument()
    
    // Check if time is formatted correctly (should show as "9:00 AM")
    expect(screen.getByText(/9:00 AM/)).toBeInTheDocument()
  })

  test('enters edit mode when Update Status button is clicked', () => {
    render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Click Update Status button
    fireEvent.click(screen.getByText('Update Status'))

    // Check if edit mode is active (select dropdown should be visible)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Confirmed')).toBeInTheDocument()
  })

  test('calls onStatusUpdate when status is changed and saved', async () => {
    render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Enter edit mode
    fireEvent.click(screen.getByText('Update Status'))

    // Change status
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Scheduled' } })

    // Save changes
    fireEvent.click(screen.getByRole('button', { name: /check/i }))

    // Wait for the async operation
    await waitFor(() => {
      expect(mockOnStatusUpdate).toHaveBeenCalledWith('apt_001', 'Scheduled')
    })
  })

  test('cancels edit mode when cancel button is clicked', () => {
    render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Enter edit mode
    fireEvent.click(screen.getByText('Update Status'))

    // Change status
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Scheduled' } })

    // Cancel changes
    fireEvent.click(screen.getByRole('button', { name: /x/i }))

    // Check if edit mode is exited and original status is restored
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
  })

  test('calls onDelete when delete button is clicked and confirmed', () => {
    global.confirm.mockReturnValue(true)

    render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Click delete button
    fireEvent.click(screen.getByText('Delete'))

    // Check if confirmation was shown and onDelete was called
    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete the appointment for John Smith?'
    )
    expect(mockOnDelete).toHaveBeenCalledWith('apt_001')
  })

  test('does not call onDelete when delete is cancelled', () => {
    global.confirm.mockReturnValue(false)

    render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Click delete button
    fireEvent.click(screen.getByText('Delete'))

    // Check if confirmation was shown but onDelete was not called
    expect(global.confirm).toHaveBeenCalled()
    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  test('does not call onStatusUpdate if status is unchanged', async () => {
    render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Enter edit mode
    fireEvent.click(screen.getByText('Update Status'))

    // Don't change status, just save
    fireEvent.click(screen.getByRole('button', { name: /check/i }))

    // Wait and check that onStatusUpdate was not called
    await waitFor(() => {
      expect(mockOnStatusUpdate).not.toHaveBeenCalled()
    })
  })

  test('applies custom className when provided', () => {
    const { container } = render(
      <AppointmentCard
        appointment={mockAppointment}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})