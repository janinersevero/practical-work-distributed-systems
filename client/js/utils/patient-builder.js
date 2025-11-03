
export class PatientBuilder {
    /**
     * Build FHIR Patient resource from form data
     * @param {FormData} formData
     * @param {number} id
     * @returns {Object}
     */
    static buildFromFormData(formData, id = null) {
        const patient = {
            resourceType: 'Patient',
            active: formData.get('active') === 'on',
            name: [{
                given: [formData.get('given')],
                family: formData.get('family')
            }],
            gender: formData.get('gender'),
            telecom: []
        };

        if (id) {
            patient.identifier = [{ value: id.toString() }];
        }

        if (formData.get('birthDate')) {
            patient.birthDate = formData.get('birthDate');
        }

        this._addContactInfo(patient, formData);

        if (formData.get('address')) {
            patient.address = [{
                line: [formData.get('address')]
            }];
        }

        if (patient.telecom.length === 0) {
            delete patient.telecom;
        }

        return patient;
    }

    /**
     * Create FHIR Patient template
     * @returns {Object}
     */
    static createTemplate() {
        return {
            "resourceType": "Patient",
            "active": true,
            "name": [
                {
                    "given": ["João"],
                    "family": "Silva"
                }
            ],
            "telecom": [
                {
                    "system": "phone",
                    "value": "(11) 99999-9999"
                },
                {
                    "system": "email",
                    "value": "joao.silva@email.com"
                }
            ],
            "gender": "male",
            "birthDate": "1990-01-01",
            "address": [
                {
                    "line": ["Rua das Flores, 123"],
                    "city": "Porto Alegre",
                    "state": "RS",
                    "postalCode": "90000-000"
                }
            ]
        };
    }

    /**
     * Validate FHIR Patient resource structure
     * @param {Object} patient
     * @returns {Object}
     */
    static validate(patient) {
        if (!patient || typeof patient !== 'object') {
            return { valid: false, error: 'Patient must be a valid object' };
        }

        if (patient.resourceType !== 'Patient') {
            return { valid: false, error: 'Resource type must be "Patient"' };
        }

        if (!patient.name || !Array.isArray(patient.name) || patient.name.length === 0) {
            return { valid: false, error: 'Patient must have at least one name' };
        }

        const name = patient.name[0];
        if (!name.given || !Array.isArray(name.given) || name.given.length === 0) {
            return { valid: false, error: 'Patient name must include given name(s)' };
        }

        if (!name.family) {
            return { valid: false, error: 'Patient name must include family name' };
        }

        if (!patient.gender) {
            return { valid: false, error: 'Patient must have gender specified' };
        }

        const validGenders = ['male', 'female', 'other', 'unknown'];
        if (!validGenders.includes(patient.gender)) {
            return { valid: false, error: 'Gender must be one of: male, female, other, unknown' };
        }

        return { valid: true };
    }

    /**
     * Add contact information to patient resource
     * @private
     * @param {Object} patient
     * @param {FormData} formData
     */
    static _addContactInfo(patient, formData) {
        if (formData.get('phone')) {
            patient.telecom.push({
                system: 'phone',
                value: formData.get('phone')
            });
        }

        if (formData.get('email')) {
            patient.telecom.push({
                system: 'email',
                value: formData.get('email')
            });
        }
    }
}
