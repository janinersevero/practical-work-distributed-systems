// PatientsOnFIRE Client Application
// JavaScript functionality for CRUDEPatients

// API Base URL
const API_BASE_URL = window.location.origin;

let currentPatient = null;

document.addEventListener('DOMContentLoaded', function() {
    loadPatientList();

    document.getElementById('patient-form').addEventListener('reset', function() {
        setTimeout(() => {
            document.getElementById('active').checked = true;
        }, 10);
    });
});

function showMessage(message, type = 'info') {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    messagesContainer.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

function formatDate(dateString) {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatGender(gender) {
    const genderMap = {
        'male': 'Masculino',
        'female': 'Feminino',
        'other': 'Outro',
        'unknown': 'Não informado'
    };
    return genderMap[gender] || gender;
}

function getPatientName(patient) {
    if (!patient.name || !patient.name.length) return 'Nome não informado';
    const name = patient.name[0];
    const given = name.given ? name.given.join(' ') : '';
    const family = name.family || '';
    return `${given} ${family}`.trim() || 'Nome não informado';
}

function getContactInfo(patient, system) {
    if (!patient.telecom || !patient.telecom.length) return null;
    const contact = patient.telecom.find(t => t.system === system);
    return contact ? contact.value : null;
}

function getAddress(patient) {
    if (!patient.address || !patient.address.length) return 'Endereço não informado';
    const addr = patient.address[0];
    const parts = [];
    if (addr.line) parts.push(...addr.line);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.postalCode) parts.push(addr.postalCode);
    return parts.join(', ') || 'Endereço não informado';
}

function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'list') {
        loadPatientList();
    }
}

