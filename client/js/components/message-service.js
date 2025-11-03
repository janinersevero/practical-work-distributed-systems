import { CONFIG } from '../config.js';

export class MessageService {
    static messagesContainer = null;

    static init() {
        this.messagesContainer = document.getElementById('messages');
        if (!this.messagesContainer) {
            console.warn('Messages container not found');
        }
    }

    /**
     * Show message to user
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, info, warning)
     */
    static show(message, type = 'info') {
        if (!this.messagesContainer) {
            console.warn('Message service not initialized');
            return;
        }

        const messageDiv = this._createMessageElement(message, type);
        this.messagesContainer.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, CONFIG.MESSAGE_TIMEOUT);
    }

    /**
     * Show success message
     * @param {string} message
     */
    static showSuccess(message) {
        this.show(message, 'success');
    }

    /**
     * Show error message
     * @param {string} message
     */
    static showError(message) {
        this.show(message, 'error');
    }

    /**
     * Show info message
     * @param {string} message
     */
    static showInfo(message) {
        this.show(message, 'info');
    }

    /**
     * Show warning message
     * @param {string} message
     */
    static showWarning(message) {
        this.show(message, 'warning');
    }

    /**
     * Create message DOM element
     * @private
     * @param {string} message
     * @param {string} type
     * @returns {HTMLElement}
     */
    static _createMessageElement(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        return messageDiv;
    }

    static clearAll() {
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
    }
}
