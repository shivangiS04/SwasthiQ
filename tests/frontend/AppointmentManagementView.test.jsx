import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppointmentManagementView from '../../src/components/AppointmentManagementView'

// Mock the appointment service
jest.mock('../../src/services/appointmentService', () => ({
  getAppointments: jest.fn(),
  createAppointment: jest.fn(),
  updateAppointmentStatus: jest.fn(),
  deleteAppointment: jest.fn(),
  healthCheck: jest.fn()
}))

// Mock child components
jest.mock('../../src/components/AppointmentCard', () => {
  return function MockAppointmentCard({ appointment, onStatusUpdate, onDelete }) {
    return (
      <div data-testid={`appointment-${appointment.id}`}>
        <span>{appointment.patient_name}</span>
        <button onClick={() => onStatusUpdate(appointment.id, 'Confirmed')}>
          Update Status
        </button>
        <button onClick={() => onDelete(appointment.id)}>Delete</button>
      </div>
    )
  }
})

jest.mock('../../src/components/CalendarWidget', () => {
  return function MockCalendarWidget({ onDateSelect, selectedDate }) {
    return (
      <div data-testid="calendar-widget">
        <button onClick={() => onDateSelect('2024-12-27')}>Select Date</button>
        {selectedDate && <span>Selected: {selectedDate}</span>}
      </div>
    )
  }
})

jest.mock('../../src/components/StatusTabs', () => {
  return function MockStatusTabs({ activeTab, onTabChange }) {
    return (
      <div data-testid="status-tabs">
        <button onClick={() => onTabChange('all')}>All</button>
        <button onClick={() => onTabChange('today')}>Today</button>
        <button onClick={() => onTabChange('upcoming')}>Upcoming</button>
        <button onClick={() => onTabChange('past')}>Past</button>
        <span>Active: {activeTab}</span>
      </div>
    )
  }
})

jest.mock('../../src/components/AppointmentForm', () => {
  return function MockAppointmentForm({ isOpen, onClose, onSubmit }) {
    if (!isOpen) return null
    return (
      <div data-testid="appointment-form">
        <button onClick={onClose}>Close Form</button>
        <button onClick={() => onSubmit({ patient_name: 'Test Patient' })}>
          Submit Form
        </button>
      </div>
    )
  }
})

import appointmentService from '../../src/services/appointmentService'

// Mock data
const mockAppointments = [
  {
    id: 'apt_001',
    patient_name: 'John Smith',
    date: '2024-12-27',
    time: '09:00',
    duration: 30,
    doctor_name: 'Dr. Sarah Johnson',
    status: 'Confirmed',
    mode: 'In-person'
  },
  {
    id: 'apt_002',
    patient_name: 'Emily Davis',
    date: '2024-12-26',
    time: '10:30',
    duration: 45,
    doctor_name: 'Dr. Michael Chen',
    status: 'Scheduled',
    mode: 'Virtual'
  }
]

// Mock window.confirm
global.confirm = jest.fn()

