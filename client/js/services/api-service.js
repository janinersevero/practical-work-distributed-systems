import { CONFIG } from '../config.js';

export class ApiService {
    /**
     * Generic API request method
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise<Object|null>} Response data or null for 204
     * @throws {Error} On request failure
     */
    static async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (response.status === 204) {
                return null;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * Create a new patient
     * @param {Object} patientData
     * @returns {Promise<Object>}
     */
    static async createPatient(patientData) {
        return await this.request(`${CONFIG.API_BASE_URL}/Patient`, {
            method: 'POST',
            body: JSON.stringify(patientData)
        });
    }

    /**
     * Get patient by ID
     * @param {number} id
     * @returns {Promise<Object>}
     */
    static async getPatient(id) {
        return await this.request(`${CONFIG.API_BASE_URL}/Patient/${id}`);
    }

    /**
     * Update existing patient
     * @param {number} id - Patient ID
     * @param {Object} patientData
     * @returns {Promise<Object>}
     */
    static async updatePatient(id, patientData) {
        return await this.request(`${CONFIG.API_BASE_URL}/Patient/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patientData)
        });
    }

    /**
     * Delete patient by ID
     * @param {number} id
     * @returns {Promise<null>}
     */
    static async deletePatient(id) {
        return await this.request(`${CONFIG.API_BASE_URL}/Patient/${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get all patient IDs
     * @returns {Promise<number[]|null>}
     */
    static async getPatientIds() {
        return await this.request(`${CONFIG.API_BASE_URL}/PatientIDs`);
    }
}