async function apiRequest(url, options = {}) {
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

async function loadPatientList() {
    const listContainer = document.getElementById('patient-list');
    listContainer.innerHTML = '<div class="loading">Carregando lista de pacientes...</div>';

    try {
        const ids = await apiRequest(`${API_BASE_URL}/PatientIDs`);

        if (!ids || ids.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum paciente encontrado</h3>
                    <p>Cadastre o primeiro paciente usando a aba "Criar Paciente"</p>
                </div>
            `;
            return;
        }

        const patients = [];
        for (const id of ids) {
            try {
                const patient = await apiRequest(`${API_BASE_URL}/Patient/${id}`);
                patients.push(patient);
            } catch (error) {
                console.error(`Error loading patient ${id}:`, error);
            }
        }

        displayPatientList(patients);

    } catch (error) {
        console.error('Error loading patient list:', error);
        listContainer.innerHTML = `
            <div class="empty-state">
                <h3>Erro ao carregar lista</h3>
                <p>${error.message}</p>
                <button onclick="loadPatientList()" class="btn btn-primary">Tentar novamente</button>
            </div>
        `;
    }
}

function displayPatientList(patients) {
    const listContainer = document.getElementById('patient-list');

    if (patients.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum paciente encontrado</h3>
                <p>Cadastre o primeiro paciente usando a aba "Criar Paciente"</p>
            </div>
        `;
        return;
    }

    const patientsHtml = patients.map(patient => {
        const name = getPatientName(patient);
        const id = patient.identifier[0].value;
        const phone = getContactInfo(patient, 'phone');
        const email = getContactInfo(patient, 'email');
        const birthDate = formatDate(patient.birthDate);
        const gender = formatGender(patient.gender);

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
                    <button onclick="viewPatient(${id})" class="btn btn-primary">Ver Detalhes</button>
                    <button onclick="editPatientFromList(${id})" class="btn btn-warning">Editar</button>
                    <button onclick="deletePatientFromList(${id})" class="btn btn-danger">Excluir</button>
                </div>
            </div>
        `;
    }).join('');

    listContainer.innerHTML = patientsHtml;
}

async function createPatient(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
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

        if (formData.get('birthDate')) {
            patient.birthDate = formData.get('birthDate');
        }

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

        if (formData.get('address')) {
            patient.address = [{
                line: [formData.get('address')]
            }];
        }

        if (patient.telecom.length === 0) {
            delete patient.telecom;
        }

        const response = await apiRequest(`${API_BASE_URL}/Patient`, {
            method: 'POST',
            body: JSON.stringify(patient)
        });

        showMessage('Paciente criado com sucesso!', 'success');
        form.reset();
        document.getElementById('active').checked = true;

        loadPatientList();

    } catch (error) {
        console.error('Error creating patient:', error);
        showMessage(`Erro ao criar paciente: ${error.message}`, 'error');
    }
}

async function searchPatient() {
    const idInput = document.getElementById('patient-id');
    const id = parseInt(idInput.value);

    if (!id || id <= 0) {
        showMessage('Digite um ID válido', 'warning');
        return;
    }

    try {
        const patient = await apiRequest(`${API_BASE_URL}/Patient/${id}`);
        currentPatient = patient;
        displayPatientDetails(patient);

    } catch (error) {
        console.error('Error searching patient:', error);
        showMessage(`Erro ao buscar paciente: ${error.message}`, 'error');
        hidePatientDetails();
    }
}

function displayPatientDetails(patient) {
    const detailsContainer = document.getElementById('patient-details');
    const infoContainer = document.getElementById('patient-info');

    const name = getPatientName(patient);
    const id = patient.identifier[0].value;
    const phone = getContactInfo(patient, 'phone');
    const email = getContactInfo(patient, 'email');
    const birthDate = formatDate(patient.birthDate);
    const gender = formatGender(patient.gender);
    const address = getAddress(patient);

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
    document.getElementById('edit-form').style.display = 'none';
}

function hidePatientDetails() {
    document.getElementById('patient-details').style.display = 'none';
    document.getElementById('edit-form').style.display = 'none';
    currentPatient = null;
}


function editPatient() {
    if (!currentPatient) return;

    const patient = currentPatient;
    const name = patient.name && patient.name[0] ? patient.name[0] : {};
    const phone = getContactInfo(patient, 'phone');
    const email = getContactInfo(patient, 'email');
    const address = patient.address && patient.address[0] ? patient.address[0].line ? patient.address[0].line[0] : '' : '';

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

async function updatePatient(event) {
    event.preventDefault();

    if (!currentPatient) return;

    const form = event.target;
    const formData = new FormData(form);
    const id = parseInt(formData.get('id') || document.getElementById('edit-id').value);

    try {
        const patient = {
            resourceType: 'Patient',
            identifier: [{
                value: id.toString()
            }],
            active: formData.get('active') === 'on',
            name: [{
                given: [formData.get('given')],
                family: formData.get('family')
            }],
            gender: formData.get('gender'),
            telecom: []
        };

        if (formData.get('birthDate')) {
            patient.birthDate = formData.get('birthDate');
        }

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

        if (formData.get('address')) {
            patient.address = [{
                line: [formData.get('address')]
            }];
        }

        if (patient.telecom.length === 0) {
            delete patient.telecom;
        }

        const response = await apiRequest(`${API_BASE_URL}/Patient/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patient)
        });

        showMessage('Paciente atualizado com sucesso!', 'success');
        currentPatient = response;
        displayPatientDetails(response);

        loadPatientList();

    } catch (error) {
        console.error('Error updating patient:', error);
        showMessage(`Erro ao atualizar paciente: ${error.message}`, 'error');
    }
}

function cancelEdit() {
    document.getElementById('edit-form').style.display = 'none';
    if (currentPatient) {
        displayPatientDetails(currentPatient);
    }
}

async function deletePatient() {
    if (!currentPatient) return;

    const id = currentPatient.identifier[0].value;
    const name = getPatientName(currentPatient);

    if (!confirm(`Tem certeza que deseja excluir o paciente "${name}" (ID: ${id})?`)) {
        return;
    }

    try {
        await apiRequest(`${API_BASE_URL}/Patient/${id}`, {
            method: 'DELETE'
        });

        showMessage('Paciente excluído com sucesso!', 'success');
        hidePatientDetails();
        document.getElementById('patient-id').value = '';

        loadPatientList();

    } catch (error) {
        console.error('Error deleting patient:', error);
        showMessage(`Erro ao excluir paciente: ${error.message}`, 'error');
    }
}

function viewPatient(id) {
    document.getElementById('patient-id').value = id;
    showTab('search');
    setTimeout(() => searchPatient(), 100);
}

function editPatientFromList(id) {
    viewPatient(id);
    setTimeout(() => editPatient(), 200);
}

