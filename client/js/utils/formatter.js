export class Formatter {
    /**
     * Format date string for Brazilian locale
     * @param {string} dateString
     * @returns {string}
     */
    static formatDate(dateString) {
        if (!dateString) return 'Não informado';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    /**
     * Format gender code to Portuguese display text
     * @param {string} gender
     * @returns {string}
     */
    static formatGender(gender) {
        const genderMap = {
            'male': 'Masculino',
            'female': 'Feminino',
            'other': 'Outro',
            'unknown': 'Não informado'
        };
        return genderMap[gender] || gender;
    }

    /**
     * Extract patient name from FHIR resource
     * @param {Object} patient
     * @returns {string}
     */
    static getPatientName(patient) {
        if (!patient.name || !patient.name.length) {
            return 'Nome não informado';
        }

        const name = patient.name[0];
        const given = name.given ? name.given.join(' ') : '';
        const family = name.family || '';

        return `${given} ${family}`.trim() || 'Nome não informado';
    }

    /**
     * Extract contact information from FHIR resource
     * @param {Object} patient
     * @param {string} system
     * @returns {string|null}
     */
    static getContactInfo(patient, system) {
        if (!patient.telecom || !patient.telecom.length) {
            return null;
        }
        
        const contact = patient.telecom.find(t => t.system === system);
        return contact ? contact.value : null;
    }

    /**
     * Extract address from FHIR resource
     * @param {Object} patient
     * @returns {string}
     */
    static getAddress(patient) {
        if (!patient.address || !patient.address.length) {
            return 'Endereço não informado';
        }

        const addr = patient.address[0];
        const parts = [];

        if (addr.line) parts.push(...addr.line);
        if (addr.city) parts.push(addr.city);
        if (addr.state) parts.push(addr.state);
        if (addr.postalCode) parts.push(addr.postalCode);

        return parts.join(', ') || 'Endereço não informado';
    }
}
