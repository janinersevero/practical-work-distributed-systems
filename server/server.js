const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client')));

let patients = new Map();
let nextId = 1;

function validatePatient(patient) {
    if (!patient || typeof patient !== 'object') {
        return { valid: false, error: 'Patient must be a valid object' };
    }

    if (patient.resourceType !== 'Patient') {
        return { valid: false, error: 'Resource type must be "Patient"' };
    }

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

function createPatientResource(patientData, id) {
    const patient = {
        resourceType: 'Patient',
        identifier: [{
            value: id.toString()
        }],
        ...patientData
    };

    if (patient.identifier && patient.identifier.length > 0) {
        patient.identifier[0].value = id.toString();
    }

    return patient;
}

app.post('/Patient', (req, res) => {
    try {
        const patientData = req.body;
        
        const validation = validatePatient(patientData);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Bad Request',
                message: validation.error
            });
        }

        const id = nextId++;
        const patient = createPatientResource(patientData, id);
        
        patients.set(id, patient);

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

        const validation = validatePatient(patientData);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Bad Request',
                message: validation.error
            });
        }

        if (patientData.identifier && patientData.identifier.length > 0) {
            const bodyId = parseInt(patientData.identifier[0].value);
            if (!isNaN(bodyId) && bodyId !== id) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Patient ID in body must match URL parameter'
                });
            }
        }

        const patient = createPatientResource(patientData, id);
        
        patients.set(id, patient);

        res.status(200).json(patient);

    } catch (error) {
        res.status(422).json({
            error: 'Unprocessable Entity',
            message: 'Invalid patient data format'
        });
    }
});

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
            res.status(204).send();
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

app.get('/PatientIDs', (req, res) => {
    try {
        const ids = Array.from(patients.keys()).sort((a, b) => a - b);
        
        if (ids.length === 0) {
            return res.status(204).send();
        }

        res.status(200).json(ids);

    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error retrieving patient IDs'
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint was not found'
    });
});

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
