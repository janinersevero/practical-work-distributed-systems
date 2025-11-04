# PatientsOnFIRE - Sistema Distribuído de Gerenciamento de Pacientes

**Trabalho Prático de Sistemas Distribuídos - UFCSPA** 

**Disciplina:** Fundamento de Redes e Sistemas Distribuídos - 2025/02 

## Visão Geral

O PatientsOnFIRE (Patients On FHIR Information Retrieval Environment) é um sistema distribuído cliente/servidor projetado para gerenciar registros de pacientes seguindo o padrão HL7 FHIR v5.0.0. O sistema utiliza arquitetura modular com separação clara de responsabilidades para garantir manutenibilidade e extensibilidade.

## Arquitetura do Sistema

### Servidor (PatientsOnFIRE)
- **Tecnologia**: Node.js com Express
- **API**: RESTful seguindo diretrizes FHIR v5.0.0
- **Formato**: JSON apenas
- **Armazenamento**: Em memória (Map)
- **Porta**: 3000 (configurável via PORT)

### Cliente (CRUDEPatients) - Arquitetura Modular
O cliente utiliza arquitetura modular com separação clara de responsabilidades:

#### **Estrutura por Camadas:**
```
client/js/
├── app-main.js              # Ponto de entrada da aplicação
├── config.js                # Configurações centralizadas
├── components/              # Componentes reutilizáveis
│   └── message-service.js   # Serviço de mensagens para usuário
├── controllers/             # Controladores (MVC)
│   └── patient-list-controller.js
├── services/                # Camada de serviços
│   └── api-service.js       # Comunicação com API
└── utils/                   # Utilitários e helpers
    ├── formatter.js         # Formatação de dados
    └── patient-builder.js   # Construção/validação de entidades
```

## Funcionalidades Implementadas

### API REST (Servidor)

#### 1. CREATE - Criar Paciente
- **Endpoint**: `POST /Patient`
- **Descrição**: Cria um novo registro de paciente
- **Resposta**: 201 Created com Location header

#### 2. READ - Ler Paciente
- **Endpoint**: `GET /Patient/{id}`
- **Descrição**: Recupera um paciente específico por ID
- **Resposta**: 200 OK com dados do paciente

#### 3. UPDATE - Atualizar Paciente
- **Endpoint**: `PUT /Patient/{id}`
- **Descrição**: Atualiza um paciente existente
- **Resposta**: 200 OK com dados atualizados
- **Validação**: ID no body deve corresponder ao ID na URL

#### 4. DELETE - Excluir Paciente
- **Endpoint**: `DELETE /Patient/{id}`
- **Descrição**: Remove um paciente do sistema
- **Resposta**: 204 No Content (sucesso) ou 404 Not Found

#### 5. PATIENT IDS - Listar IDs
- **Endpoint**: `GET /PatientIDs`
- **Descrição**: Retorna array com IDs de todos os pacientes
- **Resposta**: 200 OK com array JSON ou 204 No Content se vazio

### Cliente Web (CRUDEPatients)

#### Funcionalidades da Interface:

1. **Lista de Pacientes**
   - Visualização com arquitetura MVC
   - Controlador dedicado para gerenciamento de lista
   - Cartões informativos com formatação consistente
   - Ações rápidas (Ver, Editar, Excluir)

2. **Criar Paciente**
   - Formulário com validação robusta via PatientBuilder
   - Construção de recursos FHIR padronizada
   - Tratamento de erros centralizado

3. **Buscar e Gerenciar**
   - Serviço de API dedicado para todas as operações
   - Formatação de dados através da classe Formatter
   - Estados de loading e erro bem definidos

4. **Editor JSON**
   - Validação de esquema FHIR integrada
   - Templates padronizados via PatientBuilder
   - Formatação automática e validação em tempo real

## Estrutura do Projeto

```
patients-on-fire/
├── package.json              # Configuração do projeto Node.js
├── README.md                  # Este arquivo
├── server/
│   └── server.js             # Servidor API REST
├── client/
│   ├── index.html            # Interface principal
│   ├── styles.css            # Estilos CSS
│   └── js/                   # Arquitetura modular ES6
│       ├── app-main.js       # Aplicação principal
│       ├── config.js         # Configurações
│       ├── components/       # Componentes reutilizáveis
│       │   └── message-service.js
│       ├── controllers/      # Controladores MVC
│       │   └── patient-list-controller.js
│       ├── services/         # Camada de serviços
│       │   └── api-service.js
│       └── utils/           # Utilitários
│           ├── formatter.js
│           └── patient-builder.js
└── docs/
    └── api-examples.md       # Exemplos de uso da API
```

