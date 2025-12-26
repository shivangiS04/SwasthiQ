# Test file for appointment service
# Property-based tests will be implemented here

import pytest
from hypothesis import given, strategies as st
from datetime import datetime
import sys
import os

# Add backend directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '../../backend'))

from appointment_service import AppointmentService, Appointment

class TestAppointmentService:
    """Test suite for AppointmentService class"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.service = AppointmentService()
    
    def test_service_initialization(self):
        """Test that service initializes correctly"""
        assert isinstance(self.service, AppointmentService)
        assert isinstance(self.service.appointments, list)
        # Should have at least 10 mock appointments as per requirements
        assert len(self.service.appointments) >= 10
    
    # **Feature: emr-appointment-management, Property 1: Appointment display completeness**
    @given(st.integers(min_value=0, max_value=20))
    def test_appointment_display_completeness(self, appointment_index):
        """
        Property test: For any appointment retrieved from the data layer, 
        the rendered output should contain all required fields: 
        patient name, date, time, duration, doctor name, status, and mode
        **Validates: Requirements 1.2**
        """
        # Ensure we have appointments to test
        if not self.service.appointments:
            pytest.skip("No appointments available for testing")
        
        # Get appointment using modulo to stay within bounds
        appointment = self.service.appointments[appointment_index % len(self.service.appointments)]
        
        # Verify all required fields are present and not empty
        assert hasattr(appointment, 'patient_name') and appointment.patient_name
        assert hasattr(appointment, 'date') and appointment.date
        assert hasattr(appointment, 'time') and appointment.time
        assert hasattr(appointment, 'duration') and appointment.duration
        assert hasattr(appointment, 'doctor_name') and appointment.doctor_name
        assert hasattr(appointment, 'status') and appointment.status
        assert hasattr(appointment, 'mode') and appointment.mode
        assert hasattr(appointment, 'id') and appointment.id
        
        # Verify field types are correct
        assert isinstance(appointment.patient_name, str)
        assert isinstance(appointment.date, str)
        assert isinstance(appointment.time, str)
        assert isinstance(appointment.duration, int)
        assert isinstance(appointment.doctor_name, str)
        assert isinstance(appointment.status, str)
        assert isinstance(appointment.mode, str)
        assert isinstance(appointment.id, str)
        
        # Verify field values are reasonable
        assert len(appointment.patient_name.strip()) > 0
        assert len(appointment.date) == 10  # YYYY-MM-DD format
        assert len(appointment.time) == 5   # HH:MM format
        assert appointment.duration > 0
        assert len(appointment.doctor_name.strip()) > 0
        assert appointment.status in ['Confirmed', 'Scheduled', 'Upcoming', 'Cancelled']
    def test_get_appointments_no_filter(self):
        """Test getting all appointments without filters"""
        appointments = self.service.get_appointments()
        assert len(appointments) >= 10
        assert all(isinstance(apt, Appointment) for apt in appointments)
    
    def test_get_appointments_with_date_filter(self):
        """Test filtering appointments by date"""
        # Use a date we know exists in mock data
        test_date = "2024-12-27"
        filtered = self.service.get_appointments({"date": test_date})
        
        # All returned appointments should match the date
        for appointment in filtered:
            assert appointment.date == test_date
    
    def test_get_appointments_with_status_filter(self):
        """Test filtering appointments by status"""
        test_status = "Confirmed"
        filtered = self.service.get_appointments({"status": test_status})
        
        # All returned appointments should match the status
        for appointment in filtered:
            assert appointment.status == test_status
    
    def test_get_appointments_with_doctor_filter(self):
        """Test filtering appointments by doctor name"""
        test_doctor = "Dr. Sarah Johnson"
        filtered = self.service.get_appointments({"doctor_name": test_doctor})
        
        # All returned appointments should match the doctor
        for appointment in filtered:
            assert appointment.doctor_name == test_doctor
    
    # **Feature: emr-appointment-management, Property 2: Date filtering accuracy**
    @given(st.dates(min_value=datetime(2024, 12, 20).date(), max_value=datetime(2025, 1, 10).date()))
    def test_date_filtering_accuracy(self, test_date):
        """
        Property test: For any selected date and appointment dataset, 
        filtering by that date should return only appointments matching the exact date
        **Validates: Requirements 2.1**
        """
        # Convert date to string format
        date_str = test_date.strftime('%Y-%m-%d')
        
        # Get filtered appointments
        filtered_appointments = self.service.get_appointments({"date": date_str})
        
        # Property: All returned appointments must have the exact matching date
        for appointment in filtered_appointments:
            assert appointment.date == date_str, f"Appointment {appointment.id} has date {appointment.date}, expected {date_str}"
        
        # Property: No appointments with different dates should be included
        all_appointments = self.service.get_appointments()
        appointments_with_different_dates = [
            apt for apt in all_appointments 
            if apt.date != date_str
        ]
        
        # Ensure none of the appointments with different dates are in filtered results
        filtered_ids = {apt.id for apt in filtered_appointments}
        different_date_ids = {apt.id for apt in appointments_with_different_dates}
        
        # The intersection should be empty (no overlap)
        assert len(filtered_ids.intersection(different_date_ids)) == 0, \
            "Filtered results contain appointments with different dates"
        
        # Property: If we have appointments for this date, they should all be returned
        expected_appointments = [apt for apt in all_appointments if apt.date == date_str]
        expected_ids = {apt.id for apt in expected_appointments}
        
        assert filtered_ids == expected_ids, \
            f"Filtered results don't match expected appointments for date {date_str}"
    
    def test_create_appointment_valid_data(self):
        """Test creating appointment with valid data"""
        initial_count = len(self.service.appointments)
        
        valid_payload = {
            "patient_name": "Test Patient",
            "date": "2024-12-30",
            "time": "15:00",
            "duration": 30,
            "doctor_name": "Dr. Test Doctor",
            "mode": "In-person"
        }
        
        result = self.service.create_appointment(valid_payload)
        
        # Should return an Appointment object, not an error
        assert isinstance(result, Appointment)
        assert result.patient_name == "Test Patient"
        assert result.date == "2024-12-30"
        assert result.time == "15:00"
        assert result.duration == 30
        assert result.doctor_name == "Dr. Test Doctor"
        assert result.mode == "In-person"
        assert result.status == "Scheduled"  # Default status
        assert result.id.startswith("apt_")
        
        # Should be added to appointments list
        assert len(self.service.appointments) == initial_count + 1
    
    def test_create_appointment_missing_required_field(self):
        """Test creating appointment with missing required field"""
        invalid_payload = {
            "patient_name": "Test Patient",
            "date": "2024-12-30",
            # Missing time field
            "duration": 30,
            "doctor_name": "Dr. Test Doctor",
            "mode": "In-person"
        }
        
        result = self.service.create_appointment(invalid_payload)
        
        # Should return error response
        assert isinstance(result, dict)
        assert result["success"] is False
        assert result["error"]["code"] == "VALIDATION_ERROR"
        assert "time" in str(result["error"]["details"]["validation_errors"])
    
    def test_create_appointment_invalid_mode(self):
        """Test creating appointment with invalid mode"""
        invalid_payload = {
            "patient_name": "Test Patient",
            "date": "2024-12-30",
            "time": "15:00",
            "duration": 30,
            "doctor_name": "Dr. Test Doctor",
            "mode": "Invalid-mode"  # Invalid mode
        }
        
        result = self.service.create_appointment(invalid_payload)
        
        # Should return error response
        assert isinstance(result, dict)
        assert result["success"] is False
        assert result["error"]["code"] == "VALIDATION_ERROR"
    
    def test_create_appointment_custom_status(self):
        """Test creating appointment with custom status"""
        valid_payload = {
            "patient_name": "Test Patient",
            "date": "2024-12-30",
            "time": "15:00",
            "duration": 30,
            "doctor_name": "Dr. Test Doctor",
            "mode": "In-person",
            "status": "Confirmed"
        }
        
        result = self.service.create_appointment(valid_payload)
        
        assert isinstance(result, Appointment)
        assert result.status == "Confirmed"
    
    def test_create_appointment_time_conflict_exact_overlap(self):
        """Test conflict detection for exact time overlap"""
        # Create first appointment
        first_payload = {
            "patient_name": "First Patient",
            "date": "2024-12-30",
            "time": "10:00",
            "duration": 60,
            "doctor_name": "Dr. Conflict Test",
            "mode": "In-person"
        }
        
        first_result = self.service.create_appointment(first_payload)
        assert isinstance(first_result, Appointment)
        
        # Try to create conflicting appointment (exact same time)
        conflict_payload = {
            "patient_name": "Second Patient",
            "date": "2024-12-30",
            "time": "10:00",  # Same time
            "duration": 30,
            "doctor_name": "Dr. Conflict Test",  # Same doctor
            "mode": "Virtual"
        }
        
        result = self.service.create_appointment(conflict_payload)
        
        # Should return conflict error
        assert isinstance(result, dict)
        assert result["success"] is False
        assert result["error"]["code"] == "CONFLICT_ERROR"
        assert "Time conflict detected" in result["error"]["message"]
    
    def test_create_appointment_time_conflict_partial_overlap(self):
        """Test conflict detection for partial time overlap"""
        # Create first appointment: 10:00-11:00
        first_payload = {
            "patient_name": "First Patient",
            "date": "2024-12-30",
            "time": "10:00",
            "duration": 60,
            "doctor_name": "Dr. Overlap Test",
            "mode": "In-person"
        }
        
        first_result = self.service.create_appointment(first_payload)
        assert isinstance(first_result, Appointment)
        
        # Try to create overlapping appointment: 10:30-11:30
        overlap_payload = {
            "patient_name": "Second Patient",
            "date": "2024-12-30",
            "time": "10:30",  # Overlaps with first appointment
            "duration": 60,
            "doctor_name": "Dr. Overlap Test",  # Same doctor
            "mode": "Virtual"
        }
        
        result = self.service.create_appointment(overlap_payload)
        
        # Should return conflict error
        assert isinstance(result, dict)
        assert result["success"] is False
        assert result["error"]["code"] == "CONFLICT_ERROR"
    
    def test_create_appointment_no_conflict_different_doctor(self):
        """Test no conflict when different doctors have same time"""
        # Create first appointment
        first_payload = {
            "patient_name": "First Patient",
            "date": "2024-12-30",
            "time": "10:00",
            "duration": 60,
            "doctor_name": "Dr. First Doctor",
            "mode": "In-person"
        }
        
        first_result = self.service.create_appointment(first_payload)
        assert isinstance(first_result, Appointment)
        
        # Create appointment with different doctor at same time
        second_payload = {
            "patient_name": "Second Patient",
            "date": "2024-12-30",
            "time": "10:00",  # Same time
            "duration": 60,
            "doctor_name": "Dr. Second Doctor",  # Different doctor
            "mode": "Virtual"
        }
        
        result = self.service.create_appointment(second_payload)
        
        # Should succeed (no conflict)
        assert isinstance(result, Appointment)
    
    def test_create_appointment_no_conflict_different_date(self):
        """Test no conflict when same doctor has appointment on different date"""
        # Create first appointment
        first_payload = {
            "patient_name": "First Patient",
            "date": "2024-12-30",
            "time": "10:00",
            "duration": 60,
            "doctor_name": "Dr. Date Test",
            "mode": "In-person"
        }
        
        first_result = self.service.create_appointment(first_payload)
        assert isinstance(first_result, Appointment)
        
        # Create appointment with same doctor on different date
        second_payload = {
            "patient_name": "Second Patient",
            "date": "2024-12-31",  # Different date
            "time": "10:00",  # Same time
            "duration": 60,
            "doctor_name": "Dr. Date Test",  # Same doctor
            "mode": "Virtual"
        }
        
        result = self.service.create_appointment(second_payload)
        
        # Should succeed (no conflict)
        assert isinstance(result, Appointment)
    
    def test_create_appointment_no_conflict_adjacent_times(self):
        """Test no conflict when appointments are adjacent (back-to-back)"""
        # Create first appointment: 10:00-11:00
        first_payload = {
            "patient_name": "First Patient",
            "date": "2024-12-30",
            "time": "10:00",
            "duration": 60,
            "doctor_name": "Dr. Adjacent Test",
            "mode": "In-person"
        }
        
        first_result = self.service.create_appointment(first_payload)
        assert isinstance(first_result, Appointment)
        
        # Create adjacent appointment: 11:00-12:00
        second_payload = {
            "patient_name": "Second Patient",
            "date": "2024-12-30",
            "time": "11:00",  # Starts when first ends
            "duration": 60,
            "doctor_name": "Dr. Adjacent Test",  # Same doctor
            "mode": "Virtual"
        }
        
        result = self.service.create_appointment(second_payload)
        
        # Should succeed (no overlap)
        assert isinstance(result, Appointment)
    
    # **Feature: emr-appointment-management, Property 5: Appointment creation validation**
    @given(
        patient_name=st.text(min_size=2, max_size=100).filter(lambda x: len(x.strip()) >= 2),
        date=st.dates(min_value=datetime(2024, 1, 1).date(), max_value=datetime(2025, 12, 31).date()),
        time=st.times(),
        duration=st.integers(min_value=1, max_value=480),
        doctor_name=st.text(min_size=2, max_size=100).filter(lambda x: len(x.strip()) >= 2),
        mode=st.sampled_from(['In-person', 'Virtual', 'Phone'])
    )
    def test_appointment_creation_validation_property(self, patient_name, date, time, duration, doctor_name, mode):
        """
        Property test: For any appointment creation request, the system should accept 
        only requests with all required fields and reject incomplete requests
        **Validates: Requirements 5.2**
        """
        # Create a valid payload with all required fields
        valid_payload = {
            "patient_name": patient_name,
            "date": date.strftime('%Y-%m-%d'),
            "time": time.strftime('%H:%M'),
            "duration": duration,
            "doctor_name": doctor_name,
            "mode": mode
        }
        
        # This should succeed (all required fields present and valid)
        result = self.service.create_appointment(valid_payload)
        
        # Should return an Appointment object, not an error
        assert isinstance(result, Appointment), f"Valid payload was rejected: {result}"
        
        # Verify all fields are correctly set
        assert result.patient_name == patient_name.strip()
        assert result.date == date.strftime('%Y-%m-%d')
        assert result.time == time.strftime('%H:%M')
        assert result.duration == duration
        assert result.doctor_name == doctor_name.strip()
        assert result.mode == mode
        assert result.status == "Scheduled"  # Default status
        assert result.id.startswith("apt_")
        
        # Now test that removing each required field causes rejection
        required_fields = ["patient_name", "date", "time", "duration", "doctor_name", "mode"]
        
        for field_to_remove in required_fields:
            incomplete_payload = valid_payload.copy()
            del incomplete_payload[field_to_remove]
            
            result = self.service.create_appointment(incomplete_payload)
            
            # Should return error response
            assert isinstance(result, dict), f"Missing {field_to_remove} was not rejected"
            assert result["success"] is False, f"Missing {field_to_remove} should fail validation"
            assert result["error"]["code"] == "VALIDATION_ERROR", f"Missing {field_to_remove} should be validation error"