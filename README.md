# PatientsOnFIRE - Sistema Distribuído de Gerenciamento de Pacientes

**Trabalho Prático de Sistemas Distribuídos - UFCSPA**  
**Disciplina:** Fundamento de Redes e Sistemas Distribuídos - 2025/02  
**Professor:** João Gluz

## Visão Geral

O PatientsOnFIRE (Patients On FHIR Information Retrieval Environment) é um sistema distribuído cliente/servidor projetado para gerenciar registros de pacientes seguindo o padrão HL7 FHIR v5.0.0. O sistema é composto por:

1. **Servidor PatientsOnFIRE**: API REST implementada em Node.js que oferece operações CRUD sobre recursos Patient
2. **Cliente CRUDEPatients**: Interface web HTML/JavaScript para interação com o servidor

## Arquitetura do Sistema

### Servidor (PatientsOnFIRE)
- **Tecnologia**: Node.js com Express
- **API**: RESTful seguindo diretrizes FHIR v5.0.0
- **Formato**: JSON apenas
- **Armazenamento**: Em memória (Map)
- **Porta**: 3000 (configurável via PORT)

### Cliente (CRUDEPatients)
- **Tecnologia**: HTML5, CSS3, JavaScript (ES6+)
- **Interface**: Aplicação web responsiva
- **Comunicação**: Fetch API para requisições HTTP

## Funcionalidades Implementadas

### API REST (Servidor)

#### 1. CREATE - Criar Paciente
- **Endpoint**: `POST /Patient`
- **Descrição**: Cria um novo registro de paciente
- **Resposta**: 201 Created com Location header
- **Exemplo**:
```json
POST /Patient
{
  "resourceType": "Patient",
  "name": [{"given": ["João"], "family": "Silva"}],
  "gender": "male",
  "active": true
}
```

#### 2. READ - Ler Paciente
- **Endpoint**: `GET /Patient/{id}`
- **Descrição**: Recupera um paciente específico por ID
- **Resposta**: 200 OK com dados do paciente
- **Exemplo**: `GET /Patient/1`

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
   - Visualização de todos os pacientes cadastrados
   - Cartões informativos com dados principais
   - Ações rápidas (Ver, Editar, Excluir)

2. **Criar Paciente**
   - Formulário intuitivo para cadastro
   - Validação de campos obrigatórios
   - Campos suportados: nome, sobrenome, gênero, data nascimento, telefone, email, endereço

3. **Buscar e Gerenciar**
   - Busca por ID específico
   - Visualização detalhada dos dados
   - Edição inline com formulário
   - Exclusão com confirmação

4. **Editor JSON**
   - Criação/edição direta via JSON FHIR
   - Template de exemplo
   - Validação e formatação automática
   - Suporte completo ao padrão FHIR v5.0.0

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
│   └── app.js                # Lógica JavaScript do cliente
└── docs/
    └── api-examples.md       # Exemplos de uso da API
```

## Pré-requisitos

- **Node.js** v14+ 
- **npm** v6+
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

## Instalação e Execução

### 1. Clonar/Extrair o projeto
```bash
# Se usando Git
git clone <repository-url>
cd patients-on-fire

# Ou extrair ZIP fornecido
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

O sistema implementa um subconjunto da especificação FHIR Patient v5.0.0, incluindo:

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

## Validações Implementadas

### Servidor:
- Validação de resourceType = "Patient"
- Validação de tipos de dados (arrays, objetos)
- Validação de gênero (male, female, other, unknown)
- Validação de IDs numéricos positivos
- Validação de consistência identifier vs URL

### Cliente:
- Validação de campos obrigatórios nos formulários
- Validação de formato JSON no editor
- Validação de IDs numéricos
- Confirmação para operações destrutivas (exclusão)

## Recursos Adicionais

### Interface Responsiva
- Design adaptativo para desktop e mobile
- Navegação por abas intuitiva
- Feedback visual para todas as operações
- Mensagens de status em tempo real

### Tratamento de Erros
- Mensagens de erro claras e específicas
- Recuperação automática de falhas temporárias
- Log de erros no console para debug

### Experiência do Usuário
- Loading states durante operações
- Confirmações para ações críticas
- Auto-refresh da lista após modificações
- Estados vazios informativos

## Limitações Conhecidas

1. **Armazenamento**: Dados são perdidos ao reiniciar o servidor (apenas memória)
2. **Concorrência**: Não há controle de concorrência entre múltiplos clientes
3. **Autenticação**: Não implementada (fora do escopo do trabalho)
4. **Campos FHIR**: Subconjunto limitado dos campos Patient completos
5. **Persistência**: Para persistência real, seria necessário integrar banco de dados

## Tecnologias Utilizadas

### Backend:
- **Node.js**: Runtime JavaScript
- **Express**: Framework web minimalista
- **CORS**: Middleware para Cross-Origin Resource Sharing
- **Body-Parser**: Middleware para parsing JSON

### Frontend:
- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos com Flexbox/Grid
- **JavaScript ES6+**: Funcionalidades modernas (async/await, arrow functions)
- **Fetch API**: Requisições HTTP assíncronas

## Conclusão

O sistema PatientsOnFIRE demonstra com sucesso a implementação de um sistema distribuído cliente/servidor seguindo os princípios REST e a especificação FHIR v5.0.0. A arquitetura modular permite fácil manutenção e extensão, enquanto a interface web oferece uma experiência de usuário intuitiva para gerenciamento completo de registros de pacientes.

O projeto atende todos os requisitos especificados no trabalho prático, fornecendo uma base sólida para futuras extensões como persistência em banco de dados, autenticação, e funcionalidades avançadas de busca e relatórios.
