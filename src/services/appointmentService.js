// Bridge service to connect React frontend with Python Flask API
// This service makes HTTP requests to the Python backend

class AppointmentService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
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
      console.error('Error fetching appointments:', error);
      throw error;
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
      console.error('API health check failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;