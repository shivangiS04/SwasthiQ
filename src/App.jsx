import React from 'react'
import AppointmentManagementView from './components/AppointmentManagementView'

function App() {
  return (
    <div className="min-h-screen bg-dark-950">
      <header className="bg-dark-900 border-b border-dark-800 px-6 py-4">
        <h1 className="text-2xl font-extrabold text-white">
          EMR Appointment Management System
        </h1>
        <p className="text-dark-400 mt-1">
          Healthcare Provider Dashboard
        </p>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <AppointmentManagementView />
      </main>
    </div>
  )
}

export default App