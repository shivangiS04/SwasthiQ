import React, { useState } from 'react'
import { Calendar, Clock, User, MapPin, Phone, Video, Edit3, Trash2, Check, X } from 'lucide-react'

const AppointmentCard = ({ 
  appointment, 
  onStatusUpdate, 
  onDelete,
  className = "" 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(appointment.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Upcoming':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'Virtual':
        return <Video className="w-4 h-4 text-primary-400" />
      case 'Phone':
        return <Phone className="w-4 h-4 text-primary-400" />
      default:
        return <MapPin className="w-4 h-4 text-primary-400" />
    }
  }

  const getModeColor = (mode) => {
    switch (mode) {
      case 'Virtual':
        return 'text-blue-400'
      case 'Phone':
        return 'text-green-400'
      default:
        return 'text-primary-400'
    }
  }

  const handleStatusSave = async () => {
    if (selectedStatus === appointment.status) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    try {
      await onStatusUpdate(appointment.id, selectedStatus)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update status:', error)
      setSelectedStatus(appointment.status) // Reset to original
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusCancel = () => {
    setSelectedStatus(appointment.status)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the appointment for ${appointment.patient_name}?`)) {
      onDelete(appointment.id)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-dark-600 transition-all duration-200 hover:shadow-lg ${className}`}>
      {/* Header with Patient Name and Status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center flex-1">
          <div className="bg-primary-600 rounded-full p-2 mr-3">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">{appointment.patient_name}</h3>
            <p className="text-dark-400 text-sm">Patient ID: {appointment.id}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field text-xs py-1 px-2 min-w-24"
                disabled={isUpdating}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusSave}
                disabled={isUpdating}
                className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleStatusCancel}
                disabled={isUpdating}
                className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          )}
        </div>
      </div>

      {/* Appointment Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Date */}
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-primary-400 mr-3" />
          <div>
            <p className="text-dark-400 text-xs font-bold uppercase tracking-wide">Date</p>
            <p className="text-white font-bold">{formatDate(appointment.date)}</p>
          </div>
        </div>

        {/* Time & Duration */}
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-primary-400 mr-3" />
          <div>
            <p className="text-dark-400 text-xs font-bold uppercase tracking-wide">Time</p>
            <p className="text-white font-bold">
              {formatTime(appointment.time)} ({appointment.duration}min)
            </p>
          </div>
        </div>

        {/* Doctor */}
        <div className="flex items-center">
          <User className="w-4 h-4 text-primary-400 mr-3" />
          <div>
            <p className="text-dark-400 text-xs font-bold uppercase tracking-wide">Doctor</p>
            <p className="text-white font-bold">{appointment.doctor_name}</p>
          </div>
        </div>

        {/* Mode */}
        <div className="flex items-center">
          {getModeIcon(appointment.mode)}
          <div className="ml-3">
            <p className="text-dark-400 text-xs font-bold uppercase tracking-wide">Mode</p>
            <p className={`font-bold ${getModeColor(appointment.mode)}`}>
              {appointment.mode}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-dark-700">
        {!isEditing && (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Update Status
            </button>
            
            <button
              onClick={handleDelete}
              className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </>
        )}
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-dark-900 bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  )
}

export default AppointmentCard