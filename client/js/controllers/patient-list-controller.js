import { ApiService } from '../services/api-service.js';
import { MessageService } from '../components/message-service.js';
import { Formatter } from '../utils/formatter.js';
import { CONFIG } from '../config.js';

export class PatientListController {
    constructor() {
        this.listContainer = document.getElementById('patient-list');
        this.init();
    }

    init() {
        this.loadPatientList();
    }

    async loadPatientList() {
        if (!this.listContainer) return;

        this._showLoading();

        try {
            const ids = await ApiService.getPatientIds();
            if (!ids || ids.length === 0) {
                this._showEmptyState();
                return;
            }

            const patients = await this._loadPatients(ids);
            this._displayPatientList(patients);

        } catch (error) {
            console.error('Error loading patient list:', error);
            this._showError(error.message);
        }
    }

    /**
     * Delete patient from list
     * @param {number} id
     */
    async deletePatientFromList(id) {
        try {
            const patient = await ApiService.getPatient(id);
            const name = Formatter.getPatientName(patient);

            if (!confirm(`${CONFIG.UI.CONFIRM_DELETE} "${name}" (ID: ${id})?`)) {
                return;
            }

            await ApiService.deletePatient(id);
            MessageService.showSuccess('Paciente excluído com sucesso!');
            this.loadPatientList();

        } catch (error) {
            console.error('Error deleting patient:', error);
            MessageService.showError(`Erro ao excluir paciente: ${error.message}`);
        }
    }

    /**
     * Load multiple patients by IDs
     * @private
     * @param {number[]} ids
     * @returns {Promise<Object[]>}
     */
    async _loadPatients(ids) {
        const patients = [];

        for (const id of ids) {
            try {
                const patient = await ApiService.getPatient(id);
                patients.push(patient);
            } catch (error) {
                console.error(`Error loading patient ${id}:`, error);
            }
        }

        return patients;
    }

    /**
     * Display patient list in the UI
     * @private
     * @param {Object[]} patients
     */
    _displayPatientList(patients) {
        if (patients.length === 0) {
            this._showEmptyState();
            return;
        }

        const patientsHtml = patients.map(patient => {
            return this._createPatientCard(patient);
        }).join('');

        this.listContainer.innerHTML = patientsHtml;
    }

    /**
     * Create HTML for a patient card
     * @private
     * @param {Object} patient
     * @returns {string}
     */
    _createPatientCard(patient) {
        const name = Formatter.getPatientName(patient);
        const id = patient.identifier[0].value;
        const phone = Formatter.getContactInfo(patient, 'phone');
        const email = Formatter.getContactInfo(patient, 'email');
        const birthDate = Formatter.formatDate(patient.birthDate);
        const gender = Formatter.formatGender(patient.gender);

        return `
            <div class="patient-card fade-in">
                <div class="patient-header">
                    <div class="patient-name">${name}</div>
                    <div class="patient-id">ID: ${id}</div>
                </div>
                <div class="patient-details">
                    <div><strong>Gênero:</strong> ${gender}</div>
                    <div><strong>Data de Nascimento:</strong> ${birthDate}</div>
                    ${phone ? `<div><strong>Telefone:</strong> ${phone}</div>` : ''}
                    ${email ? `<div><strong>Email:</strong> ${email}</div>` : ''}
                    <div><strong>Status:</strong> ${patient.active ? 'Ativo' : 'Inativo'}</div>
                </div>
                <div class="patient-actions">
                    <button onclick="window.patientControllers.search.viewPatient(${id})" class="btn btn-primary">Ver Detalhes</button>
                    <button onclick="window.patientControllers.search.editPatientFromList(${id})" class="btn btn-warning">Editar</button>
                    <button onclick="window.patientControllers.list.deletePatientFromList(${id})" class="btn btn-danger">Excluir</button>
                </div>
            </div>
        `;
    }

    /**
     * Show loading state
     * @private
     */
    _showLoading() {
        this.listContainer.innerHTML = `<div class="loading">${CONFIG.UI.LOADING_TEXT}</div>`;
    }

    /**
     * Show empty state
     * @private
     */
    _showEmptyState() {
        this.listContainer.innerHTML = `
            <div class="empty-state">
                <h3>${CONFIG.UI.EMPTY_STATE_TITLE}</h3>
                <p>Cadastre o primeiro paciente usando a aba "Criar Paciente"</p>
            </div>
        `;
    }

    /**
     * Show error state
     * @private
     * @param {string} message
     */
    _showError(message) {
        this.listContainer.innerHTML = `
            <div class="empty-state">
                <h3>Erro ao carregar lista</h3>
                <p>${message}</p>
                <button onclick="window.patientControllers.list.loadPatientList()" class="btn btn-primary">Tentar novamente</button>
            </div>
        `;
    }
}
