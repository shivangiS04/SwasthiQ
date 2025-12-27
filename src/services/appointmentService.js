class AppointmentService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://swasthiq.onrender.com/api'
      : 'http://localhost:5000/api';
    this.demoMode = false;
  }

  getMockAppointments() {
    return [
      {
        id: "apt_001",
        patient_name: "Rajesh Kumar",
        date: "2024-12-27",
        time: "09:00",
        duration: 30,
        doctor_name: "Dr. Priya Sharma",
        status: "Confirmed",
        mode: "In-person"
      },
      {
        id: "apt_002",
        patient_name: "Anita Patel",
        date: "2024-12-27",
        time: "10:30",
        duration: 45,
        doctor_name: "Dr. Arjun Mehta",
        status: "Scheduled",
        mode: "Virtual"
      },
      {
        id: "apt_003",
        patient_name: "Vikram Singh",
        date: "2024-12-28",
        time: "14:00",
        duration: 60,
        doctor_name: "Dr. Priya Sharma",
        status: "Upcoming",
        mode: "In-person"
      },
      {
        id: "apt_004",
        patient_name: "Kavya Reddy",
        date: "2024-12-26",
        time: "11:15",
        duration: 30,
        doctor_name: "Dr. Rohit Gupta",
        status: "Confirmed",
        mode: "Phone"
      },
      {
        id: "apt_005",
        patient_name: "Amit Agarwal",
        date: "2024-12-29",
        time: "08:30",
        duration: 45,
        doctor_name: "Dr. Arjun Mehta",
        status: "Scheduled",
        mode: "Virtual"
      }
    ];
  }

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
      
      let mockData = this.getMockAppointments();
      
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

const appointmentService = new AppointmentService();
export default appointmentService;