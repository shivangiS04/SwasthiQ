#!/usr/bin/env python3
"""
Flask API Server for EMR Appointment Management System
Provides HTTP endpoints for the React frontend to interact with the Python backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from appointment_service import AppointmentService
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize the appointment service
appointment_service = AppointmentService()

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    """Get appointments with optional filtering"""
    try:
        # Get query parameters
        filters = {}
        if request.args.get('date'):
            filters['date'] = request.args.get('date')
        if request.args.get('status'):
            filters['status'] = request.args.get('status')
        if request.args.get('doctor_name'):
            filters['doctor_name'] = request.args.get('doctor_name')
        
        appointments = appointment_service.get_appointments(filters)
        
        # Convert appointments to dictionaries for JSON serialization
        appointments_data = []
        for apt in appointments:
            appointments_data.append({
                'id': apt.id,
                'patient_name': apt.patient_name,
                'date': apt.date,
                'time': apt.time,
                'duration': apt.duration,
                'doctor_name': apt.doctor_name,
                'status': apt.status,
                'mode': apt.mode
            })
        
        return jsonify({
            'success': True,
            'data': appointments_data
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    """Create a new appointment"""
    try:
        payload = request.get_json()
        
        if not payload:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Request body is required'
                }
            }), 400
        
        result = appointment_service.create_appointment(payload)
        
        # Check if result is an error response
        if isinstance(result, dict) and not result.get('success', True):
            return jsonify(result), 400
        
        # Convert appointment to dictionary
        appointment_data = {
            'id': result.id,
            'patient_name': result.patient_name,
            'date': result.date,
            'time': result.time,
            'duration': result.duration,
            'doctor_name': result.doctor_name,
            'status': result.status,
            'mode': result.mode
        }
        
        return jsonify({
            'success': True,
            'data': appointment_data
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500

@app.route('/api/appointments/<appointment_id>/status', methods=['PUT'])
def update_appointment_status(appointment_id):
    """Update appointment status"""
    try:
        payload = request.get_json()
        
        if not payload or 'status' not in payload:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Status is required'
                }
            }), 400
        
        result = appointment_service.update_appointment_status(
            appointment_id, 
            payload['status']
        )
        
        # Check if result is an error response
        if isinstance(result, dict) and not result.get('success', True):
            return jsonify(result), 400
        
        # Convert appointment to dictionary
        appointment_data = {
            'id': result.id,
            'patient_name': result.patient_name,
            'date': result.date,
            'time': result.time,
            'duration': result.duration,
            'doctor_name': result.doctor_name,
            'status': result.status,
            'mode': result.mode
        }
        
        return jsonify({
            'success': True,
            'data': appointment_data
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500

@app.route('/api/appointments/<appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    """Delete an appointment"""
    try:
        success = appointment_service.delete_appointment(appointment_id)
        
        return jsonify({
            'success': success,
            'message': 'Appointment deleted successfully' if success else 'Appointment not found'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'EMR Appointment API is running',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("Starting EMR Appointment Management API Server...")
    print("API will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    app.run(debug=True, host='0.0.0.0', port=5000)