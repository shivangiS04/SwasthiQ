# SwasthiQ Appointment Management System - Backend Service

from dataclasses import dataclass
from typing import List, Dict, Optional, Union
from datetime import datetime, date, time
import uuid
from appointment_validators import validate_appointment_data, validate_status_value

@dataclass
class Appointment:
    id: str
    patient_name: str
    date: str
    time: str
    duration: int
    doctor_name: str
    status: str
    mode: str

class AppointmentService:
    def __init__(self):
        self.appointments: List[Appointment] = []
        self._initialize_mock_data()
    
    def _create_error_response(self, code: str, message: str, details: Optional[Dict] = None) -> Dict:
        return {
            "success": False,
            "error": {
                "code": code,
                "message": message,
                "details": details or {}
            }
        }
    
    def _create_success_response(self, data: Union[Appointment, List[Appointment], bool]) -> Dict:
        return {
            "success": True,
            "data": data
        }
    
    def _initialize_mock_data(self):
        mock_appointments = [
            Appointment(
                id="apt_001",
                patient_name="John Smith",
                date="2024-12-27",
                time="09:00",
                duration=30,
                doctor_name="Dr. Sarah Johnson",
                status="Confirmed",
                mode="In-person"
            ),
            Appointment(
                id="apt_002",
                patient_name="Emily Davis",
                date="2024-12-27",
                time="10:30",
                duration=45,
                doctor_name="Dr. Michael Chen",
                status="Scheduled",
                mode="Virtual"
            ),
            Appointment(
                id="apt_003",
                patient_name="Robert Wilson",
                date="2024-12-28",
                time="14:00",
                duration=60,
                doctor_name="Dr. Sarah Johnson",
                status="Upcoming",
                mode="In-person"
            ),
            Appointment(
                id="apt_004",
                patient_name="Lisa Anderson",
                date="2024-12-26",
                time="11:15",
                duration=30,
                doctor_name="Dr. James Rodriguez",
                status="Confirmed",
                mode="Phone"
            ),
            Appointment(
                id="apt_005",
                patient_name="David Brown",
                date="2024-12-29",
                time="08:30",
                duration=45,
                doctor_name="Dr. Michael Chen",
                status="Scheduled",
                mode="Virtual"
            ),
            Appointment(
                id="apt_006",
                patient_name="Jennifer Taylor",
                date="2024-12-26",
                time="15:45",
                duration=30,
                doctor_name="Dr. Sarah Johnson",
                status="Cancelled",
                mode="In-person"
            ),
            Appointment(
                id="apt_007",
                patient_name="Mark Thompson",
                date="2024-12-30",
                time="13:00",
                duration=60,
                doctor_name="Dr. James Rodriguez",
                status="Upcoming",
                mode="In-person"
            ),
            Appointment(
                id="apt_008",
                patient_name="Amanda White",
                date="2024-12-27",
                time="16:30",
                duration=30,
                doctor_name="Dr. Michael Chen",
                status="Confirmed",
                mode="Virtual"
            ),
            Appointment(
                id="apt_009",
                patient_name="Christopher Lee",
                date="2024-12-25",
                time="10:00",
                duration=45,
                doctor_name="Dr. Sarah Johnson",
                status="Confirmed",
                mode="Phone"
            ),
            Appointment(
                id="apt_010",
                patient_name="Michelle Garcia",
                date="2024-12-28",
                time="09:15",
                duration=30,
                doctor_name="Dr. James Rodriguez",
                status="Scheduled",
                mode="In-person"
            ),
            Appointment(
                id="apt_011",
                patient_name="Kevin Martinez",
                date="2024-12-31",
                time="11:00",
                duration=60,
                doctor_name="Dr. Michael Chen",
                status="Upcoming",
                mode="Virtual"
            ),
            Appointment(
                id="apt_012",
                patient_name="Rachel Clark",
                date="2024-12-26",
                time="14:30",
                duration=45,
                doctor_name="Dr. Sarah Johnson",
                status="Confirmed",
                mode="In-person"
            )
        ]
        
        self.appointments = mock_appointments
    
    def get_appointments(self, filters: Optional[Dict] = None) -> List[Appointment]:
        """
        Retrieve appointments with optional filtering
        
        Args:
            filters: Optional dictionary with keys: date, status, doctor_name
            
        Returns:
            List of appointments matching the filters
        """
        if not filters:
            return self.appointments.copy()
        
        filtered_appointments = self.appointments.copy()
        
        # Filter by date if provided
        if 'date' in filters and filters['date']:
            filtered_appointments = [
                apt for apt in filtered_appointments 
                if apt.date == filters['date']
            ]
        
        # Filter by status if provided
        if 'status' in filters and filters['status']:
            filtered_appointments = [
                apt for apt in filtered_appointments 
                if apt.status == filters['status']
            ]
        
        # Filter by doctor name if provided
        if 'doctor_name' in filters and filters['doctor_name']:
            filtered_appointments = [
                apt for apt in filtered_appointments 
                if apt.doctor_name == filters['doctor_name']
            ]
        
        return filtered_appointments
    
    def get_appointment_by_id(self, appointment_id: str) -> Optional[Appointment]:
        """
        Find an appointment by its ID
        
        Args:
            appointment_id: Unique identifier of the appointment
            
        Returns:
            Appointment object if found, None otherwise
        """
        for appointment in self.appointments:
            if appointment.id == appointment_id:
                return appointment
        return None
    
    def _check_time_conflicts(self, doctor_name: str, date: str, time: str, duration: int, exclude_id: Optional[str] = None) -> List[Appointment]:
        """
        Check for time conflicts with existing appointments
        
        Args:
            doctor_name: Name of the doctor
            date: Appointment date (YYYY-MM-DD)
            time: Appointment time (HH:MM)
            duration: Appointment duration in minutes
            exclude_id: Optional appointment ID to exclude from conflict check (for updates)
            
        Returns:
            List of conflicting appointments
        """
        from datetime import datetime, timedelta
        
        # Parse the new appointment time
        try:
            new_start = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
            new_end = new_start + timedelta(minutes=duration)
        except ValueError:
            return []  # Invalid time format, will be caught by validation
        
        conflicts = []
        
        # Check all existing appointments for the same doctor on the same date
        for appointment in self.appointments:
            # Skip if this is the appointment being updated
            if exclude_id and appointment.id == exclude_id:
                continue
                
            # Only check appointments for the same doctor and date
            if appointment.doctor_name != doctor_name or appointment.date != date:
                continue
            
            # Skip cancelled appointments (they don't cause conflicts)
            if appointment.status == 'Cancelled':
                continue
            
            try:
                # Parse existing appointment time
                existing_start = datetime.strptime(f"{appointment.date} {appointment.time}", "%Y-%m-%d %H:%M")
                existing_end = existing_start + timedelta(minutes=appointment.duration)
                
                # Check for overlap: appointments overlap if one starts before the other ends
                if (new_start < existing_end) and (existing_start < new_end):
                    conflicts.append(appointment)
                    
            except ValueError:
                # Skip appointments with invalid time formats
                continue
        
        return conflicts
    
    def create_appointment(self, payload: Dict) -> Union[Appointment, Dict]:
        """
        Create a new appointment with validation and conflict detection
        
        Args:
            payload: Dictionary containing appointment data
            
        Returns:
            Created appointment object or error response
        """
        # Step 1: Validate required fields and formats
        is_valid, validation_errors = validate_appointment_data(payload)
        if not is_valid:
            return self._create_error_response(
                "VALIDATION_ERROR",
                "Invalid appointment data",
                {"validation_errors": validation_errors}
            )
        
        # Step 2: Generate unique appointment ID
        new_id = f"apt_{uuid.uuid4().hex[:8]}"
        
        # Ensure ID is truly unique (very unlikely collision, but good practice)
        while self.get_appointment_by_id(new_id) is not None:
            new_id = f"apt_{uuid.uuid4().hex[:8]}"
        
        # Step 3: Set default status if not provided
        status = payload.get('status', 'Scheduled')
        if not validate_status_value(status):
            return self._create_error_response(
                "VALIDATION_ERROR",
                f"Invalid status value: {status}",
                {"valid_statuses": ['Confirmed', 'Scheduled', 'Upcoming', 'Cancelled']}
            )
        
        # Step 4: Check for time conflicts
        conflicts = self._check_time_conflicts(
            payload['doctor_name'].strip(),
            payload['date'],
            payload['time'],
            payload['duration']
        )
        
        if conflicts:
            conflict_details = []
            for conflict in conflicts:
                conflict_details.append({
                    "id": conflict.id,
                    "patient_name": conflict.patient_name,
                    "time": conflict.time,
                    "duration": conflict.duration
                })
            
            return self._create_error_response(
                "CONFLICT_ERROR",
                f"Time conflict detected for Dr. {payload['doctor_name']} on {payload['date']}",
                {
                    "conflicting_appointments": conflict_details,
                    "requested_time": payload['time'],
                    "requested_duration": payload['duration']
                }
            )
        
        # Step 5: Create the appointment object
        new_appointment = Appointment(
            id=new_id,
            patient_name=payload['patient_name'].strip(),
            date=payload['date'],
            time=payload['time'],
            duration=payload['duration'],
            doctor_name=payload['doctor_name'].strip(),
            status=status,
            mode=payload['mode']
        )
        
        # Step 6: Add to appointments list
        self.appointments.append(new_appointment)
        
        return new_appointment
    
    def update_appointment_status(self, appointment_id: str, new_status: str) -> Union[Appointment, Dict]:
        """
        Update the status of an existing appointment
        
        Args:
            appointment_id: Unique identifier of the appointment
            new_status: New status value
            
        Returns:
            Updated appointment object or error response
        """
        # Step 1: Validate the new status value
        if not validate_status_value(new_status):
            return self._create_error_response(
                "VALIDATION_ERROR",
                f"Invalid status value: {new_status}",
                {"valid_statuses": ['Confirmed', 'Scheduled', 'Upcoming', 'Cancelled']}
            )
        
        # Step 2: Find the appointment by ID
        appointment = self.get_appointment_by_id(appointment_id)
        if appointment is None:
            return self._create_error_response(
                "NOT_FOUND",
                f"Appointment with ID {appointment_id} not found",
                {"appointment_id": appointment_id}
            )
        
        # Step 3: Update the status in the mock data layer
        # In a real system, this would trigger an AppSync Subscription
        # and perform an Aurora transactional write
        for i, apt in enumerate(self.appointments):
            if apt.id == appointment_id:
                # Create a new appointment object with updated status
                updated_appointment = Appointment(
                    id=apt.id,
                    patient_name=apt.patient_name,
                    date=apt.date,
                    time=apt.time,
                    duration=apt.duration,
                    doctor_name=apt.doctor_name,
                    status=new_status,  # Updated status
                    mode=apt.mode
                )
                
                # Replace the appointment in the list
                self.appointments[i] = updated_appointment
                
                # In a real system, this is where we would:
                # 1. Execute Aurora transactional write: UPDATE appointments SET status = ? WHERE id = ?
                # 2. Trigger AppSync subscription to notify connected clients
                # 3. Log the status change for audit purposes
                
                return updated_appointment
        
        # This should never happen since we already checked if appointment exists
        return self._create_error_response(
            "NOT_FOUND",
            f"Appointment with ID {appointment_id} not found during update",
            {"appointment_id": appointment_id}
        )
    
    def delete_appointment(self, appointment_id: str) -> bool:
        """
        Delete an appointment from the system
        
        Args:
            appointment_id: Unique identifier of the appointment
            
        Returns:
            Boolean indicating success of deletion
        """
        # Step 1: Find the appointment by ID
        appointment = self.get_appointment_by_id(appointment_id)
        if appointment is None:
            # Handle deletion of non-existent appointments gracefully
            # In some systems, this might be considered successful (idempotent)
            # But for clarity, we'll return False to indicate nothing was deleted
            return False
        
        # Step 2: Remove the appointment from the mock data layer
        # In a real system, this would:
        # 1. Execute Aurora transactional delete: DELETE FROM appointments WHERE id = ?
        # 2. Trigger AppSync subscription to notify connected clients
        # 3. Log the deletion for audit purposes
        # 4. Potentially archive the appointment instead of hard delete
        
        initial_count = len(self.appointments)
        self.appointments = [apt for apt in self.appointments if apt.id != appointment_id]
        final_count = len(self.appointments)
        
        # Verify that exactly one appointment was removed
        deleted_count = initial_count - final_count
        return deleted_count == 1