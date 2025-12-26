import React, { useState } from 'react'
import { X, Calendar, Clock, User, MapPin, Phone, Video, Save, AlertCircle } from 'lucide-react'

const AppointmentForm = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    date: '',
    time: '',
    duration: 30,
    doctor_name: '',
    mode: 'In-person',
    status: 'Scheduled'
  })
  
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'patient_name':
        if (!value.trim()) return 'Patient name is required'
        if (value.trim().length < 2) return 'Patient name must be at least 2 characters'
        return ''
      
      case 'date':
        if (!value) return 'Date is required'
        const selectedDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selectedDate < today) return 'Date cannot be in the past'
        return ''
      
      case 'time':
        if (!value) return 'Time is required'
        const [hours, minutes] = value.split(':').map(Number)
        if (hours < 8 || hours > 18) return 'Time must be between 8:00 AM and 6:00 PM'
        return ''
      
      case 'duration':
        if (!value || value < 15) return 'Duration must be at least 15 minutes'
        if (value > 480) return 'Duration cannot exceed 8 hours'
        return ''
      
      case 'doctor_name':
        if (!value.trim()) return 'Doctor name is required'
        if (value.trim().length < 2) return 'Doctor name must be at least 2 characters'
        return ''
      
      case 'mode':
        if (!['In-person', 'Virtual', 'Phone'].includes(value)) return 'Invalid appointment mode'
        return ''
      
      default:
        return ''
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      if (key !== 'status') { // status is optional
        const error = validateField(key, formData[key])
        if (error) newErrors[key] = error
      }
    })
    
    setErrors(newErrors)
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      await onSubmit(formData)
      // Reset form on successful submission
      setFormData({
        patient_name: '',
        date: '',
        time: '',
        duration: 30,
        doctor_name: '',
        mode: 'In-person',
        status: 'Scheduled'
      })
      setErrors({})
      setTouched({})
    } catch (error) {
      // Handle submission errors
      if (error.message.includes('conflict')) {
        setErrors({ time: 'Time conflict detected. Please choose a different time.' })
      } else {
        setErrors({ submit: error.message || 'Failed to create appointment' })
      }
    }
  }

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'Virtual':
        return <Video className="w-4 h-4" />
      case 'Phone':
        return <Phone className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName]
  }

  // Generate time options (8 AM to 6 PM, 15-minute intervals)
  const timeOptions = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 18 && minute > 0) break // Stop at 6:00 PM
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeOptions.push(timeString)
    }
  }

  // Generate duration options
  const durationOptions = [15, 30, 45, 60, 90, 120, 180, 240]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-primary-400 mr-3" />
            <h2 className="text-xl font-extrabold text-white">New Appointment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-dark-400 hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Patient Name */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Patient Name *
            </label>
            <input
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`input-field w-full ${getFieldError('patient_name') ? 'border-red-500' : ''}`}
              placeholder="Enter patient's full name"
              disabled={isSubmitting}
            />
            {getFieldError('patient_name') && (
              <p className="text-red-400 text-sm mt-1">{errors.patient_name}</p>
            )}
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min={new Date().toISOString().split('T')[0]}
                className={`input-field w-full ${getFieldError('date') ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {getFieldError('date') && (
                <p className="text-red-400 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Time *
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`input-field w-full ${getFieldError('time') ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Select time</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>
                    {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </option>
                ))}
              </select>
              {getFieldError('time') && (
                <p className="text-red-400 text-sm mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Duration and Doctor Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duration */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Duration *
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`input-field w-full ${getFieldError('duration') ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              >
                {durationOptions.map(duration => (
                  <option key={duration} value={duration}>
                    {duration} minutes ({Math.floor(duration / 60)}h {duration % 60}m)
                  </option>
                ))}
              </select>
              {getFieldError('duration') && (
                <p className="text-red-400 text-sm mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Doctor *
              </label>
              <input
                type="text"
                name="doctor_name"
                value={formData.doctor_name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`input-field w-full ${getFieldError('doctor_name') ? 'border-red-500' : ''}`}
                placeholder="Dr. Smith"
                disabled={isSubmitting}
              />
              {getFieldError('doctor_name') && (
                <p className="text-red-400 text-sm mt-1">{errors.doctor_name}</p>
              )}
            </div>
          </div>

          {/* Mode and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Appointment Mode *
              </label>
              <div className="space-y-2">
                {['In-person', 'Virtual', 'Phone'].map(mode => (
                  <label key={mode} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      checked={formData.mode === mode}
                      onChange={handleInputChange}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className={`flex items-center px-3 py-2 rounded-lg border-2 transition-all ${
                      formData.mode === mode
                        ? 'border-primary-500 bg-primary-600 text-white'
                        : 'border-dark-600 bg-dark-700 text-dark-300 hover:border-dark-500'
                    }`}>
                      {getModeIcon(mode)}
                      <span className="ml-2 font-bold">{mode}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Initial Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field w-full"
                disabled={isSubmitting}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-dark-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AppointmentForm