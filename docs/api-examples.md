# Exemplos de Uso da API PatientsOnFIRE

Este documento contém exemplos práticos de como usar a API REST do servidor PatientsOnFIRE.

## Base URL
```
http://localhost:3000
```

## 1. Operação CREATE (POST /Patient)

### Exemplo Básico
```bash
curl -X POST http://localhost:3000/Patient \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "active": true,
    "name": [
      {
        "given": ["João"],
        "family": "Silva"
      }
    ],
    "gender": "male"
  }'
```

### Resposta de Sucesso (201 Created)
```json
{
  "resourceType": "Patient",
  "identifier": [
    {
      "value": "1"
    }
  ],
  "active": true,
  "name": [
    {
      "given": ["João"],
      "family": "Silva"
    }
  ],
  "gender": "male"
}
```

### Exemplo Completo
```bash
curl -X POST http://localhost:3000/Patient \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "active": true,
    "name": [
      {
        "given": ["Maria", "José"],
        "family": "Santos"
      }
    ],
    "telecom": [
      {
        "system": "phone",
        "value": "(11) 99999-8888"
      },
      {
        "system": "email",
        "value": "maria.santos@email.com"
      }
    ],
    "gender": "female",
    "birthDate": "1985-06-15",
    "address": [
      {
        "line": ["Rua das Flores, 123"],
        "city": "São Paulo",
        "state": "SP",
        "postalCode": "01234-567"
      }
    ]
  }'
```

### Resposta de Erro (400 Bad Request)
```json
{
  "error": "Bad Request",
  "message": "Resource type must be \"Patient\""
}
```

## 2. Operação READ (GET /Patient/{id})

### Exemplo
```bash
curl -X GET http://localhost:3000/Patient/1
```

### Resposta de Sucesso (200 OK)
```json
{
  "resourceType": "Patient",
  "identifier": [
    {
      "value": "1"
    }
  ],
  "active": true,
  "name": [
    {
      "given": ["João"],
      "family": "Silva"
    }
  ],
  "gender": "male"
}
```

### Resposta de Erro (404 Not Found)
```json
{
  "error": "Not Found",
  "message": "Patient with ID 999 not found"
}
```

## 3. Operação UPDATE (PUT /Patient/{id})

### Exemplo
```bash
curl -X PUT http://localhost:3000/Patient/1 \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "identifier": [
      {
        "value": "1"
      }
    ],
    "active": true,
    "name": [
      {
        "given": ["João", "Carlos"],
        "family": "Silva"
      }
    ],
    "telecom": [
      {
        "system": "phone",
        "value": "(51) 99999-9999"
      }
    ],
    "gender": "male",
    "birthDate": "1990-01-15"
  }'
```

### Resposta de Sucesso (200 OK)
```json
{
  "resourceType": "Patient",
  "identifier": [
    {
      "value": "1"
    }
  ],
  "active": true,
  "name": [
    {
      "given": ["João", "Carlos"],
      "family": "Silva"
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "(51) 99999-9999"
    }
  ],
  "gender": "male",
  "birthDate": "1990-01-15"
}
```

### Resposta de Erro (400 Bad Request)
```json
{
  "error": "Bad Request",
  "message": "Patient ID in body must match URL parameter"
}
```

## 4. Operação DELETE (DELETE /Patient/{id})

### Exemplo
```bash
curl -X DELETE http://localhost:3000/Patient/1
```

### Resposta de Sucesso (204 No Content)
```
(Sem conteúdo na resposta)
```

### Resposta de Erro (404 Not Found)
```json
{
  "error": "Not Found",
  "message": "Patient with ID 1 not found"
}
```

## 5. Operação PATIENT IDS (GET /PatientIDs)

### Exemplo
```bash
curl -X GET http://localhost:3000/PatientIDs
```

### Resposta com Dados (200 OK)
```json
[1, 2, 3, 5, 8, 11]
```

### Resposta Sem Dados (204 No Content)
```
(Sem conteúdo na resposta)
```

## Exemplos de Fluxo Completo

### Cenário: Cadastrar e Gerenciar um Paciente

1. **Criar paciente**
```bash
curl -X POST http://localhost:3000/Patient \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "active": true,
    "name": [{"given": ["Ana"], "family": "Costa"}],
    "gender": "female",
    "birthDate": "1992-03-20",
    "telecom": [
      {"system": "phone", "value": "(21) 98765-4321"},
      {"system": "email", "value": "ana.costa@example.com"}
    ]
  }'
```

