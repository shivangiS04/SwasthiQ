"""
Validation functions for appointment data
"""

import re
from datetime import datetime, time
from typing import Dict, List, Optional, Tuple

def validate_appointment_data(data: Dict) -> Tuple[bool, List[str]]:
    """
    Validate appointment data for required fields and formats
    
    Args:
        data: Dictionary containing appointment data
        
    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []
    required_fields = ['patient_name', 'date', 'time', 'duration', 'doctor_name', 'mode']
    
    # Check required fields
    for field in required_fields:
        if field not in data or not data[field]:
            errors.append(f"Missing required field: {field}")
    
    if errors:  # If required fields are missing, return early
        return False, errors
    
    # Validate patient name
    if not isinstance(data['patient_name'], str) or len(data['patient_name'].strip()) < 2:
        errors.append("Patient name must be at least 2 characters long")
    
    # Validate date format (YYYY-MM-DD)
    if not validate_date_format(data['date']):
        errors.append("Date must be in YYYY-MM-DD format")
    
    # Validate time format (HH:MM)
    if not validate_time_format(data['time']):
        errors.append("Time must be in HH:MM format")
    
    # Validate duration
    if not isinstance(data['duration'], int) or data['duration'] <= 0 or data['duration'] > 480:
        errors.append("Duration must be a positive integer between 1 and 480 minutes")
    
    # Validate doctor name
    if not isinstance(data['doctor_name'], str) or len(data['doctor_name'].strip()) < 2:
        errors.append("Doctor name must be at least 2 characters long")
    
    # Validate mode
    valid_modes = ['In-person', 'Virtual', 'Phone']
    if data['mode'] not in valid_modes:
        errors.append(f"Mode must be one of: {', '.join(valid_modes)}")
    
    # Validate status if provided
    if 'status' in data and data['status']:
        valid_statuses = ['Confirmed', 'Scheduled', 'Upcoming', 'Cancelled']
        if data['status'] not in valid_statuses:
            errors.append(f"Status must be one of: {', '.join(valid_statuses)}")
    
    return len(errors) == 0, errors

def validate_date_format(date_str: str) -> bool:
    """
    Validate date string is in YYYY-MM-DD format
    
    Args:
        date_str: Date string to validate
        
    Returns:
        True if valid format, False otherwise
    """
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except (ValueError, TypeError):
        return False

def validate_time_format(time_str: str) -> bool:
    """
    Validate time string is in HH:MM format
    
    Args:
        time_str: Time string to validate
        
    Returns:
        True if valid format, False otherwise
    """
    try:
        datetime.strptime(time_str, '%H:%M')
        return True
    except (ValueError, TypeError):
        return False

def validate_status_value(status: str) -> bool:
    """
    Validate status value is one of the allowed values
    
    Args:
        status: Status string to validate
        
    Returns:
        True if valid status, False otherwise
    """
    valid_statuses = ['Confirmed', 'Scheduled', 'Upcoming', 'Cancelled']
    return status in valid_statuses