import React from 'react'
import { Filter, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'

const StatusTabs = ({ 
  activeTab, 
  onTabChange, 
  appointments = [],
  className = "" 
}) => {
  // Calculate counts for each tab
  const today = new Date().toISOString().split('T')[0]
  
  const counts = {
    all: appointments.length,
    today: appointments.filter(apt => apt.date === today).length,
    upcoming: appointments.filter(apt => 
      apt.date > today || apt.status === 'Upcoming'
    ).length,
    past: appointments.filter(apt => 
      apt.date < today || apt.status === 'Completed'
    ).length
  }

  const tabs = [
    {
      key: 'all',
      label: 'All Appointments',
      icon: Filter,
      count: counts.all,
      description: 'View all appointments',
      color: 'text-blue-400'
    },
    {
      key: 'today',
      label: 'Today',
      icon: Calendar,
      count: counts.today,
      description: 'Appointments scheduled for today',
      color: 'text-green-400'
    },
    {
      key: 'upcoming',
      label: 'Upcoming',
      icon: Clock,
      count: counts.upcoming,
      description: 'Future appointments and upcoming status',
      color: 'text-yellow-400'
    },
    {
      key: 'past',
      label: 'Past',
      icon: CheckCircle,
      count: counts.past,
      description: 'Previous appointments and completed',
      color: 'text-gray-400'
    }
  ]

  const getTabClasses = (tab) => {
    const baseClasses = "flex items-center px-4 py-3 rounded-lg font-bold text-sm transition-all duration-200 hover:transform hover:scale-105 "
    
    if (activeTab === tab.key) {
      return baseClasses + "bg-primary-600 text-white shadow-lg border-2 border-primary-400"
    } else {
      return baseClasses + "bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white border-2 border-transparent hover:border-dark-500"
    }
  }

  const getCountBadgeClasses = (tab) => {
    const baseClasses = "ml-2 px-2 py-1 rounded-full text-xs font-extrabold "
    
    if (activeTab === tab.key) {
      return baseClasses + "bg-white text-primary-600"
    } else {
      return baseClasses + "bg-dark-600 text-dark-300 group-hover:bg-dark-500 group-hover:text-white"
    }
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-primary-400 mr-2" />
          <h2 className="text-lg font-extrabold text-white">Filter by Status</h2>
        </div>
        
        {/* Active filter indicator */}
        {activeTab !== 'all' && (
          <div className="flex items-center text-sm text-primary-400">
            <div className="w-2 h-2 bg-primary-400 rounded-full mr-2 animate-pulse"></div>
            <span className="font-bold">Filter Active</span>
          </div>
        )}
      </div>
      
      {/* Tab Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tabs.map(tab => {
          const IconComponent = tab.icon
          
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`${getTabClasses(tab)} group relative`}
              title={tab.description}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <IconComponent className={`w-4 h-4 mr-2 ${
                    activeTab === tab.key ? 'text-white' : tab.color
                  }`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                
                {/* Count Badge */}
                <span className={getCountBadgeClasses(tab)}>
                  {tab.count}
                </span>
              </div>
              
              {/* Active indicator */}
              {activeTab === tab.key && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary-400 rounded-full"></div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Tab Description */}
      <div className="mt-4 pt-4 border-t border-dark-700">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-600 rounded-full mr-3"></div>
          <p className="text-dark-400 text-sm">
            {tabs.find(tab => tab.key === activeTab)?.description}
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
          <div className="flex justify-between">
            <span className="text-dark-500">Total:</span>
            <span className="text-white font-bold">{counts.all}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-500">Today:</span>
            <span className="text-green-400 font-bold">{counts.today}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-500">Upcoming:</span>
            <span className="text-yellow-400 font-bold">{counts.upcoming}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-500">Past:</span>
            <span className="text-gray-400 font-bold">{counts.past}</span>
          </div>
        </div>
      </div>
      
      {/* Clear Filter Button */}
      {activeTab !== 'all' && (
        <div className="mt-4 pt-4 border-t border-dark-700">
          <button
            onClick={() => onTabChange('all')}
            className="w-full flex items-center justify-center px-3 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white text-sm font-bold rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Clear Filter
          </button>
        </div>
      )}
    </div>
  )
}

export default StatusTabs