2. **Verificar criação**
```bash
curl -X GET http://localhost:3000/PatientIDs
```

3. **Buscar detalhes do paciente**
```bash
curl -X GET http://localhost:3000/Patient/1
```

4. **Atualizar informações**
```bash
curl -X PUT http://localhost:3000/Patient/1 \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "identifier": [{"value": "1"}],
    "active": true,
    "name": [{"given": ["Ana", "Beatriz"], "family": "Costa"}],
    "gender": "female",
    "birthDate": "1992-03-20",
    "telecom": [
      {"system": "phone", "value": "(21) 98765-4321"},
      {"system": "email", "value": "ana.costa@example.com"}
    ],
    "address": [
      {
        "line": ["Av. Copacabana, 456"],
        "city": "Rio de Janeiro",
        "state": "RJ",
        "postalCode": "22000-000"
      }
    ]
  }'
```

5. **Excluir paciente**
```bash
curl -X DELETE http://localhost:3000/Patient/1
```

## Testando com JavaScript (Fetch API)

### Criar Paciente
```javascript
const createPatient = async () => {
  const patient = {
    resourceType: "Patient",
    active: true,
    name: [{ given: ["Pedro"], family: "Oliveira" }],
    gender: "male",
    birthDate: "1988-12-10"
  };

  try {
    const response = await fetch('http://localhost:3000/Patient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patient)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Paciente criado:', result);
    } else {
      const error = await response.json();
      console.error('Erro:', error);
    }
  } catch (err) {
    console.error('Erro de rede:', err);
  }
};
```

### Buscar Paciente
```javascript
const getPatient = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/Patient/${id}`);
    
    if (response.ok) {
      const patient = await response.json();
      console.log('Paciente encontrado:', patient);
    } else if (response.status === 404) {
      console.log('Paciente não encontrado');
    }
  } catch (err) {
    console.error('Erro de rede:', err);
  }
};
```

### Listar IDs
```javascript
const getPatientIDs = async () => {
  try {
    const response = await fetch('http://localhost:3000/PatientIDs');
    
    if (response.status === 200) {
      const ids = await response.json();
      console.log('IDs dos pacientes:', ids);
    } else if (response.status === 204) {
      console.log('Nenhum paciente cadastrado');
    }
  } catch (err) {
    console.error('Erro de rede:', err);
  }
};
```

## Validações e Erros Comuns

### 1. Resource Type Inválido
```bash
# Erro: resourceType deve ser "Patient"
curl -X POST http://localhost:3000/Patient \
  -H "Content-Type: application/json" \
  -d '{"resourceType": "Person", "name": [{"given": ["João"]}]}'
```

### 2. Gênero Inválido
```bash
# Erro: gender deve ser male, female, other ou unknown
curl -X POST http://localhost:3000/Patient \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "gender": "masculino",
    "name": [{"given": ["João"]}]
  }'
```

### 3. ID Inválido no Update
```bash
# Erro: ID no body deve corresponder ao ID na URL
curl -X PUT http://localhost:3000/Patient/1 \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "identifier": [{"value": "2"}],
    "name": [{"given": ["João"]}]
  }'
```

### 4. JSON Malformado
```bash
# Erro: JSON inválido
curl -X POST http://localhost:3000/Patient \
  -H "Content-Type: application/json" \
  -d '{"resourceType": "Patient", "name": [{"given": ["João"]'
```

## Códigos de Status Detalhados

| Código | Descrição | Quando Ocorre |
|--------|-----------|---------------|
| 200 | OK | GET e PUT bem-sucedidos |
| 201 | Created | POST bem-sucedido |
| 204 | No Content | DELETE bem-sucedido ou GET /PatientIDs vazio |
| 400 | Bad Request | Dados inválidos ou malformados |
| 404 | Not Found | Recurso não encontrado |
| 422 | Unprocessable Entity | Dados válidos mas não processáveis |
| 500 | Internal Server Error | Erro interno do servidor |

## Headers Importantes

### Requisições
- `Content-Type: application/json` (obrigatório para POST e PUT)

### Respostas
- `Location: /Patient/{id}` (em respostas 201 Created)
- `Content-Type: application/json` (em respostas com conteúdo)

## Dicas para Testes

1. **Use ferramentas como Postman ou Insomnia** para testes visuais
2. **Verifique sempre os códigos de status** antes de processar a resposta
3. **Implemente tratamento de erro** adequado na aplicação cliente
4. **Teste cenários de borda** como IDs inexistentes, dados inválidos, etc.
5. **Use console.log** para debug durante desenvolvimento
