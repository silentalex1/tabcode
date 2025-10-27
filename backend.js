let currentModel = 'grok-4';
let conversationHistory = [];

function getInviteCode() {
    const charCodes = [116, 97, 98, 99, 111, 100, 101, 100, 52, 52, 36, 36];
    return charCodes.map(c => String.fromCharCode(c)).join('');
}

function createMessageElement(message, isReply) {
    const isUser = message.role === 'user';
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message ai-message';

    if (isReply) {
        messageDiv.classList.add('is-reply');
    }

    const senderDiv = document.createElement('div');
    senderDiv.className = 'message-sender';
    senderDiv.textContent = isUser ? 'You' : 'TABCODED AI';

    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'message-content-wrapper';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message.content;

    wrapperDiv.appendChild(contentDiv);
    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(wrapperDiv);
    return messageDiv;
}

function appendMessage(message, isReply = false) {
    const messagesContainer = document.getElementById('messages-container');
    const messageElement = createMessageElement(message, isReply);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
    if (typeof puter === 'undefined') {
        console.error("Puter.js is not loaded. Cannot send message.");
        return;
    }

    const messageInput = document.getElementById('message-input');
    const text = messageInput.value.trim();
    if (text === '') return;

    const userMessage = { role: 'user', content: text };
    conversationHistory.push(userMessage);
    appendMessage(userMessage);
    messageInput.value = '';
    messageInput.style.height = 'auto';

    const aiMessage = { role: 'assistant', content: '' };
    const aiMessageElement = createMessageElement(aiMessage, true);
    const aiContentDiv = aiMessageElement.querySelector('.message-content');
    document.getElementById('messages-container').appendChild(aiMessageElement);
    
    try {
        const stream = await puter.ai.chat(conversationHistory, { model: currentModel, stream: true });
        for await (const chunk of stream) {
            aiMessage.content += chunk;
            aiContentDiv.textContent = aiMessage.content;
            document.getElementById('messages-container').scrollTop = document.getElementById('messages-container').scrollHeight;
        }
        conversationHistory.push(aiMessage);
    } catch (error) {
        aiContentDiv.textContent = 'Sorry, an error occurred. Please try again.';
        console.error("Error with AI chat:", error);
    }
}

function handleSubmission() {
    const inviteInput = document.getElementById('invite-input');
    const inviteContainer = document.getElementById('invite-container');
    const chatInterface = document.getElementById('chat-interface');
    const errorMessage = document.getElementById('error-message');
    if (inviteInput.value.trim() === getInviteCode()) {
        inviteContainer.style.opacity = '0';
        setTimeout(() => {
            inviteContainer.classList.add('hidden');
            chatInterface.classList.remove('hidden');
            document.getElementById('message-input').focus();
        }, 500);
    } else {
        errorMessage.textContent = 'Incorrect code. Please try again.';
        inviteInput.value = '';
        setTimeout(() => { errorMessage.textContent = ''; }, 3000);
    }
}

function updateLoginState(user) {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    if (user) {
        loginButton.parentElement.style.display = 'none';
        logoutButton.classList.remove('hidden');
    } else {
        loginButton.parentElement.style.display = 'flex';
        logoutButton.classList.add('hidden');
    }
}

function initializeAuth() {
    if (typeof puter === 'undefined') {
        console.error("Puter.js is not loaded. Auth cannot be initialized.");
        updateLoginState(null);
        return;
    }
    
    puter.auth.onAuthStateChanged((user) => {
        updateLoginState(user);
    }).catch(error => {
        console.error("Failed to initialize auth state listener:", error);
        updateLoginState(null);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit-button');
    const inviteInput = document.getElementById('invite-input');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const modelSwitcher = document.getElementById('model-switcher');
    const settingsButton = document.getElementById('settings-button');
    const closeSettingsButton = document.getElementById('close-settings-button');
    const saveSettingsButton = document.getElementById('save-settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const tabButtons = document.querySelectorAll('.tab-button');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');

    submitButton.addEventListener('click', handleSubmission);
    inviteInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSubmission());

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = `${messageInput.scrollHeight}px`;
    });

    modelSwitcher.addEventListener('change', (e) => { currentModel = e.target.value; });

    settingsButton.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsButton.addEventListener('click', () => settingsModal.classList.add('hidden'));
    settingsModal.addEventListener('click', (e) => e.target === settingsModal && settingsModal.classList.add('hidden'));

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    saveSettingsButton.addEventListener('click', () => {
        console.log('Settings saved!');
        settingsModal.classList.add('hidden');
    });

    loginButton.addEventListener('click', async () => {
        if (typeof puter === 'undefined') {
            console.error("Puter.js is not loaded. Cannot sign in.");
            return;
        }
        try {
            const user = await puter.auth.signIn();
            if (user) {
                updateLoginState(user);
                settingsModal.classList.add('hidden');
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    });

    logoutButton.addEventListener('click', async () => {
        if (typeof puter === 'undefined') {
            console.error("Puter.js is not loaded. Cannot sign out.");
            return;
        }
        try {
            await puter.auth.signOut();
            updateLoginState(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    });

    initializeAuth();
});