## Pré-requisitos

- **Node.js** v14+ 
- **npm** v6+
- Navegador web moderno com suporte a ES6 modules

## Instalação e Execução

### 1. Clonar/Extrair o projeto
```bash
git clone <repository-url>
cd patients-on-fire
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Executar o servidor
```bash
# Produção
npm start

# Desenvolvimento (com auto-reload)
npm run dev
```

### 4. Acessar a aplicação
- **Interface Web**: http://localhost:3000
- **API Base**: http://localhost:3000
- **Exemplo API**: http://localhost:3000/PatientIDs

## Exemplos de Uso da API

### Criar um paciente
```bash
curl -X POST http://localhost:3000/Patient \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "active": true,
    "name": [{"given": ["Maria"], "family": "Santos"}],
    "gender": "female",
    "birthDate": "1985-06-15",
    "telecom": [
      {"system": "phone", "value": "(11) 99999-8888"},
      {"system": "email", "value": "maria.santos@email.com"}
    ]
  }'
```

### Buscar paciente por ID
```bash
curl -X GET http://localhost:3000/Patient/1
```

### Listar todos os IDs
```bash
curl -X GET http://localhost:3000/PatientIDs
```

### Atualizar paciente
```bash
curl -X PUT http://localhost:3000/Patient/1 \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "identifier": [{"value": "1"}],
    "active": true,
    "name": [{"given": ["Maria", "José"], "family": "Santos"}],
    "gender": "female"
  }'
```

### Excluir paciente
```bash
curl -X DELETE http://localhost:3000/Patient/1
```

## Especificação FHIR v5.0.0

O sistema implementa um subconjunto da especificação FHIR Patient v5.0.0:

### Campos Suportados:
- `resourceType`: Sempre "Patient"
- `identifier`: Array com identificador único numérico
- `active`: Boolean indicando se registro está ativo
- `name`: Array com objetos HumanName (given, family)
- `telecom`: Array com contacts (phone, email)
- `gender`: Enum (male, female, other, unknown)
- `birthDate`: String no formato YYYY-MM-DD
- `address`: Array com endereços

### Exemplo Completo de Resource Patient:
```json
{
  "resourceType": "Patient",
  "identifier": [{"value": "1"}],
  "active": true,
  "name": [
    {
      "given": ["João", "Carlos"],
      "family": "Silva"
    }
  ],
  "telecom": [
    {"system": "phone", "value": "(51) 99999-9999"},
    {"system": "email", "value": "joao.silva@email.com"}
  ],
  "gender": "male",
  "birthDate": "1990-01-15",
  "address": [
    {
      "line": ["Rua das Flores, 123"],
      "city": "Porto Alegre",
      "state": "RS",
      "postalCode": "90000-000"
    }
  ]
}
```

## Códigos de Status HTTP

### Respostas de Sucesso:
- `200 OK`: Operação realizada com sucesso (GET, PUT)
- `201 Created`: Recurso criado com sucesso (POST)
- `204 No Content`: Operação realizada sem conteúdo (DELETE, GET vazio)

### Respostas de Erro:
- `400 Bad Request`: Dados inválidos ou malformados
- `404 Not Found`: Recurso não encontrado
- `422 Unprocessable Entity`: Dados válidos mas não processáveis
- `500 Internal Server Error`: Erro interno do servidor

## Tecnologias Utilizadas

### Backend:
- **Node.js**: Runtime JavaScript
- **Express**: Framework web minimalista
- **CORS**: Middleware para Cross-Origin Resource Sharing
- **Body-Parser**: Middleware para parsing JSON

### Frontend:
- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos com Flexbox/Grid
- **JavaScript ES6+**: Módulos nativos, classes, async/await
- **Fetch API**: Requisições HTTP assíncronas via ApiService

## Conclusão

O sistema PatientsOnFIRE demonstra com sucesso a implementação de um sistema distribuído cliente/servidor seguindo os princípios REST e a especificação FHIR v5.0.0. A arquitetura modular resulta em:

- **Código limpo** e fácil de manter
- **Arquitetura robusta** e extensível
- **Separação clara de responsabilidades**
- **Reutilização eficiente** de componentes
- **Facilidade para testes**

A estrutura modular permite fácil extensão para funcionalidades avançadas como persistência em banco de dados, autenticação, busca avançada, e integração com outros sistemas FHIR, mantendo a qualidade e organização do código.
