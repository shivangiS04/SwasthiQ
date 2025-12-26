import React, { useState, useEffect } from 'react'
import { Calendar, Plus, Filter } from 'lucide-react'
import appointmentService from '../services/appointmentService'
import AppointmentCard from './AppointmentCard'
import CalendarWidget from './CalendarWidget'
import StatusTabs from './StatusTabs'
import AppointmentForm from './AppointmentForm'

const AppointmentManagementView = () => {
  // State management for appointments and UI
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  
  // UI states
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false)
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)

  // Load appointments on component mount
  useEffect(() => {
    loadAppointments()
  }, [])

  // Apply filters when appointments or filter states change
  useEffect(() => {
    applyFilters()
  }, [appointments, selectedDate, activeTab])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await appointmentService.getAppointments()
      setAppointments(data)
    } catch (err) {
      setError('Failed to load appointments. Please try again.')
      console.error('Error loading appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...appointments]
    
    // Apply date filter first
    if (selectedDate) {
      filtered = filtered.filter(apt => apt.date === selectedDate)
    }
    
    // Apply tab filter
    const today = new Date().toISOString().split('T')[0]
    
    switch (activeTab) {
      case 'today':
        // Show appointments scheduled for today
        filtered = filtered.filter(apt => apt.date === today)
        break
      case 'upcoming':
        // Show appointments with future dates OR status "Upcoming"
        filtered = filtered.filter(apt => 
          apt.date > today || apt.status === 'Upcoming'
        )
        break
      case 'past':
        // Show appointments from previous dates OR completed status
        // Note: We don't have "Completed" status in our mock data, so using past dates
        filtered = filtered.filter(apt => 
          apt.date < today || apt.status === 'Completed'
        )
        break
      case 'all':
      default:
        // No additional filtering - show all appointments
        break
    }
    
    setFilteredAppointments(filtered)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date === selectedDate ? null : date)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus)
      await loadAppointments() // Refresh data
    } catch (err) {
      setError('Failed to update appointment status.')
      console.error('Error updating status:', err)
    }
  }

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return
    }
    
    try {
      await appointmentService.deleteAppointment(appointmentId)
      await loadAppointments() // Refresh data
    } catch (err) {
      setError('Failed to delete appointment.')
      console.error('Error deleting appointment:', err)
    }
  }

  const handleCreateAppointment = async (appointmentData) => {
    setIsCreatingAppointment(true)
    try {
      await appointmentService.createAppointment(appointmentData)
      await loadAppointments() // Refresh data
      setShowNewAppointmentForm(false) // Close form on success
    } catch (err) {
      setError('Failed to create appointment.')
      console.error('Error creating appointment:', err)
      throw err // Re-throw to let form handle it
    } finally {
      setIsCreatingAppointment(false)
    }
  }

  const getEmptyStateMessage = () => {
    if (selectedDate && activeTab !== 'all') {
      return `No appointments found for ${new Date(selectedDate).toLocaleDateString()} in the ${activeTab} category.`
    } else if (selectedDate) {
      return `No appointments scheduled for ${new Date(selectedDate).toLocaleDateString()}.`
    } else if (activeTab !== 'all') {
      return `No ${activeTab} appointments found.`
    } else {
      return 'No appointments found.'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-lg font-bold text-white">Loading appointments...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Error Display */}
      {error && (
        <div className="lg:col-span-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Calendar Widget - Left Column */}
      <div className="lg:col-span-1">
        <CalendarWidget
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          appointments={appointments}
        />
      </div>
      
      {/* Main Content - Right Columns */}
      <div className="lg:col-span-3">
        {/* Status Tabs */}
        <div className="mb-6">
          <StatusTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            appointments={appointments}
          />
        </div>
        
        {/* Appointments List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">
              Appointments ({filteredAppointments.length})
            </h2>
            <button 
              onClick={() => setShowNewAppointmentForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </button>
          </div>
          
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400 text-lg font-bold">{getEmptyStateMessage()}</p>
              <p className="text-dark-500 text-sm mt-2">
                {selectedDate || activeTab !== 'all' 
                  ? 'Try adjusting your filters or create a new appointment.'
                  : 'Create your first appointment to get started.'
                }
              </p>
              
              {/* Quick action buttons in empty state */}
              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => setShowNewAppointmentForm(true)}
                  className="btn-primary mx-auto flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Appointment
                </button>
                
                {(selectedDate || activeTab !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedDate(null)
                      setActiveTab('all')
                    }}
                    className="btn-secondary mx-auto flex items-center"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDeleteAppointment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* New Appointment Form Modal */}
      <AppointmentForm
        isOpen={showNewAppointmentForm}
        onClose={() => setShowNewAppointmentForm(false)}
        onSubmit={handleCreateAppointment}
        isSubmitting={isCreatingAppointment}
      />
    </div>
  )
}

export default AppointmentManagementView