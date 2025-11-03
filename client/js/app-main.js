import { MessageService } from './components/message-service.js';
import { PatientListController } from './controllers/patient-list-controller.js';
import { ApiService } from './services/api-service.js';
import { PatientBuilder } from './utils/patient-builder.js';
import { Formatter } from './utils/formatter.js';

class AppMain {
    constructor() {
        this.currentPatient = null;
        this.controllers = {};
        this.init();
    }

    init() {
        MessageService.init();

        this.controllers.list = new PatientListController();

        this._setupFormHandlers();

        this._setupTabNavigation();

        window.patientControllers = {
            list: this.controllers.list,
            search: this
        };
    }

    /**
     * Set up form event handlers
     * @private
     */
    _setupFormHandlers() {
        const patientForm = document.getElementById('patient-form');
        if (patientForm) {
            patientForm.addEventListener('submit', (e) => this.createPatient(e));
            patientForm.addEventListener('reset', () => {
                setTimeout(() => {
                    document.getElementById('active').checked = true;
                }, 10);
            });
        }

        const editForm = document.getElementById('edit-patient-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.updatePatient(e));
        }
    }

    /**
     * Set up tab navigation
     * @private
     */
    _setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.textContent.toLowerCase().includes('lista') ? 'list' :
                              e.target.textContent.toLowerCase().includes('criar') ? 'create' :
                              e.target.textContent.toLowerCase().includes('buscar') ? 'search' : 'json';
                this.showTab(tabName);
            });
        });
    }

    /**
     * Show specific tab
     * @param {string} tabName
     */
    showTab(tabName) {
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => tab.classList.remove('active'));

        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach(button => button.classList.remove('active'));

        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        buttons.forEach(button => {
            if ((tabName === 'list' && button.textContent.includes('Lista')) ||
                (tabName === 'create' && button.textContent.includes('Criar')) ||
                (tabName === 'search' && button.textContent.includes('Buscar')) ||
                (tabName === 'json' && button.textContent.includes('JSON'))) {
                button.classList.add('active');
            }
        });

        if (tabName === 'list') {
            this.controllers.list.loadPatientList();
        }
    }

    /**
     * Create new patient from form
     * @param {Event} event
     */
    async createPatient(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        try {
            const patient = PatientBuilder.buildFromFormData(formData);

            const validation = PatientBuilder.validate(patient);
            if (!validation.valid) {
                MessageService.showError(validation.error);
                return;
            }

            await ApiService.createPatient(patient);
            MessageService.showSuccess('Paciente criado com sucesso!');

            form.reset();
            document.getElementById('active').checked = true;

            this.controllers.list.loadPatientList();

        } catch (error) {
            console.error('Error creating patient:', error);
            MessageService.showError(`Erro ao criar paciente: ${error.message}`);
        }
    }

    async searchPatient() {
        const idInput = document.getElementById('patient-id');
        const id = parseInt(idInput.value);

        if (!id || id <= 0) {
            MessageService.showWarning('Digite um ID válido');
            return;
        }

        try {
            const patient = await ApiService.getPatient(id);
            this.currentPatient = patient;
            this._displayPatientDetails(patient);

        } catch (error) {
            console.error('Error searching patient:', error);
            MessageService.showError(`Erro ao buscar paciente: ${error.message}`);
            this._hidePatientDetails();
        }
    }

    /**
     * View patient from list
     * @param {number} id
     */
    viewPatient(id) {
        document.getElementById('patient-id').value = id;
        this.showTab('search');
        setTimeout(() => this.searchPatient(), 100);
    }

    /**
     * Edit patient from list
     * @param {number} id
     */
    editPatientFromList(id) {
        this.viewPatient(id);
        setTimeout(() => this.editPatient(), 200);
    }

    /**
     * Display patient details
     * @private
     * @param {Object} patient
     */
    _displayPatientDetails(patient) {
        const detailsContainer = document.getElementById('patient-details');
        const infoContainer = document.getElementById('patient-info');

        if (!detailsContainer || !infoContainer) return;

        const name = Formatter.getPatientName(patient);
        const id = patient.identifier[0].value;
        const phone = Formatter.getContactInfo(patient, 'phone');
        const email = Formatter.getContactInfo(patient, 'email');
        const birthDate = Formatter.formatDate(patient.birthDate);
        const gender = Formatter.formatGender(patient.gender);
        const address = Formatter.getAddress(patient);

        infoContainer.innerHTML = `
            <div class="info-row">
                <div class="info-label">ID:</div>
                <div class="info-value">${id}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Nome:</div>
                <div class="info-value">${name}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Gênero:</div>
                <div class="info-value">${gender}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Data de Nascimento:</div>
                <div class="info-value">${birthDate}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Telefone:</div>
                <div class="info-value">${phone || 'Não informado'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${email || 'Não informado'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Endereço:</div>
                <div class="info-value">${address}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Status:</div>
                <div class="info-value">${patient.active ? 'Ativo' : 'Inativo'}</div>
            </div>
        `;

        detailsContainer.style.display = 'block';
        const editForm = document.getElementById('edit-form');
        if (editForm) editForm.style.display = 'none';
    }

    /**
     * Hide patient details
     * @private
     */
    _hidePatientDetails() {
        const detailsContainer = document.getElementById('patient-details');
        const editForm = document.getElementById('edit-form');

        if (detailsContainer) detailsContainer.style.display = 'none';
        if (editForm) editForm.style.display = 'none';

        this.currentPatient = null;
    }

    editPatient() {
        if (!this.currentPatient) return;

        const patient = this.currentPatient;
        const name = patient.name && patient.name[0] ? patient.name[0] : {};
        const phone = Formatter.getContactInfo(patient, 'phone');
        const email = Formatter.getContactInfo(patient, 'email');
        const address = patient.address && patient.address[0] ? 
                       patient.address[0].line ? patient.address[0].line[0] : '' : '';

        document.getElementById('edit-id').value = patient.identifier[0].value;
        document.getElementById('edit-given').value = name.given ? name.given[0] : '';
        document.getElementById('edit-family').value = name.family || '';
        document.getElementById('edit-gender').value = patient.gender || '';
        document.getElementById('edit-birthDate').value = patient.birthDate || '';
        document.getElementById('edit-phone').value = phone || '';
        document.getElementById('edit-email').value = email || '';
        document.getElementById('edit-address').value = address;
        document.getElementById('edit-active').checked = patient.active;

        document.getElementById('edit-form').style.display = 'block';
    }

    /**
     * Update patient from edit form
     * @param {Event} event
     */
    async updatePatient(event) {
        event.preventDefault();

        if (!this.currentPatient) return;

        const form = event.target;
        const formData = new FormData(form);
        const id = parseInt(formData.get('id') || document.getElementById('edit-id').value);

        try {
            const patient = PatientBuilder.buildFromFormData(formData, id);

            const validation = PatientBuilder.validate(patient);
            if (!validation.valid) {
                MessageService.showError(validation.error);
                return;
            }

            const response = await ApiService.updatePatient(id, patient);
            MessageService.showSuccess('Paciente atualizado com sucesso!');

            this.currentPatient = response;
            this._displayPatientDetails(response);

            this.controllers.list.loadPatientList();

        } catch (error) {
            console.error('Error updating patient:', error);
            MessageService.showError(`Erro ao atualizar paciente: ${error.message}`);
        }
    }

    cancelEdit() {
        document.getElementById('edit-form').style.display = 'none';
        if (this.currentPatient) {
            this._displayPatientDetails(this.currentPatient);
        }
    }

    async deletePatient() {
        if (!this.currentPatient) return;

        const id = this.currentPatient.identifier[0].value;
        const name = Formatter.getPatientName(this.currentPatient);

        if (!confirm(`Tem certeza que deseja excluir o paciente "${name}" (ID: ${id})?`)) {
            return;
        }

        try {
            await ApiService.deletePatient(id);
            MessageService.showSuccess('Paciente excluído com sucesso!');

            this._hidePatientDetails();
            document.getElementById('patient-id').value = '';

            this.controllers.list.loadPatientList();

        } catch (error) {
            console.error('Error deleting patient:', error);
            MessageService.showError(`Erro ao excluir paciente: ${error.message}`);
        }
    }

    loadTemplate() {
        const template = PatientBuilder.createTemplate();
        document.getElementById('json-editor').value = JSON.stringify(template, null, 2);
    }

    async loadPatientJson() {
        const idInput = document.getElementById('json-patient-id');
        const id = parseInt(idInput.value);

        if (!id || id <= 0) {
            MessageService.showWarning('Digite um ID válido');
            return;
        }

        try {
            const patient = await ApiService.getPatient(id);
            document.getElementById('json-editor').value = JSON.stringify(patient, null, 2);
            MessageService.showInfo('Paciente carregado no editor JSON');

        } catch (error) {
            console.error('Error loading patient JSON:', error);
            MessageService.showError(`Erro ao carregar paciente: ${error.message}`);
        }
    }

    validateJson() {
        const jsonText = document.getElementById('json-editor').value.trim();

        if (!jsonText) {
            MessageService.showWarning('Digite um JSON para validar');
            return;
        }

        try {
            const patient = JSON.parse(jsonText);
            const validation = PatientBuilder.validate(patient);

            if (validation.valid) {
                MessageService.showSuccess('JSON válido!');
            } else {
                MessageService.showError(`JSON inválido: ${validation.error}`);
            }

        } catch (error) {
            MessageService.showError(`JSON malformado: ${error.message}`);
        }
    }

    formatJson() {
        const jsonText = document.getElementById('json-editor').value.trim();

        if (!jsonText) {
            MessageService.showWarning('Digite um JSON para formatar');
            return;
        }

        try {
            const parsed = JSON.parse(jsonText);
            document.getElementById('json-editor').value = JSON.stringify(parsed, null, 2);
            MessageService.showInfo('JSON formatado!');

        } catch (error) {
            MessageService.showError(`Erro ao formatar JSON: ${error.message}`);
        }
    }

    async createFromJson() {
        const jsonText = document.getElementById('json-editor').value.trim();

        if (!jsonText) {
            MessageService.showWarning('Digite ou carregue um JSON válido');
            return;
        }

        try {
            const patient = JSON.parse(jsonText);

            if (patient.identifier) {
                delete patient.identifier;
            }

            const validation = PatientBuilder.validate(patient);
            if (!validation.valid) {
                MessageService.showError(validation.error);
                return;
            }

            const response = await ApiService.createPatient(patient);
            MessageService.showSuccess('Paciente criado com sucesso via JSON!');
            document.getElementById('json-editor').value = JSON.stringify(response, null, 2);

            this.controllers.list.loadPatientList();

        } catch (error) {
            console.error('Error creating patient from JSON:', error);
            MessageService.showError(`Erro ao criar paciente: ${error.message}`);
        }
    }

    async updateFromJson() {
        const jsonText = document.getElementById('json-editor').value.trim();

        if (!jsonText) {
            MessageService.showWarning('Digite ou carregue um JSON válido');
            return;
        }

        try {
            const patient = JSON.parse(jsonText);

            if (!patient.identifier || !patient.identifier[0] || !patient.identifier[0].value) {
                MessageService.showWarning('JSON deve conter identifier com value para atualização');
                return;
            }

            const validation = PatientBuilder.validate(patient);
            if (!validation.valid) {
                MessageService.showError(validation.error);
                return;
            }

            const id = parseInt(patient.identifier[0].value);
            const response = await ApiService.updatePatient(id, patient);
            MessageService.showSuccess('Paciente atualizado com sucesso via JSON!');
            document.getElementById('json-editor').value = JSON.stringify(response, null, 2);

            this.controllers.list.loadPatientList();

        } catch (error) {
            console.error('Error updating patient from JSON:', error);
            MessageService.showError(`Erro ao atualizar paciente: ${error.message}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AppMain();
});

window.searchPatient = () => window.patientControllers.search.searchPatient();
window.editPatient = () => window.patientControllers.search.editPatient();
window.deletePatient = () => window.patientControllers.search.deletePatient();
window.cancelEdit = () => window.patientControllers.search.cancelEdit();
window.loadTemplate = () => window.patientControllers.search.loadTemplate();
window.loadPatientJson = () => window.patientControllers.search.loadPatientJson();
window.validateJson = () => window.patientControllers.search.validateJson();
window.formatJson = () => window.patientControllers.search.formatJson();
window.createFromJson = () => window.patientControllers.search.createFromJson();
window.updateFromJson = () => window.patientControllers.search.updateFromJson();
window.loadPatientList = () => window.patientControllers.list.loadPatientList();
window.showTab = (tabName) => window.patientControllers.search.showTab(tabName);
