import React from 'react'
import AppointmentManagementView from './components/AppointmentManagementView'

function App() {
  return (
    <div className="min-h-screen bg-dark-950">
      <header className="bg-dark-900 border-b border-dark-800 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-600 rounded-lg p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              SwasthiQ
            </h1>
            <p className="text-dark-400 text-sm">
              Modern Healthcare Appointment Management
            </p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <AppointmentManagementView />
      </main>
      
      <footer className="bg-dark-900 border-t border-dark-800 px-6 py-4 mt-12">
        <div className="text-center text-dark-500 text-sm">
          <p>&copy; 2024 SwasthiQ. Developed by Shivangi Singh for modern healthcare providers.</p>
        </div>
      </footer>
    </div>
  )
}

export default App