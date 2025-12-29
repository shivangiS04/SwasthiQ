# SwasthiQ - Healthcare Appointment Management Platform

> **SwasthiQ** (स्वास्थ्य + IQ) combines the Sanskrit word for "health" with "Intelligence Quotient", representing intelligent healthcare management solutions for Indian medical providers.

A modern, full-stack appointment management platform designed specifically for Indian healthcare providers. Built with React and Python, SwasthiQ offers real-time scheduling, intelligent conflict detection, and a professional user interface optimized for Indian medical workflows.

🌐 **Live Demo**: [https://swasthi-q.vercel.app](https://swasthi-q.vercel.app)  
🔗 **Backend API**: [https://swasthiq.onrender.com/api](https://swasthiq.onrender.com/api)  
🏥 **Health Check**: [https://swasthiq.onrender.com/api/health](https://swasthiq.onrender.com/api/health)


## Key Features

### Core Appointment Management
- **Smart Scheduling**: Create appointments with automatic conflict detection
- **Status Tracking**: Real-time updates for Scheduled, Confirmed, Upcoming, and Cancelled appointments
- **Multi-Doctor Support**: Handle multiple doctors common in Indian healthcare facilities
- **Appointment Modes**: Support for In-person, Virtual (telemedicine), and Phone consultations

### Advanced Filtering & Search
- **Calendar Integration**: Interactive date picker with appointment indicators
- **Status Tabs**: Quick filtering by Upcoming, Today, and Past appointments
- **Doctor Filtering**: View appointments by specific healthcare providers
- **Empty State Handling**: Helpful guidance when no appointments match filters

### Professional User Experience
- **Healthcare-Optimized UI**: Black and blue color scheme following medical UI standards
- **Responsive Design**: Optimized for desktop, tablet, and mobile use in Indian clinics
- **Loading States**: Professional loading indicators for all async operations
- **Error Recovery**: Intelligent error handling with retry mechanisms
- **Connection Monitoring**: Real-time API connection status

##  Technology Stack

### Frontend Architecture
```
React 18.2.0          → Modern UI library with hooks
Tailwind CSS 3.3.3    → Utility-first styling framework
Lucide React           → Professional icon library
Vite 4.4.5            → Fast build tool and dev server
Jest + Testing Library → Comprehensive testing suite
```

### Backend Architecture  
```
Python 3.13.4         → Latest Python with enhanced performance
Flask 2.3.3           → Lightweight web framework
Flask-CORS 4.0.0      → Cross-origin resource sharing
Pytest 7.4.0         → Advanced testing framework
Hypothesis 6.82.0     → Property-based testing library
```

### Deployment & DevOps
```
Vercel                → Frontend deployment platform
Render                → Backend API deployment
GitHub Actions        → CI/CD pipeline ready
Docker                → Containerization support
```

## 📋 System Requirements

### Development Environment
- **Node.js**: 16.0.0 or higher
- **npm**: 8.0.0 or higher  
- **Python**: 3.11+ (deployed on 3.13.4)
- **pip**: Latest version

### Production Environment
- **Memory**: 512MB RAM minimum
- **Storage**: 100MB disk space
- **Network**: HTTPS support
- **Browser**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

## Quick Start Guide

### 1. Project Setup
```bash
# Clone the repository
git clone https://github.com/shivangiS04/SwasthiQ.git
cd SwasthiQ

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Development Servers

**Start Backend API** (Terminal 1):
```bash
cd backend
python api_server.py
# API server will start on http://localhost:5000
```

**Start Frontend Development Server** (Terminal 2):
```bash
npm run dev
# React app will start on http://localhost:3000
```

### 3. Verify Installation
- Open http://localhost:3000 in your browser
- You should see the SwasthiQ dashboard with Indian patient and doctor names
- Test creating a new appointment to verify full functionality

## Testing & Quality Assurance

SwasthiQ includes comprehensive testing to ensure reliability in Indian healthcare environments.

### Run All Tests
```bash
# Frontend tests (React components)
npm test

# Backend tests (Python API)
cd backend
python -m pytest test_appointment_service.py -v

# Watch mode for development
npm run test:watch
```

### Test Coverage
- **Backend**: 31 comprehensive tests including property-based testing
- **Frontend**: Component tests, integration tests, and user interaction tests
- **API Integration**: End-to-end workflow testing
- **Edge Cases**: Boundary conditions and error scenarios

## API Documentation

### Base URLs
```
Production Frontend: https://swasthi-q.vercel.app
Production Backend:  https://swasthiq.onrender.com/api
Development:         http://localhost:5000/api
```

### Core Endpoints

#### Health Check
```http
GET /api/health
```
Returns API status, version, and timestamp.

#### Get Appointments
```http
GET /api/appointments?date=2024-12-27&status=Confirmed&doctor_name=Dr.%20Priya%20Sharma
```
Retrieve appointments with optional filtering by date, status, or doctor.

#### Create Appointment
```http
POST /api/appointments
Content-Type: application/json

{
  "patient_name": "Rajesh Kumar",
  "date": "2024-12-27",
  "time": "14:30",
  "duration": 30,
  "doctor_name": "Dr. Priya Sharma",
  "mode": "In-person"
}
```

#### Update Appointment Status
```http
PUT /api/appointments/{id}/status
Content-Type: application/json

{
  "status": "Confirmed"
}
```

#### Delete Appointment
```http
DELETE /api/appointments/{id}
```

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## GraphQL Query Structure & Data Consistency

### Technical Architecture Decision: REST vs GraphQL

SwasthiQ implements a **RESTful API architecture** instead of GraphQL for the following technical reasons:

#### Why REST API Was Chosen:
1. **Simplicity**: Indian healthcare systems require straightforward, predictable API patterns
2. **Caching**: HTTP caching works seamlessly with REST endpoints
3. **Tooling**: Better debugging and monitoring tools for REST APIs
4. **Team Familiarity**: Faster development with well-understood REST patterns
5. **Performance**: Direct endpoint mapping reduces query complexity overhead

### Equivalent GraphQL Query Structure

If SwasthiQ were to implement GraphQL, the `getAppointments` function would use this query structure:

```graphql
# GraphQL Query for fetching appointments with filtering
query GetAppointments($filters: AppointmentFilters) {
  appointments(filters: $filters) {
    id
    patientName
    date
    time
    duration
    doctorName
    status
    mode
    createdAt
    updatedAt
  }
}

# GraphQL Input Type for filtering
input AppointmentFilters {
  date: String          # YYYY-MM-DD format
  status: AppointmentStatus
  doctorName: String
  patientName: String
  mode: AppointmentMode
}

# GraphQL Enums for type safety
enum AppointmentStatus {
  CONFIRMED
  SCHEDULED
  UPCOMING
  CANCELLED
}

enum AppointmentMode {
  IN_PERSON
  VIRTUAL
  PHONE
}
```

### Current REST Implementation vs GraphQL Equivalent

| Operation | Current REST Endpoint | GraphQL Equivalent |
|-----------|----------------------|-------------------|
| **Get Appointments** | `GET /api/appointments?date=2024-12-27&status=Confirmed` | `query { appointments(filters: {date: "2024-12-27", status: CONFIRMED}) { ... } }` |
| **Create Appointment** | `POST /api/appointments` | `mutation { createAppointment(input: {...}) { ... } }` |
| **Update Status** | `PUT /api/appointments/{id}/status` | `mutation { updateAppointmentStatus(id: "...", status: CONFIRMED) { ... } }` |
| **Delete Appointment** | `DELETE /api/appointments/{id}` | `mutation { deleteAppointment(id: "...") }` |

### Data Consistency Mechanisms

The Python `appointment_service.py` ensures data consistency through several mechanisms:

#### 1. **Transactional Operations**
```python
def update_appointment_status(self, appointment_id: str, new_status: str):
    # Step 1: Validate input
    if not validate_status_value(new_status):
        return error_response("VALIDATION_ERROR", "Invalid status")
    
    # Step 2: Find appointment (atomic read)
    appointment = self.get_appointment_by_id(appointment_id)
    if not appointment:
        return error_response("NOT_FOUND", "Appointment not found")
    
    # Step 3: Atomic update with data integrity
    for i, apt in enumerate(self.appointments):
        if apt.id == appointment_id:
            # Create new immutable appointment object
            updated_appointment = Appointment(
                id=apt.id,
                patient_name=apt.patient_name,
                date=apt.date,
                time=apt.time,
                duration=apt.duration,
                doctor_name=apt.doctor_name,
                status=new_status,  # Only status changes
                mode=apt.mode
            )
            # Atomic replacement in data structure
            self.appointments[i] = updated_appointment
            return updated_appointment
```

#### 2. **Conflict Detection & Prevention**
```python
def _check_time_conflicts(self, doctor_name: str, date: str, time: str, duration: int):
    # Parse appointment times with validation
    new_start = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    new_end = new_start + timedelta(minutes=duration)
    
    conflicts = []
    for appointment in self.appointments:
        if (appointment.doctor_name == doctor_name and 
            appointment.date == date and 
            appointment.status != 'Cancelled'):
            
            existing_start = datetime.strptime(f"{appointment.date} {appointment.time}", "%Y-%m-%d %H:%M")
            existing_end = existing_start + timedelta(minutes=appointment.duration)
            
            # Detect overlapping time slots
            if (new_start < existing_end) and (existing_start < new_end):
                conflicts.append(appointment)
    
    return conflicts
```

#### 3. **Data Validation & Integrity**
```python
def create_appointment(self, payload: Dict):
    # Multi-layer validation ensures data consistency
    
    # Layer 1: Field validation
    is_valid, validation_errors = validate_appointment_data(payload)
    if not is_valid:
        return error_response("VALIDATION_ERROR", validation_errors)
    
    # Layer 2: Business rule validation (conflict detection)
    conflicts = self._check_time_conflicts(...)
    if conflicts:
        return error_response("CONFLICT_ERROR", conflict_details)
    
    # Layer 3: Unique ID generation with collision detection
    new_id = f"apt_{uuid.uuid4().hex[:8]}"
    while self.get_appointment_by_id(new_id) is not None:
        new_id = f"apt_{uuid.uuid4().hex[:8]}"
    
    # Layer 4: Atomic insertion
    new_appointment = Appointment(...)
    self.appointments.append(new_appointment)
    
    return new_appointment
```

## Project Structure

```
SwasthiQ/
├── src/                          # React frontend
│   ├── components/               # Reusable UI components
│   │   ├── AppointmentManagementView.jsx
│   │   ├── AppointmentCard.jsx
│   │   ├── AppointmentForm.jsx
│   │   ├── CalendarWidget.jsx
│   │   └── StatusTabs.jsx
│   ├── services/                 # API integration layer
│   │   └── appointmentService.js
│   ├── App.jsx                   # Main application component
│   └── index.css                 # Global styles and Tailwind
├── backend/                      # Python Flask API
│   ├── appointment_service.py    # Core business logic
│   ├── appointment_validators.py # Data validation utilities
│   ├── api_server.py            # Flask application and routes
│   └── requirements.txt         # Python dependencies
├── tests/                       # Comprehensive test suites
│   ├── frontend/               # React component tests
│   └── backend/                # Python API and logic tests
├── EMR_Frontend__Assignment.jsx # Main assignment file
├── requirements.txt            # Root Python dependencies
├── package.json               # Node.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.js           # Vite build configuration
└── README.md                 # This file
```

## 🚀 Deployment

### Live Production URLs
- **Frontend**: https://swasthi-q.vercel.app (Vercel)
- **Backend**: https://swasthiq.onrender.com (Render)
- **Repository**: https://github.com/shivangiS04/SwasthiQ

### Frontend Deployment (Vercel)
```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Backend Deployment (Render)
```bash
# Automatic deployment from GitHub
# Render detects Python and uses:
# Build Command: pip install -r requirements.txt
# Start Command: python backend/api_server.py
```

### Docker Deployment
```dockerfile
# Dockerfile included in repository
docker build -t swasthiq .
docker run -p 3000:3000 -p 5000:5000 swasthiq
```

## Security & Compliance

SwasthiQ is designed with Indian healthcare security standards in mind:

- **Data Encryption**: All data transmission uses HTTPS/TLS
- **Input Validation**: Comprehensive server-side validation
- **Error Handling**: Secure error messages without data exposure
- **Session Management**: Secure session handling ready for authentication
- **HIPAA Considerations**: Architecture supports healthcare compliance requirements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


#### Submission Guidelines
- **Single Repository**: https://github.com/shivangiS04/SwasthiQ
- **Frontend File**: `EMR_Frontend__Assignment.jsx`
- **Backend File**: `appointment_service.py`
- **Live Link**: https://swasthi-q.vercel.app

---

**Developed with ❤️ by Shivangi Singh for Indian healthcare providers**