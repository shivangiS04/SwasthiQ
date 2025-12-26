import React, { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

const CalendarWidget = ({ 
  selectedDate, 
  onDateSelect, 
  appointments = [],
  className = "" 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])

  useEffect(() => {
    generateCalendarDays()
  }, [currentMonth, appointments])

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get first day of the month and how many days in the month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    // Get days from previous month to fill the grid
    const prevMonth = new Date(year, month - 1, 0)
    const daysInPrevMonth = prevMonth.getDate()
    
    const days = []
    
    // Previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const date = new Date(year, month - 1, day)
      days.push({
        date: date,
        day: day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasAppointments: false,
        appointmentCount: 0
      })
    }
    
    // Current month's days
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split('T')[0]
      const dayAppointments = appointments.filter(apt => apt.date === dateString)
      
      days.push({
        date: date,
        day: day,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: selectedDate === dateString,
        hasAppointments: dayAppointments.length > 0,
        appointmentCount: dayAppointments.length
      })
    }
    
    // Next month's days to fill the grid (42 days total - 6 weeks)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date: date,
        day: day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasAppointments: false,
        appointmentCount: 0
      })
    }
    
    setCalendarDays(days)
  }

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (dayInfo) => {
    if (!dayInfo.isCurrentMonth) return
    
    const dateString = dayInfo.date.toISOString().split('T')[0]
    onDateSelect(dateString)
  }

  const getDayClasses = (dayInfo) => {
    let classes = "relative w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg cursor-pointer transition-all duration-200 "
    
    if (!dayInfo.isCurrentMonth) {
      classes += "text-dark-600 hover:text-dark-500 "
    } else if (dayInfo.isSelected) {
      classes += "bg-primary-600 text-white shadow-lg transform scale-105 "
    } else if (dayInfo.isToday) {
      classes += "bg-primary-100 text-primary-800 border-2 border-primary-600 hover:bg-primary-200 "
    } else if (dayInfo.hasAppointments) {
      classes += "bg-dark-700 text-white hover:bg-dark-600 border border-primary-500 "
    } else {
      classes += "text-dark-300 hover:bg-dark-700 hover:text-white "
    }
    
    return classes
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-primary-400 mr-2" />
          <h2 className="text-lg font-extrabold text-white">Calendar</h2>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-dark-400 hover:text-white" />
        </button>
        
        <h3 className="text-lg font-bold text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-dark-400 hover:text-white" />
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(dayName => (
          <div key={dayName} className="text-center text-xs font-bold text-dark-400 py-2">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => (
          <div
            key={index}
            className={getDayClasses(dayInfo)}
            onClick={() => handleDateClick(dayInfo)}
          >
            <span className="z-10">{dayInfo.day}</span>
            
            {/* Appointment Indicator */}
            {dayInfo.hasAppointments && dayInfo.isCurrentMonth && (
              <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary-400 rounded-full">
                {dayInfo.appointmentCount > 1 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {dayInfo.appointmentCount > 9 ? '9+' : dayInfo.appointmentCount}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-dark-700">
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary-600 rounded mr-2"></div>
            <span className="text-dark-400">Selected Date</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary-100 border-2 border-primary-600 rounded mr-2"></div>
            <span className="text-dark-400">Today</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-dark-700 border border-primary-500 rounded mr-2"></div>
            <span className="text-dark-400">Has Appointments</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-dark-700">
        <div className="space-y-2">
          <button
            onClick={() => onDateSelect(new Date().toISOString().split('T')[0])}
            className="w-full text-left px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors"
          >
            Go to Today
          </button>
          
          {selectedDate && (
            <button
              onClick={() => onDateSelect(null)}
              className="w-full text-left px-3 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white text-sm font-bold rounded-lg transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarWidget