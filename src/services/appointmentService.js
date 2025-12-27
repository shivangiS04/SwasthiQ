// Bridge service to connect React frontend with Python Flask API
// This service makes HTTP requests to the Python backend

class AppointmentService {
  constructor() {
    // Use production API URL when deployed, localhost for development
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://swasthiq-api.onrender.com/api'  // Replace with your actual Render URL
      : 'http://localhost:5000/api';
    this.demoMode = false;
  }

  // Mock data for demo when API is unavailable
  getMockAppointments() {
    return [
      {
        id: "apt_001",
        patient_name: "John Smith",
        date: "2024-12-27",
        time: "09:00",
        duration: 30,
        doctor_name: "Dr. Sarah Johnson",
        status: "Confirmed",
        mode: "In-person"
      },
      {
        id: "apt_002",
        patient_name: "Emily Davis",
        date: "2024-12-27",
        time: "10:30",
        duration: 45,
        doctor_name: "Dr. Michael Chen",
        status: "Scheduled",
        mode: "Virtual"
      },
      {
        id: "apt_003",
        patient_name: "Robert Wilson",
        date: "2024-12-28",
        time: "14:00",
        duration: 60,
        doctor_name: "Dr. Sarah Johnson",
        status: "Upcoming",
        mode: "In-person"
      },
      {
        id: "apt_004",
        patient_name: "Lisa Anderson",
        date: "2024-12-26",
        time: "11:15",
        duration: 30,
        doctor_name: "Dr. James Rodriguez",
        status: "Confirmed",
        mode: "Phone"
      },
      {
        id: "apt_005",
        patient_name: "David Brown",
        date: "2024-12-29",
        time: "08:30",
        duration: 45,
        doctor_name: "Dr. Michael Chen",
        status: "Scheduled",
        mode: "Virtual"
      }
    ];
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Operation failed');
    }
    
    return data.data || data;
  }

  // Get appointments with optional filtering
  async getAppointments(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.date) {
        params.append('date', filters.date);
      }
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.doctor_name) {
        params.append('doctor_name', filters.doctor_name);
      }
      
      const url = `${this.baseURL}/appointments${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('API unavailable, switching to demo mode:', error.message);
      this.demoMode = true;
      
      // Return mock data when API is unavailable (for live demo)
      let mockData = this.getMockAppointments();
      
      // Apply filters to mock data
      if (filters.date) {
        mockData = mockData.filter(apt => apt.date === filters.date);
      }
      if (filters.status) {
        mockData = mockData.filter(apt => apt.status === filters.status);
      }
      if (filters.doctor_name) {
        mockData = mockData.filter(apt => apt.doctor_name === filters.doctor_name);
      }
      
      return mockData;
    }
  }

  // Create a new appointment
  async createAppointment(payload) {
    try {
      const response = await fetch(`${this.baseURL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  // Update appointment status
  async updateAppointmentStatus(id, newStatus) {
    try {
      const response = await fetch(`${this.baseURL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  // Delete an appointment
  async deleteAppointment(id) {
    try {
      const response = await fetch(`${this.baseURL}/appointments/${id}`, {
        method: 'DELETE',
      });
      
      const result = await this.handleResponse(response);
      return result.success;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  // Health check for API connectivity
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('API health check failed, demo mode available:', error.message);
      this.demoMode = true;
      return { status: 'demo', message: 'Running in demo mode with mock data' };
    }
  }
}

// Create singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;