async function deletePatientFromList(id) {
    try {
        const patient = await apiRequest(`${API_BASE_URL}/Patient/${id}`);
        const name = getPatientName(patient);

        if (!confirm(`Tem certeza que deseja excluir o paciente "${name}" (ID: ${id})?`)) {
            return;
        }

        await apiRequest(`${API_BASE_URL}/Patient/${id}`, {
            method: 'DELETE'
        });

        showMessage('Paciente excluído com sucesso!', 'success');
        loadPatientList();

    } catch (error) {
        console.error('Error deleting patient:', error);
        showMessage(`Erro ao excluir paciente: ${error.message}`, 'error');
    }
}

function loadTemplate() {
    const template = {
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

    document.getElementById('json-editor').value = JSON.stringify(template, null, 2);
}

async function loadPatientJson() {
    const idInput = document.getElementById('json-patient-id');
    const id = parseInt(idInput.value);

    if (!id || id <= 0) {
        showMessage('Digite um ID válido', 'warning');
        return;
    }

    try {
        const patient = await apiRequest(`${API_BASE_URL}/Patient/${id}`);
        document.getElementById('json-editor').value = JSON.stringify(patient, null, 2);
        showMessage('Paciente carregado no editor JSON', 'success');

    } catch (error) {
        console.error('Error loading patient JSON:', error);
        showMessage(`Erro ao carregar paciente: ${error.message}`, 'error');
    }
}

async function createFromJson() {
    const jsonText = document.getElementById('json-editor').value.trim();

    if (!jsonText) {
        showMessage('Digite ou carregue um JSON válido', 'warning');
        return;
    }

    try {
        const patient = JSON.parse(jsonText);

        if (patient.identifier) {
            delete patient.identifier;
        }

        const response = await apiRequest(`${API_BASE_URL}/Patient`, {
            method: 'POST',
            body: JSON.stringify(patient)
        });

        showMessage('Paciente criado com sucesso via JSON!', 'success');
        document.getElementById('json-editor').value = JSON.stringify(response, null, 2);

        loadPatientList();

    } catch (error) {
        console.error('Error creating patient from JSON:', error);
        showMessage(`Erro ao criar paciente: ${error.message}`, 'error');
    }
}

async function updateFromJson() {
    const jsonText = document.getElementById('json-editor').value.trim();

    if (!jsonText) {
        showMessage('Digite ou carregue um JSON válido', 'warning');
        return;
    }

    try {
        const patient = JSON.parse(jsonText);

        if (!patient.identifier || !patient.identifier[0] || !patient.identifier[0].value) {
            showMessage('JSON deve conter identifier com value para atualização', 'warning');
            return;
        }

        const id = parseInt(patient.identifier[0].value);

        const response = await apiRequest(`${API_BASE_URL}/Patient/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patient)
        });

        showMessage('Paciente atualizado com sucesso via JSON!', 'success');
        document.getElementById('json-editor').value = JSON.stringify(response, null, 2);

        loadPatientList();

    } catch (error) {
        console.error('Error updating patient from JSON:', error);
        showMessage(`Erro ao atualizar paciente: ${error.message}`, 'error');
    }
}

function validateJson() {
    const jsonText = document.getElementById('json-editor').value.trim();

    if (!jsonText) {
        showMessage('Digite um JSON para validar', 'warning');
        return;
    }

    try {
        const patient = JSON.parse(jsonText);

        if (patient.resourceType !== 'Patient') {
            showMessage('JSON deve ter resourceType = "Patient"', 'error');
            return;
        }

        showMessage('JSON válido!', 'success');

    } catch (error) {
        showMessage(`JSON inválido: ${error.message}`, 'error');
    }
}

function formatJson() {
    const jsonText = document.getElementById('json-editor').value.trim();

    if (!jsonText) {
        showMessage('Digite um JSON para formatar', 'warning');
        return;
    }

    try {
        const parsed = JSON.parse(jsonText);
        document.getElementById('json-editor').value = JSON.stringify(parsed, null, 2);
        showMessage('JSON formatado!', 'info');

    } catch (error) {
        showMessage(`Erro ao formatar JSON: ${error.message}`, 'error');
    }
}
