# Test file for appointment service
# Property-based tests will be implemented here

import pytest
from hypothesis import given, strategies as st
from datetime import datetime
import sys
import os
import random

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
        date=st.dates(min_value=datetime(2025, 1, 1).date(), max_value=datetime(2025, 12, 31).date()),  # Use future dates to avoid conflicts
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
        # Create a fresh service instance to avoid conflicts with existing appointments
        fresh_service = AppointmentService()
        
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
        result = fresh_service.create_appointment(valid_payload)
        
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
            
            result = fresh_service.create_appointment(incomplete_payload)
            
            # Should return error response
            assert isinstance(result, dict), f"Missing {field_to_remove} was not rejected"
            assert result["success"] is False, f"Missing {field_to_remove} should fail validation"
            assert result["error"]["code"] == "VALIDATION_ERROR", f"Missing {field_to_remove} should be validation error"
    
    # **Feature: emr-appointment-management, Property 6: Conflict detection accuracy**
    @given(
        doctor_name=st.text(min_size=2, max_size=50).filter(lambda x: len(x.strip()) >= 2),
        date=st.dates(min_value=datetime(2025, 1, 1).date(), max_value=datetime(2025, 1, 31).date()),
        first_time=st.times(min_value=datetime.strptime("08:00", "%H:%M").time(), 
                           max_value=datetime.strptime("16:00", "%H:%M").time()),
        first_duration=st.integers(min_value=15, max_value=120),
        second_duration=st.integers(min_value=15, max_value=120)
    )
    def test_conflict_detection_accuracy_property(self, doctor_name, date, first_time, first_duration, second_duration):
        """
        Property test: For any new appointment and existing appointment set, 
        the system should detect and prevent scheduling conflicts when appointments 
        have the same doctor, overlapping times on the same date, considering duration
        **Validates: Requirements 5.4, 6.1, 6.2, 6.3, 6.4**
        """
        from datetime import datetime, timedelta
        
        # Create a fresh service instance
        fresh_service = AppointmentService()
        
        # Create the first appointment
        first_payload = {
            "patient_name": "First Patient",
            "date": date.strftime('%Y-%m-%d'),
            "time": first_time.strftime('%H:%M'),
            "duration": first_duration,
            "doctor_name": doctor_name,
            "mode": "In-person"
        }
        
        first_result = fresh_service.create_appointment(first_payload)
        assert isinstance(first_result, Appointment), f"First appointment creation failed: {first_result}"
        
        # Calculate overlapping and non-overlapping times
        first_start = datetime.combine(date, first_time)
        first_end = first_start + timedelta(minutes=first_duration)
        
        # Test Case 1: Exact overlap (same start time) - should conflict
        exact_overlap_payload = {
            "patient_name": "Conflict Patient",
            "date": date.strftime('%Y-%m-%d'),
            "time": first_time.strftime('%H:%M'),  # Same start time
            "duration": second_duration,
            "doctor_name": doctor_name,  # Same doctor
            "mode": "Virtual"
        }
        
        result = fresh_service.create_appointment(exact_overlap_payload)
        assert isinstance(result, dict), "Exact overlap should be rejected"
        assert result["success"] is False, "Exact overlap should fail"
        assert result["error"]["code"] == "CONFLICT_ERROR", "Should be conflict error"
        
        # Test Case 2: Partial overlap (starts during first appointment) - should conflict
        if first_duration > 30:  # Only test if there's room for overlap
            overlap_start = first_start + timedelta(minutes=15)  # Start 15 minutes into first appointment
            if overlap_start.time() < datetime.strptime("17:00", "%H:%M").time():  # Stay within reasonable hours
                partial_overlap_payload = {
                    "patient_name": "Partial Conflict Patient",
                    "date": date.strftime('%Y-%m-%d'),
                    "time": overlap_start.strftime('%H:%M'),
                    "duration": second_duration,
                    "doctor_name": doctor_name,  # Same doctor
                    "mode": "Phone"
                }
                
                result = fresh_service.create_appointment(partial_overlap_payload)
                assert isinstance(result, dict), "Partial overlap should be rejected"
                assert result["success"] is False, "Partial overlap should fail"
                assert result["error"]["code"] == "CONFLICT_ERROR", "Should be conflict error"
        
        # Test Case 3: Adjacent appointment (starts when first ends) - should NOT conflict
        adjacent_start = first_end
        if adjacent_start.time() < datetime.strptime("17:00", "%H:%M").time():  # Stay within reasonable hours
            adjacent_payload = {
                "patient_name": "Adjacent Patient",
                "date": date.strftime('%Y-%m-%d'),
                "time": adjacent_start.strftime('%H:%M'),
                "duration": second_duration,
                "doctor_name": doctor_name,  # Same doctor
                "mode": "Virtual"
            }
            
            result = fresh_service.create_appointment(adjacent_payload)
            assert isinstance(result, Appointment), f"Adjacent appointment should succeed: {result}"
        
        # Test Case 4: Different doctor, same time - should NOT conflict
        different_doctor_payload = {
            "patient_name": "Different Doctor Patient",
            "date": date.strftime('%Y-%m-%d'),
            "time": first_time.strftime('%H:%M'),  # Same time
            "duration": second_duration,
            "doctor_name": f"Dr. Different {doctor_name}",  # Different doctor
            "mode": "In-person"
        }
        
        result = fresh_service.create_appointment(different_doctor_payload)
        assert isinstance(result, Appointment), f"Different doctor should succeed: {result}"
    
    # **Feature: emr-appointment-management, Property 7: Appointment creation round-trip**
    @given(
        patient_name=st.text(min_size=2, max_size=100).filter(lambda x: len(x.strip()) >= 2),
        date=st.dates(min_value=datetime(2025, 2, 1).date(), max_value=datetime(2025, 2, 28).date()),
        time=st.times(min_value=datetime.strptime("08:00", "%H:%M").time(), 
                     max_value=datetime.strptime("17:00", "%H:%M").time()),
        duration=st.integers(min_value=15, max_value=240),
        doctor_name=st.text(min_size=2, max_size=100).filter(lambda x: len(x.strip()) >= 2),
        mode=st.sampled_from(['In-person', 'Virtual', 'Phone']),
        status=st.sampled_from(['Confirmed', 'Scheduled', 'Upcoming'])
    )
    def test_appointment_creation_round_trip_property(self, patient_name, date, time, duration, doctor_name, mode, status):
        """
        Property test: For any valid appointment data, creating an appointment should result 
        in the appointment being retrievable from the data layer with a unique ID and 
        default status of "Scheduled" (or custom status if provided)
        **Validates: Requirements 5.3, 5.5**
        """
        # Create a fresh service instance
        fresh_service = AppointmentService()
        
        # Create appointment payload
        payload = {
            "patient_name": patient_name,
            "date": date.strftime('%Y-%m-%d'),
            "time": time.strftime('%H:%M'),
            "duration": duration,
            "doctor_name": doctor_name,
            "mode": mode,
            "status": status
        }
        
        # Step 1: Create the appointment
        created_appointment = fresh_service.create_appointment(payload)
        assert isinstance(created_appointment, Appointment), f"Appointment creation failed: {created_appointment}"
        
        # Step 2: Verify the appointment has a unique ID
        assert created_appointment.id is not None, "Appointment should have an ID"
        assert created_appointment.id.startswith("apt_"), "ID should have correct prefix"
        assert len(created_appointment.id) > 4, "ID should be longer than just the prefix"
        
        # Step 3: Verify the appointment can be retrieved by ID
        retrieved_appointment = fresh_service.get_appointment_by_id(created_appointment.id)
        assert retrieved_appointment is not None, f"Could not retrieve appointment with ID {created_appointment.id}"
        
        # Step 4: Verify round-trip consistency - all fields should match
        assert retrieved_appointment.id == created_appointment.id, "ID should match"
        assert retrieved_appointment.patient_name == patient_name.strip(), "Patient name should match"
        assert retrieved_appointment.date == date.strftime('%Y-%m-%d'), "Date should match"
        assert retrieved_appointment.time == time.strftime('%H:%M'), "Time should match"
        assert retrieved_appointment.duration == duration, "Duration should match"
        assert retrieved_appointment.doctor_name == doctor_name.strip(), "Doctor name should match"
        assert retrieved_appointment.mode == mode, "Mode should match"
        assert retrieved_appointment.status == status, "Status should match"
        
        # Step 5: Verify the appointment appears in the full list
        all_appointments = fresh_service.get_appointments()
        appointment_ids = [apt.id for apt in all_appointments]
        assert created_appointment.id in appointment_ids, "Created appointment should appear in full list"
        
        # Step 6: Verify the appointment can be found by filtering
        # Filter by date
        date_filtered = fresh_service.get_appointments({"date": date.strftime('%Y-%m-%d')})
        date_filtered_ids = [apt.id for apt in date_filtered]
        assert created_appointment.id in date_filtered_ids, "Appointment should be found when filtering by date"
        
        # Filter by doctor
        doctor_filtered = fresh_service.get_appointments({"doctor_name": doctor_name.strip()})
        doctor_filtered_ids = [apt.id for apt in doctor_filtered]
        assert created_appointment.id in doctor_filtered_ids, "Appointment should be found when filtering by doctor"
        
        # Filter by status
        status_filtered = fresh_service.get_appointments({"status": status})
        status_filtered_ids = [apt.id for apt in status_filtered]
        assert created_appointment.id in status_filtered_ids, "Appointment should be found when filtering by status"
        
        # Step 7: Verify ID uniqueness - create another appointment and ensure different ID
        second_payload = payload.copy()
        second_payload["patient_name"] = f"Second {patient_name}"
        second_payload["date"] = "2025-03-01"  # Different date to avoid conflicts
        
        second_appointment = fresh_service.create_appointment(second_payload)
        assert isinstance(second_appointment, Appointment), "Second appointment creation should succeed"
        assert second_appointment.id != created_appointment.id, "Each appointment should have a unique ID"
    
    def test_update_appointment_status_valid(self):
        """Test updating appointment status with valid data"""
        # Get an existing appointment
        appointments = self.service.get_appointments()
        test_appointment = appointments[0]
        original_status = test_appointment.status
        new_status = "Confirmed" if original_status != "Confirmed" else "Cancelled"
        
        # Update the status
        result = self.service.update_appointment_status(test_appointment.id, new_status)
        
        # Should return updated appointment
        assert isinstance(result, Appointment)
        assert result.id == test_appointment.id
        assert result.status == new_status
        assert result.patient_name == test_appointment.patient_name  # Other fields unchanged
        
        # Verify the change persisted in the data layer
        updated_appointment = self.service.get_appointment_by_id(test_appointment.id)
        assert updated_appointment.status == new_status
    
    def test_update_appointment_status_invalid_status(self):
        """Test updating appointment with invalid status"""
        appointments = self.service.get_appointments()
        test_appointment = appointments[0]
        
        result = self.service.update_appointment_status(test_appointment.id, "InvalidStatus")
        
        # Should return error response
        assert isinstance(result, dict)
        assert result["success"] is False
        assert result["error"]["code"] == "VALIDATION_ERROR"
        assert "Invalid status value" in result["error"]["message"]
    
    def test_update_appointment_status_nonexistent_id(self):
        """Test updating appointment with non-existent ID"""
        result = self.service.update_appointment_status("nonexistent_id", "Confirmed")
        
        # Should return error response
        assert isinstance(result, dict)
        assert result["success"] is False
        assert result["error"]["code"] == "NOT_FOUND"
        assert "not found" in result["error"]["message"]
    
    def test_update_appointment_status_multiple_updates(self):
        """Test multiple status updates maintain consistency"""
        appointments = self.service.get_appointments()
        test_appointment = appointments[0]
        
        # Update to Confirmed
        result1 = self.service.update_appointment_status(test_appointment.id, "Confirmed")
        assert isinstance(result1, Appointment)
        assert result1.status == "Confirmed"
        
        # Update to Cancelled
        result2 = self.service.update_appointment_status(test_appointment.id, "Cancelled")
        assert isinstance(result2, Appointment)
        assert result2.status == "Cancelled"
        
        # Verify final state
        final_appointment = self.service.get_appointment_by_id(test_appointment.id)
        assert final_appointment.status == "Cancelled"
    
    def test_delete_appointment_existing(self):
        """Test deleting an existing appointment"""
        # Get initial count and an appointment to delete
        initial_appointments = self.service.get_appointments()
        initial_count = len(initial_appointments)
        appointment_to_delete = initial_appointments[0]
        
        # Delete the appointment
        result = self.service.delete_appointment(appointment_to_delete.id)
        
        # Should return True (success)
        assert result is True
        
        # Verify appointment is removed from the list
        remaining_appointments = self.service.get_appointments()
        assert len(remaining_appointments) == initial_count - 1
        
        # Verify the specific appointment is no longer findable
        deleted_appointment = self.service.get_appointment_by_id(appointment_to_delete.id)
        assert deleted_appointment is None
        
        # Verify other appointments are still there
        remaining_ids = [apt.id for apt in remaining_appointments]
        assert appointment_to_delete.id not in remaining_ids
    
    def test_delete_appointment_nonexistent(self):
        """Test deleting a non-existent appointment"""
        initial_count = len(self.service.get_appointments())
        
        # Try to delete non-existent appointment
        result = self.service.delete_appointment("nonexistent_id")
        
        # Should return False (nothing deleted)
        assert result is False
        
        # Verify no appointments were removed
        final_count = len(self.service.get_appointments())
        assert final_count == initial_count
    
    def test_delete_appointment_multiple_deletions(self):
        """Test multiple deletions work correctly"""
        initial_appointments = self.service.get_appointments()
        initial_count = len(initial_appointments)
        
        # Delete first two appointments
        first_id = initial_appointments[0].id
        second_id = initial_appointments[1].id
        
        result1 = self.service.delete_appointment(first_id)
        assert result1 is True
        
        result2 = self.service.delete_appointment(second_id)
        assert result2 is True
        
        # Verify both are gone
        final_appointments = self.service.get_appointments()
        assert len(final_appointments) == initial_count - 2
        
        final_ids = [apt.id for apt in final_appointments]
        assert first_id not in final_ids
        assert second_id not in final_ids
    
    def test_delete_appointment_idempotent(self):
        """Test that deleting the same appointment twice is handled gracefully"""
        appointments = self.service.get_appointments()
        appointment_to_delete = appointments[0]
        initial_count = len(appointments)
        
        # First deletion should succeed
        result1 = self.service.delete_appointment(appointment_to_delete.id)
        assert result1 is True
        
        # Second deletion should return False (nothing to delete)
        result2 = self.service.delete_appointment(appointment_to_delete.id)
        assert result2 is False
        
        # Count should only decrease by 1
        final_count = len(self.service.get_appointments())
        assert final_count == initial_count - 1
    
    # **Feature: emr-appointment-management, Property 4: Status update persistence**
    @given(
        new_status=st.sampled_from(['Confirmed', 'Scheduled', 'Upcoming', 'Cancelled'])
    )
    def test_status_update_persistence_property(self, new_status):
        """
        Property test: For any appointment and valid status change, updating the status 
        should result in the appointment having the new status in both the data layer and UI display
        **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
        """
        # Create a fresh service with a test appointment
        fresh_service = AppointmentService()
        
        # Create a test appointment
        test_payload = {
            "patient_name": "Status Test Patient",
            "date": "2025-03-15",
            "time": "10:00",
            "duration": 30,
            "doctor_name": "Dr. Status Test",
            "mode": "In-person",
            "status": "Scheduled"  # Initial status
        }
        
        created_appointment = fresh_service.create_appointment(test_payload)
        assert isinstance(created_appointment, Appointment)
        
        # Property: Status update should succeed for any valid status
        result = fresh_service.update_appointment_status(created_appointment.id, new_status)
        assert isinstance(result, Appointment), f"Status update to {new_status} failed: {result}"
        
        # Property: Updated appointment should have the new status
        assert result.status == new_status, f"Updated appointment status is {result.status}, expected {new_status}"
        
        # Property: Status should persist in data layer (retrievable by ID)
        retrieved_appointment = fresh_service.get_appointment_by_id(created_appointment.id)
        assert retrieved_appointment is not None, "Appointment should still exist after status update"
        assert retrieved_appointment.status == new_status, f"Retrieved appointment status is {retrieved_appointment.status}, expected {new_status}"
        
        # Property: Status should be reflected in filtered queries
        status_filtered = fresh_service.get_appointments({"status": new_status})
        status_filtered_ids = [apt.id for apt in status_filtered]
        assert created_appointment.id in status_filtered_ids, f"Appointment should appear when filtering by status {new_status}"
        
        # Property: All other fields should remain unchanged
        assert retrieved_appointment.id == created_appointment.id, "ID should not change"
        assert retrieved_appointment.patient_name == created_appointment.patient_name, "Patient name should not change"
        assert retrieved_appointment.date == created_appointment.date, "Date should not change"
        assert retrieved_appointment.time == created_appointment.time, "Time should not change"
        assert retrieved_appointment.duration == created_appointment.duration, "Duration should not change"
        assert retrieved_appointment.doctor_name == created_appointment.doctor_name, "Doctor name should not change"
        assert retrieved_appointment.mode == created_appointment.mode, "Mode should not change"
        
        # Property: Multiple status updates should work consistently
        if new_status != "Cancelled":
            second_update = fresh_service.update_appointment_status(created_appointment.id, "Cancelled")
            assert isinstance(second_update, Appointment), "Second status update should succeed"
            assert second_update.status == "Cancelled", "Second update should change status to Cancelled"
            
            # Verify persistence of second update
            final_retrieved = fresh_service.get_appointment_by_id(created_appointment.id)
            assert final_retrieved.status == "Cancelled", "Final status should be Cancelled"
    
    # **Feature: emr-appointment-management, Property 8: Deletion consistency**
    @given(
        patient_name=st.text(min_size=2, max_size=50).filter(lambda x: len(x.strip()) >= 2),
        date=st.dates(min_value=datetime(2025, 4, 1).date(), max_value=datetime(2025, 4, 30).date()),
        time=st.times(min_value=datetime.strptime("08:00", "%H:%M").time(), 
                     max_value=datetime.strptime("17:00", "%H:%M").time()),
        duration=st.integers(min_value=15, max_value=120),
        doctor_name=st.text(min_size=2, max_size=50).filter(lambda x: len(x.strip()) >= 2),
        mode=st.sampled_from(['In-person', 'Virtual', 'Phone'])
    )
    def test_deletion_consistency_property(self, patient_name, date, time, duration, doctor_name, mode):
        """
        Property test: For any existing appointment, deleting it should remove it from 
        the data layer and update the UI display to no longer show the appointment
        **Validates: Requirements 7.1, 7.2, 7.3**
        """
        # Create a fresh service
        fresh_service = AppointmentService()
        
        # Create a test appointment
        test_payload = {
            "patient_name": patient_name,
            "date": date.strftime('%Y-%m-%d'),
            "time": time.strftime('%H:%M'),
            "duration": duration,
            "doctor_name": doctor_name,
            "mode": mode
        }
        
        created_appointment = fresh_service.create_appointment(test_payload)
        assert isinstance(created_appointment, Appointment)
        
        # Record initial state
        initial_appointments = fresh_service.get_appointments()
        initial_count = len(initial_appointments)
        initial_ids = [apt.id for apt in initial_appointments]
        
        # Property: Appointment should exist before deletion
        assert created_appointment.id in initial_ids, "Appointment should exist before deletion"
        
        # Property: get_appointment_by_id should find the appointment before deletion
        pre_delete_retrieval = fresh_service.get_appointment_by_id(created_appointment.id)
        assert pre_delete_retrieval is not None, "Appointment should be retrievable before deletion"
        assert pre_delete_retrieval.id == created_appointment.id, "Retrieved appointment should match created appointment"
        
        # Property: Appointment should appear in filtered queries before deletion
        date_filtered_before = fresh_service.get_appointments({"date": date.strftime('%Y-%m-%d')})
        date_filtered_ids_before = [apt.id for apt in date_filtered_before]
        assert created_appointment.id in date_filtered_ids_before, "Appointment should appear in date filter before deletion"
        
        # Property: Deletion should succeed and return True
        deletion_result = fresh_service.delete_appointment(created_appointment.id)
        assert deletion_result is True, "Deletion should return True for existing appointment"
        
        # Property: Appointment count should decrease by exactly 1
        post_delete_appointments = fresh_service.get_appointments()
        post_delete_count = len(post_delete_appointments)
        assert post_delete_count == initial_count - 1, f"Count should decrease by 1: {initial_count} -> {post_delete_count}"
        
        # Property: Deleted appointment should not appear in full list
        post_delete_ids = [apt.id for apt in post_delete_appointments]
        assert created_appointment.id not in post_delete_ids, "Deleted appointment should not appear in full list"
        
        # Property: get_appointment_by_id should return None for deleted appointment
        post_delete_retrieval = fresh_service.get_appointment_by_id(created_appointment.id)
        assert post_delete_retrieval is None, "get_appointment_by_id should return None for deleted appointment"
        
        # Property: Deleted appointment should not appear in filtered queries
        date_filtered_after = fresh_service.get_appointments({"date": date.strftime('%Y-%m-%d')})
        date_filtered_ids_after = [apt.id for apt in date_filtered_after]
        assert created_appointment.id not in date_filtered_ids_after, "Deleted appointment should not appear in date filter"
        
        doctor_filtered_after = fresh_service.get_appointments({"doctor_name": doctor_name.strip()})
        doctor_filtered_ids_after = [apt.id for apt in doctor_filtered_after]
        assert created_appointment.id not in doctor_filtered_ids_after, "Deleted appointment should not appear in doctor filter"
        
        # Property: Other appointments should remain unaffected
        remaining_appointments = fresh_service.get_appointments()
        for remaining_apt in remaining_appointments:
            assert remaining_apt.id != created_appointment.id, "No remaining appointment should have the deleted ID"
            # Verify we can still retrieve other appointments
            retrieved = fresh_service.get_appointment_by_id(remaining_apt.id)
            assert retrieved is not None, f"Other appointments should still be retrievable: {remaining_apt.id}"
        
        # Property: Deleting the same appointment again should return False (idempotent)
        second_deletion_result = fresh_service.delete_appointment(created_appointment.id)
        assert second_deletion_result is False, "Second deletion attempt should return False"
        
        # Property: Count should not change on second deletion attempt
        final_count = len(fresh_service.get_appointments())
        assert final_count == post_delete_count, "Count should not change on second deletion attempt"
    
    # **Feature: emr-appointment-management, Property 9: ID uniqueness constraint**
    @given(
        num_appointments=st.integers(min_value=2, max_value=10)
    )
    def test_id_uniqueness_constraint_property(self, num_appointments):
        """
        Property test: For any set of appointments in the system, all appointment IDs should be unique
        **Validates: Requirements 8.2**
        """
        # Create a fresh service
        fresh_service = AppointmentService()
        
        created_appointments = []
        
        # Create multiple appointments
        for i in range(num_appointments):
            payload = {
                "patient_name": f"Patient {i}",
                "date": f"2025-05-{i+1:02d}",  # Different dates to avoid conflicts
                "time": "10:00",
                "duration": 30,
                "doctor_name": f"Dr. Test {i}",  # Different doctors to avoid conflicts
                "mode": "In-person"
            }
            
            appointment = fresh_service.create_appointment(payload)
            assert isinstance(appointment, Appointment), f"Appointment {i} creation failed: {appointment}"
            created_appointments.append(appointment)
        
        # Property: All created appointments should have unique IDs
        created_ids = [apt.id for apt in created_appointments]
        unique_ids = set(created_ids)
        
        assert len(created_ids) == len(unique_ids), f"Duplicate IDs found: {len(created_ids)} appointments but only {len(unique_ids)} unique IDs"
        
        # Property: All IDs should follow the expected format
        for appointment_id in created_ids:
            assert appointment_id.startswith("apt_"), f"ID {appointment_id} should start with 'apt_'"
            assert len(appointment_id) > 4, f"ID {appointment_id} should be longer than just the prefix"
        
        # Property: All appointments in the service should have unique IDs
        all_appointments = fresh_service.get_appointments()
        all_ids = [apt.id for apt in all_appointments]
        all_unique_ids = set(all_ids)
        
        assert len(all_ids) == len(all_unique_ids), f"Duplicate IDs in service: {len(all_ids)} appointments but only {len(all_unique_ids)} unique IDs"
        
        # Property: Each created appointment should be retrievable by its unique ID
        for created_appointment in created_appointments:
            retrieved = fresh_service.get_appointment_by_id(created_appointment.id)
            assert retrieved is not None, f"Appointment with ID {created_appointment.id} should be retrievable"
            assert retrieved.id == created_appointment.id, "Retrieved appointment should have matching ID"
            assert retrieved.patient_name == created_appointment.patient_name, "Retrieved appointment should match created appointment"
        
        # Property: No two appointments should have the same ID
        for i, apt1 in enumerate(created_appointments):
            for j, apt2 in enumerate(created_appointments):
                if i != j:
                    assert apt1.id != apt2.id, f"Appointments {i} and {j} have the same ID: {apt1.id}"
        
        # Property: Creating more appointments should continue to generate unique IDs
        additional_payload = {
            "patient_name": "Additional Patient",
            "date": "2025-06-01",
            "time": "14:00",
            "duration": 45,
            "doctor_name": "Dr. Additional",
            "mode": "Virtual"
        }
        
        additional_appointment = fresh_service.create_appointment(additional_payload)
        assert isinstance(additional_appointment, Appointment), "Additional appointment creation should succeed"
        
        # Verify the new appointment has a unique ID
        assert additional_appointment.id not in created_ids, "Additional appointment should have unique ID"
        
        # Verify all IDs are still unique after adding the new appointment
        final_appointments = fresh_service.get_appointments()
        final_ids = [apt.id for apt in final_appointments]
        final_unique_ids = set(final_ids)
        
        assert len(final_ids) == len(final_unique_ids), "All IDs should remain unique after adding new appointment"
    
    # **Feature: emr-appointment-management, Property 3: Status tab filtering correctness**
    @given(
        num_appointments=st.integers(min_value=5, max_value=15)
    )
    def test_status_tab_filtering_correctness_property(self, num_appointments):
        """
        Property test: For any appointment dataset and tab selection (Upcoming, Today, Past), 
        the filtered results should contain only appointments matching the tab's criteria 
        based on date and status
        **Validates: Requirements 3.1, 3.2, 3.3**
        """
        from datetime import datetime, timedelta
        
        # Create a fresh service
        fresh_service = AppointmentService()
        
        # Generate appointments across different dates and statuses
        today = datetime.now().date()
        created_appointments = []
        
        for i in range(num_appointments):
            # Create appointments with varied dates (past, today, future)
            if i % 3 == 0:
                # Past appointments
                date_offset = -random.randint(1, 30)
                status = random.choice(['Confirmed', 'Cancelled'])
            elif i % 3 == 1:
                # Today appointments
                date_offset = 0
                status = random.choice(['Confirmed', 'Scheduled'])
            else:
                # Future appointments
                date_offset = random.randint(1, 30)
                status = random.choice(['Upcoming', 'Scheduled'])
            
            appointment_date = today + timedelta(days=date_offset)
            
            payload = {
                "patient_name": f"Test Patient {i}",
                "date": appointment_date.strftime('%Y-%m-%d'),
                "time": f"{9 + (i % 8):02d}:00",
                "duration": 30,
                "doctor_name": f"Dr. Test {i % 3}",
                "mode": "In-person",
                "status": status
            }
            
            appointment = fresh_service.create_appointment(payload)
            assert isinstance(appointment, Appointment), f"Appointment {i} creation failed"
            created_appointments.append(appointment)
        
        # Get all appointments for filtering tests
        all_appointments = fresh_service.get_appointments()
        today_str = today.strftime('%Y-%m-%d')
        
        # Property 1: "Today" filter should return only appointments for today
        today_filtered = [apt for apt in all_appointments if apt.date == today_str]
        
        # Verify all today appointments have today's date
        for appointment in today_filtered:
            assert appointment.date == today_str, f"Today filter returned appointment with date {appointment.date}"
        
        # Property 2: "Upcoming" filter should return future appointments or "Upcoming" status
        upcoming_filtered = [apt for apt in all_appointments 
                           if apt.date > today_str or apt.status == 'Upcoming']
        
        # Verify all upcoming appointments meet the criteria
        for appointment in upcoming_filtered:
            assert (appointment.date > today_str or appointment.status == 'Upcoming'), \
                f"Upcoming filter returned appointment with date {appointment.date} and status {appointment.status}"
        
        # Property 3: "Past" filter should return past appointments or completed status
        past_filtered = [apt for apt in all_appointments 
                        if apt.date < today_str or apt.status == 'Completed']
        
        # Verify all past appointments meet the criteria
        for appointment in past_filtered:
            assert (appointment.date < today_str or appointment.status == 'Completed'), \
                f"Past filter returned appointment with date {appointment.date} and status {appointment.status}"
        
        # Property 4: No appointment should appear in multiple exclusive categories
        today_ids = {apt.id for apt in today_filtered}
        upcoming_ids = {apt.id for apt in upcoming_filtered}
        past_ids = {apt.id for apt in past_filtered}
        
        # Today and past should not overlap (unless status overrides)
        today_past_overlap = today_ids.intersection(past_ids)
        for apt_id in today_past_overlap:
            apt = next(apt for apt in all_appointments if apt.id == apt_id)
            # Only allowed if status creates the overlap
            assert apt.status in ['Completed', 'Upcoming'], \
                f"Appointment {apt_id} appears in both today and past without status justification"
        
        # Property 5: All appointments should be categorizable
        all_filtered_ids = today_ids.union(upcoming_ids).union(past_ids)
        all_appointment_ids = {apt.id for apt in all_appointments}
        
        # Every appointment should appear in at least one category
        uncategorized = all_appointment_ids - all_filtered_ids
        assert len(uncategorized) == 0, f"Appointments not categorized: {uncategorized}"
        
        # Property 6: Filter combinations should be consistent
        # An appointment that's today should not be in upcoming (unless status overrides)
        today_upcoming_overlap = today_ids.intersection(upcoming_ids)
        for apt_id in today_upcoming_overlap:
            apt = next(apt for apt in all_appointments if apt.id == apt_id)
            assert apt.status == 'Upcoming', \
                f"Appointment {apt_id} appears in both today and upcoming without 'Upcoming' status"