export const CONFIG = {
    API_BASE_URL: window.location.origin,
    MESSAGE_TIMEOUT: 5000,
    VALIDATION: {
        REQUIRED_FIELDS: ['given', 'family', 'gender'],
        GENDER_VALUES: ['male', 'female', 'other', 'unknown']
    },
    UI: {
        LOADING_TEXT: 'Carregando...',
        EMPTY_STATE_TITLE: 'Nenhum paciente encontrado',
        CONFIRM_DELETE: 'Tem certeza que deseja excluir o paciente'
    }
};
