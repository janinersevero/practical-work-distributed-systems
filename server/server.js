const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client')));

// In-memory storage for Patient resources
let patients = new Map();
let nextId = 1;

// Helper function to validate FHIR Patient resource
function validatePatient(patient) {
    if (!patient || typeof patient !== 'object') {
        return { valid: false, error: 'Patient must be a valid object' };
    }

    // Check if resourceType is Patient
    if (patient.resourceType !== 'Patient') {
        return { valid: false, error: 'Resource type must be "Patient"' };
    }

    // Basic validation for required fields
    if (patient.identifier && !Array.isArray(patient.identifier)) {
        return { valid: false, error: 'Identifier must be an array' };
    }

    if (patient.name && !Array.isArray(patient.name)) {
        return { valid: false, error: 'Name must be an array' };
    }

    if (patient.gender && !['male', 'female', 'other', 'unknown'].includes(patient.gender)) {
        return { valid: false, error: 'Gender must be one of: male, female, other, unknown' };
    }

    return { valid: true };
}

// Helper function to create a complete Patient resource
function createPatientResource(patientData, id) {
    const patient = {
        resourceType: 'Patient',
        identifier: [{
            value: id.toString()
        }],
        ...patientData
    };

    // Ensure identifier has the correct ID
    if (patient.identifier && patient.identifier.length > 0) {
        patient.identifier[0].value = id.toString();
    }

    return patient;
}

// API Routes

// 1. CREATE - POST /Patient
app.post('/Patient', (req, res) => {
    try {
        const patientData = req.body;
        
        // Validate the patient data
        const validation = validatePatient(patientData);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Bad Request',
                message: validation.error
            });
        }

        // Create the patient resource with auto-generated ID
        const id = nextId++;
        const patient = createPatientResource(patientData, id);
        
        // Store the patient
        patients.set(id, patient);

        // Return 201 Created with Location header
        res.status(201)
           .location(`/Patient/${id}`)
           .json(patient);

    } catch (error) {
        res.status(422).json({
            error: 'Unprocessable Entity',
            message: 'Invalid patient data format'
        });
    }
});

// 2. READ - GET /Patient/:id
app.get('/Patient/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Patient ID must be a positive integer'
            });
        }

        const patient = patients.get(id);
        
        if (!patient) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Patient with ID ${id} not found`
            });
        }

        res.status(200).json(patient);

    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error retrieving patient'
        });
    }
});

// 3. UPDATE - PUT /Patient/:id
app.put('/Patient/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const patientData = req.body;

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Patient ID must be a positive integer'
            });
        }

        // Validate the patient data
        const validation = validatePatient(patientData);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Bad Request',
                message: validation.error
            });
        }

        // Check if identifier in body matches URL parameter
        if (patientData.identifier && patientData.identifier.length > 0) {
            const bodyId = parseInt(patientData.identifier[0].value);
            if (!isNaN(bodyId) && bodyId !== id) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Patient ID in body must match URL parameter'
                });
            }
        }

        // Create the updated patient resource
        const patient = createPatientResource(patientData, id);
        
        // Store the updated patient
        patients.set(id, patient);

        res.status(200).json(patient);

    } catch (error) {
        res.status(422).json({
            error: 'Unprocessable Entity',
            message: 'Invalid patient data format'
        });
    }
});

// 4. DELETE - DELETE /Patient/:id
app.delete('/Patient/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Patient ID must be a positive integer'
            });
        }

        const existed = patients.has(id);
        patients.delete(id);

        if (existed) {
            res.status(204).send(); // No Content - successful deletion
        } else {
            res.status(404).json({
                error: 'Not Found',
                message: `Patient with ID ${id} not found`
            });
        }

    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error deleting patient'
        });
    }
});

// 5. PATIENT IDS - GET /PatientIDs
app.get('/PatientIDs', (req, res) => {
    try {
        const ids = Array.from(patients.keys()).sort((a, b) => a - b);
        
        if (ids.length === 0) {
            return res.status(204).send(); // No Content - empty list
        }

        res.status(200).json(ids);

    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error retrieving patient IDs'
        });
    }
});

// Serve the client application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
    });
});

// Handle 404 for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint was not found'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`PatientsOnFIRE server is running on http://localhost:${PORT}`);
    console.log(`Client application available at: http://localhost:${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}`);
    console.log('\nAvailable endpoints:');
    console.log('POST   /Patient        - Create a new patient');
    console.log('GET    /Patient/:id    - Read patient by ID');
    console.log('PUT    /Patient/:id    - Update patient by ID');
    console.log('DELETE /Patient/:id    - Delete patient by ID');
    console.log('GET    /PatientIDs     - Get all patient IDs');
});

module.exports = app;