describe('AppointmentManagementView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    appointmentService.healthCheck.mockResolvedValue({ success: true })
    appointmentService.getAppointments.mockResolvedValue(mockAppointments)
  })

  test('renders loading state initially', () => {
    appointmentService.healthCheck.mockImplementation(() => new Promise(() => {}))
    
    render(<AppointmentManagementView />)
    
    expect(screen.getByText('Checking connection to appointment service...')).toBeInTheDocument()
  })

  test('loads appointments after successful health check', async () => {
    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(appointmentService.healthCheck).toHaveBeenCalled()
      expect(appointmentService.getAppointments).toHaveBeenCalled()
    })

    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Emily Davis')).toBeInTheDocument()
  })

  test('displays connection error when health check fails', async () => {
    appointmentService.healthCheck.mockRejectedValue(new Error('Connection failed'))

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('Connection Failed')).toBeInTheDocument()
      expect(screen.getByText(/Unable to connect to the appointment service/)).toBeInTheDocument()
    })
  })

  test('retries connection when retry button is clicked', async () => {
    appointmentService.healthCheck
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValueOnce({ success: true })

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('Connection Failed')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Retry Connection'))

    await waitFor(() => {
      expect(appointmentService.healthCheck).toHaveBeenCalledTimes(2)
    })
  })

  test('displays error message when appointment loading fails', async () => {
    appointmentService.getAppointments.mockRejectedValue(new Error('Failed to fetch'))

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument()
    })
  })

  test('filters appointments by date when calendar date is selected', async () => {
    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
      expect(screen.getByText('Emily Davis')).toBeInTheDocument()
    })

    // Select a date that only matches one appointment
    fireEvent.click(screen.getByText('Select Date'))

    await waitFor(() => {
      expect(screen.getByText('Selected: 2024-12-27')).toBeInTheDocument()
      expect(screen.getByText('John Smith')).toBeInTheDocument()
      expect(screen.queryByText('Emily Davis')).not.toBeInTheDocument()
    })
  })

  test('filters appointments by status tab', async () => {
    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
      expect(screen.getByText('Emily Davis')).toBeInTheDocument()
    })

    // Switch to 'today' tab (should filter to today's appointments)
    fireEvent.click(screen.getByText('Today'))

    await waitFor(() => {
      expect(screen.getByText('Active: today')).toBeInTheDocument()
    })
  })

  test('opens appointment form when New Appointment button is clicked', async () => {
    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('New Appointment'))

    expect(screen.getByTestId('appointment-form')).toBeInTheDocument()
  })

  test('closes appointment form when close button is clicked', async () => {
    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    // Open form
    fireEvent.click(screen.getByText('New Appointment'))
    expect(screen.getByTestId('appointment-form')).toBeInTheDocument()

    // Close form
    fireEvent.click(screen.getByText('Close Form'))
    expect(screen.queryByTestId('appointment-form')).not.toBeInTheDocument()
  })

  test('creates new appointment when form is submitted', async () => {
    appointmentService.createAppointment.mockResolvedValue({
      id: 'apt_003',
      patient_name: 'Test Patient'
    })

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    // Open form and submit
    fireEvent.click(screen.getByText('New Appointment'))
    fireEvent.click(screen.getByText('Submit Form'))

    await waitFor(() => {
      expect(appointmentService.createAppointment).toHaveBeenCalledWith({
        patient_name: 'Test Patient'
      })
      expect(appointmentService.getAppointments).toHaveBeenCalledTimes(2) // Initial load + refresh
    })
  })

  test('updates appointment status when status update is triggered', async () => {
    appointmentService.updateAppointmentStatus.mockResolvedValue({})

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Update Status'))

    await waitFor(() => {
      expect(appointmentService.updateAppointmentStatus).toHaveBeenCalledWith('apt_001', 'Confirmed')
      expect(appointmentService.getAppointments).toHaveBeenCalledTimes(2) // Initial load + refresh
    })
  })

  test('deletes appointment when delete is confirmed', async () => {
    global.confirm.mockReturnValue(true)
    appointmentService.deleteAppointment.mockResolvedValue(true)

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(appointmentService.deleteAppointment).toHaveBeenCalledWith('apt_001')
      expect(appointmentService.getAppointments).toHaveBeenCalledTimes(2) // Initial load + refresh
    })
  })

  test('does not delete appointment when delete is cancelled', async () => {
    global.confirm.mockReturnValue(false)

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Delete'))

    expect(appointmentService.deleteAppointment).not.toHaveBeenCalled()
  })

  test('displays empty state when no appointments match filters', async () => {
    appointmentService.getAppointments.mockResolvedValue([])

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('No appointments found.')).toBeInTheDocument()
      expect(screen.getByText('Create your first appointment to get started.')).toBeInTheDocument()
    })
  })

  test('clears filters when Clear All Filters button is clicked', async () => {
    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    // Apply filters
    fireEvent.click(screen.getByText('Select Date'))
    fireEvent.click(screen.getByText('Today'))

    // Clear filters
    fireEvent.click(screen.getByText('Clear All Filters'))

    await waitFor(() => {
      expect(screen.getByText('Active: all')).toBeInTheDocument()
      expect(screen.queryByText('Selected:')).not.toBeInTheDocument()
    })
  })

  test('handles appointment service errors gracefully', async () => {
    appointmentService.updateAppointmentStatus.mockRejectedValue(new Error('Network error'))

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Update Status'))

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText(/Failed to update appointment status/)).toBeInTheDocument()
    })
  })

  test('dismisses error when dismiss button is clicked', async () => {
    appointmentService.getAppointments.mockRejectedValue(new Error('Test error'))

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Dismiss'))

    expect(screen.queryByText('Error')).not.toBeInTheDocument()
  })

  test('retries loading appointments when retry button is clicked', async () => {
    appointmentService.getAppointments
      .mockRejectedValueOnce(new Error('Test error'))
      .mockResolvedValueOnce(mockAppointments)

    render(<AppointmentManagementView />)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Retry'))

    await waitFor(() => {
      expect(appointmentService.getAppointments).toHaveBeenCalledTimes(2)
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })
  })
})