let currentModel = 'grok-4';
let conversationHistory = [];
let lastUserMessageContent = '';

function getInviteCode() {
    const charCodes = [116, 97, 98, 99, 111, 100, 101, 100, 52, 52, 36, 36];
    return charCodes.map(c => String.fromCharCode(c)).join('');
}

function createMessageElement(message, isReplying) {
    const isUser = message.role === 'user';
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message ai-message';

    if (!isUser && isReplying) {
        const replyContextDiv = document.createElement('div');
        replyContextDiv.className = 'reply-context';
        
        const replyLine = document.createElement('div');
        replyLine.className = 'reply-line';
        
        const replyUserName = document.createElement('div');
        replyUserName.className = 'reply-user-name';
        replyUserName.textContent = 'You';

        replyContextDiv.appendChild(replyLine);
        replyContextDiv.appendChild(replyUserName);
        messageDiv.appendChild(replyContextDiv);
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
    
    if (isUser) {
        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(wrapperDiv);
    } else {
        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(wrapperDiv);
    }
    
    return messageDiv;
}


function appendMessage(message, isReplying = false) {
    const messagesContainer = document.getElementById('messages-container');
    const messageElement = createMessageElement(message, isReplying);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const text = messageInput.value.trim();
    if (text === '') return;

    const userMessage = { role: 'user', content: text };
    conversationHistory.push(userMessage);
    lastUserMessageContent = text;
    appendMessage(userMessage);
    messageInput.value = '';
    messageInput.style.height = 'auto';

    const aiMessage = { role: 'assistant', content: '' };
    const aiMessageElement = createMessageElement(aiMessage, true);
    const aiContentDiv = aiMessageElement.querySelector('.message-content');
    document.getElementById('messages-container').appendChild(aiMessageElement);
    
    try {
        const stream = await window.puter.ai.chat(conversationHistory, { model: currentModel, stream: true });
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
        loginButton.parentElement.innerHTML = `<p>Signed in as ${user.username}</p>`;
        logoutButton.classList.remove('hidden');
    } else {
        loginButton.parentElement.innerHTML = `<p>Sign in to sync your history across devices.</p><button id="login-button" class="login-btn">Login</button>`;
        document.getElementById('login-button').addEventListener('click', handleLogin);
        logoutButton.classList.add('hidden');
    }
}

async function handleLogin() {
    try {
        const user = await window.puter.auth.signIn();
        if (user) {
            updateLoginState(user);
            document.getElementById('settings-modal').classList.add('hidden');
        }
    } catch (error) {
        console.error("Login failed:", error);
    }
}

async function handleLogout() {
    try {
        await window.puter.auth.signOut();
        updateLoginState(null);
    } catch (error) {
        console.error("Logout failed:", error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const elements = {
        submitButton: document.getElementById('submit-button'),
        inviteInput: document.getElementById('invite-input'),
        sendButton: document.getElementById('send-button'),
        messageInput: document.getElementById('message-input'),
        modelSwitcher: document.getElementById('model-switcher'),
        settingsButton: document.getElementById('settings-button'),
        closeSettingsButton: document.getElementById('close-settings-button'),
        settingsModal: document.getElementById('settings-modal'),
        tabButtons: document.querySelectorAll('.tab-button'),
        loginButton: document.getElementById('login-button'),
        logoutButton: document.getElementById('logout-button'),
        saveSettingsButton: document.getElementById('save-settings-button'),
    };

    elements.submitButton.addEventListener('click', handleSubmission);
    elements.inviteInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSubmission());

    elements.sendButton.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    elements.messageInput.addEventListener('input', () => {
        elements.messageInput.style.height = 'auto';
        elements.messageInput.style.height = `${elements.messageInput.scrollHeight}px`;
    });

    elements.modelSwitcher.addEventListener('change', (e) => { currentModel = e.target.value; });

    elements.settingsButton.addEventListener('click', () => elements.settingsModal.classList.remove('hidden'));
    elements.closeSettingsButton.addEventListener('click', () => elements.settingsModal.classList.add('hidden'));
    elements.settingsModal.addEventListener('click', (e) => e.target === elements.settingsModal && elements.settingsModal.classList.add('hidden'));

    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            elements.tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    elements.loginButton.addEventListener('click', handleLogin);
    elements.logoutButton.addEventListener('click', handleLogout);
    
    elements.saveSettingsButton.addEventListener('click', () => {
        elements.settingsModal.classList.add('hidden');
    });

    try {
        const user = await window.puter.auth.user();
        updateLoginState(user);
    } catch (error) {
        console.error("Failed to get initial user state:", error);
        updateLoginState(null);
    }
});
