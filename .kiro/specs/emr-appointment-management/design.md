# EMR Appointment Management System Design

## Overview

The EMR Appointment Management System is a full-stack web application that provides healthcare providers with comprehensive appointment scheduling and management capabilities. The system consists of a React frontend with Tailwind CSS styling and a Python backend service that simulates GraphQL/AppSync functionality with a mock PostgreSQL data layer.

The architecture follows a clean separation between presentation (React components), business logic (Python service layer), and data persistence (mock data structures), enabling maintainable and testable code that can easily transition to production infrastructure.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Python Backend  │    │  Mock Data      │
│   (UI Layer)     │◄──►│  (Service Layer) │◄──►│  (Data Layer)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Architecture

- **Frontend Layer**: React components with hooks for state management, Tailwind CSS for styling
- **Service Layer**: Python classes and functions that handle business logic and data operations
- **Data Layer**: In-memory Python data structures simulating PostgreSQL database operations
- **Integration Layer**: Direct function calls between frontend and backend (simulating API calls)

## Components and Interfaces

### Frontend Components

#### AppointmentManagementView
- **Purpose**: Main container component for the appointment management interface
- **State Management**: Uses React hooks (useState, useEffect) for local state
- **Key Features**: Initializes data fetching, manages selected date and tab filters

#### CalendarWidget
- **Purpose**: Interactive date selection component
- **Interface**: Receives click handlers and selected date state
- **Behavior**: Triggers date-based filtering when dates are clicked

#### StatusTabs
- **Purpose**: Tab navigation for filtering appointments by status
- **States**: Upcoming, Today, Past
- **Interface**: Receives active tab state and click handlers

#### AppointmentCard
- **Purpose**: Individual appointment display component
- **Data**: Shows patient name, date, time, duration, doctor, status, mode
- **Actions**: Provides status update and delete functionality

#### AppointmentForm
- **Purpose**: Modal form for creating new appointments
- **Validation**: Client-side validation for required fields
- **Integration**: Calls backend create_appointment function

### Backend Service Interface

#### AppointmentService Class

```python
class AppointmentService:
    def get_appointments(self, filters: dict) -> List[Appointment]
    def create_appointment(self, payload: dict) -> Appointment
    def update_appointment_status(self, id: str, new_status: str) -> Appointment
    def delete_appointment(self, id: str) -> bool
```

#### Data Transfer Objects

```python
@dataclass
class Appointment:
    id: str
    patient_name: str
    date: str
    time: str
    duration: int
    doctor_name: str
    status: str  # Confirmed, Scheduled, Upcoming, Cancelled
    mode: str    # In-person, Virtual, Phone
```

## Data Models

### Appointment Entity

```python
{
    "id": "unique_string_identifier",
    "patient_name": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "duration": "integer_minutes",
    "doctor_name": "string",
    "status": "Confirmed|Scheduled|Upcoming|Cancelled",
    "mode": "In-person|Virtual|Phone"
}
```

### Filter Parameters

```python
{
    "date": "YYYY-MM-DD (optional)",
    "status": "string (optional)",
    "doctor_name": "string (optional)"
}
```

### Create Appointment Input

```python
{
    "patient_name": "string (required)",
    "date": "YYYY-MM-DD (required)",
    "time": "HH:MM (required)",
    "duration": "integer (required)",
    "doctor_name": "string (required)",
    "mode": "string (required)",
    "status": "string (optional, defaults to 'Scheduled')"
}
```

## Correctness Properties