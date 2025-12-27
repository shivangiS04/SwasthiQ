#!/usr/bin/env python3

from flask import Flask, request, jsonify
from flask_cors import CORS
from appointment_service import AppointmentService
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

appointment_service = AppointmentService()

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    try:
        filters = {}
        if request.args.get('date'):
            filters['date'] = request.args.get('date')
        if request.args.get('status'):
            filters['status'] = request.args.get('status')
        if request.args.get('doctor_name'):
            filters['doctor_name'] = request.args.get('doctor_name')
        
        appointments = appointment_service.get_appointments(filters)
        
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
        
        if isinstance(result, dict) and not result.get('success', True):
            return jsonify(result), 400
        
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
        
        if isinstance(result, dict) and not result.get('success', True):
            return jsonify(result), 400
        
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
    return jsonify({
        'success': True,
        'message': 'SwasthiQ Appointment API is running',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    if not debug_mode:
        print("🏥 Starting SwasthiQ Appointment Management API Server (Production)...")
        print("👩‍💻 Developed by Shivangi Singh")
        print(f"📍 API running on port: {port}")
    else:
        print("🏥 Starting SwasthiQ Appointment Management API Server...")
        print("👩‍💻 Developed by Shivangi Singh")
        print("📍 API will be available at: http://localhost:5000")
        print("🔍 Health check: http://localhost:5000/api/health")
        print("📚 Documentation: See README.md for API endpoints")
    
    app.run(debug=debug_mode, host='0.0.0.0', port=port)