const INVITE_CODE = "tabcoded44$$";
const CHAT_HISTORY_KEY = 'chatHistory';
const SETTINGS_KEY = 'appSettings';
const AI_MODELS = [
    { id: 'grok-4', name: 'Grok-4 (Default)' },
    { id: 'llama-3-8b-8192', name: 'Llama-3-8B' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral-8x7B' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' }
];

function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        return settings || { 
            aiModel: 'grok-4', 
            fastResponse: false 
        };
    } catch (e) {
        return { 
            aiModel: 'grok-4', 
            fastResponse: false 
        };
    }
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
}

function renderMessage(content, role) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${role}-message`;
    messageElement.textContent = content;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveChatHistory(history) {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}

function getChatHistory() {
    const history = localStorage.getItem(CHAT_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
}

function renderHistory(history) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = ''; 
    renderMessage("Hello and welcome to prysmis ai what can i do for you?", "ai");
    history.forEach(item => {
        renderMessage(item.content, item.role);
    });
}

function handleRegistration() {
    const username = document.getElementById('username-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    const inviteCode = document.getElementById('invite-code-input').value;
    const errorMessage = document.getElementById('error-message');
    
    if (username.length > 0 && password.length > 0 && inviteCode === INVITE_CODE) {
        errorMessage.textContent = '';
        
        const loginScreen = document.getElementById('login-screen');
        const chatScreen = document.getElementById('chat-screen');
        
        loginScreen.style.opacity = '0';
        
        setTimeout(() => {
            loginScreen.style.display = 'none';
            chatScreen.style.display = 'flex';
            
            const history = getChatHistory();
            if (history.length > 0) {
                renderHistory(history);
            }
        }, 500);

    } else {
        errorMessage.textContent = 'Invalid credentials or invite code.';
    }
}

function createThinkingAnimation() {
    const thinking = document.createElement('div');
    thinking.className = 'thinking-animation ai-message';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'thinking-dot';
        thinking.appendChild(dot);
    }
    return thinking;
}

async function handleChatInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        const chatMessages = document.getElementById('chat-messages');
        const settings = loadSettings();

        if (!message) return;
            
        renderMessage(message, "user");

        chatInput.value = '';
        chatInput.style.height = 'auto';

        let thinkingAnimation;
        if (!settings.fastResponse) {
            thinkingAnimation = createThinkingAnimation();
            chatMessages.appendChild(thinkingAnimation);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        const history = getChatHistory();
        history.push({ role: "user", content: message });
        saveChatHistory(history);

        try {
            const aiResponse = await puter.ai.chat.complete({
                model: settings.aiModel,
                messages: history.slice(-5) 
            });

            if (thinkingAnimation) {
                chatMessages.removeChild(thinkingAnimation);
            }
            const responseText = aiResponse.choices[0].message.content;

            renderMessage(responseText, "ai");
            
            history.push({ role: "ai", content: responseText });
            saveChatHistory(history);

        } catch (e) {
            console.error("AI response error:", e);
            if (thinkingAnimation) {
                chatMessages.removeChild(thinkingAnimation);
            }
            renderMessage("Sorry, I ran into an error trying to get a response. Please check if you are logged in to Puter.", "ai");
        }
    }
}

function handlePuterLogin() {
    if (window.puter && window.puter.auth && window.puter.auth.signIn) {
        window.puter.auth.signIn();
    } else {
        alert("Puter authentication library is not available.");
    }
}

function handlePuterLogout() {
    if (window.puter && window.puter.auth && window.puter.auth.signOut) {
        window.puter.auth.signOut().then(() => {
            alert("Logged out successfully.");
        }).catch(e => {
            console.error("Logout failed:", e);
        });
    } else {
        alert("Puter authentication library is not available.");
    }
}

function populateModelDropdown() {
    const select = document.getElementById('ai-model-select');
    AI_MODELS.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        select.appendChild(option);
    });
}

function openSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    settingsModal.style.display = 'flex';
    
    const settings = loadSettings();
    document.getElementById('ai-model-select').value = settings.aiModel;
    document.getElementById('fast-response-toggle').checked = settings.fastResponse;
    
    updateAuthStatus();
    switchTab('ai-settings'); 
}

function closeSettingsModal() {
    document.getElementById('settings-modal').style.display = 'none';
}

function switchTab(tabName) {
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    document.querySelectorAll('.sidebar-button').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        }
    });
}

function handleSaveSettings() {
    const newSettings = {
        aiModel: document.getElementById('ai-model-select').value,
        fastResponse: document.getElementById('fast-response-toggle').checked
    };

    saveSettings(newSettings);
    alert("Settings saved successfully!");
    closeSettingsModal();
}

function updateAuthStatus() {
    const authStatusDisplay = document.getElementById('auth-status-display');
    if (window.puter && window.puter.auth) {
        const user = puter.auth.user;
        if (user) {
            authStatusDisplay.textContent = `Logged in as: ${user.name || user.id}`;
            authStatusDisplay.style.color = '#5dff5d';
        } else {
            authStatusDisplay.textContent = 'Logged Out';
            authStatusDisplay.style.color = '#ff6b6b';
        }
    }
}

window.onload = function() {
    const createAccountBtn = document.getElementById('create-account-btn');
    const chatInput = document.getElementById('chat-input');
    const puterLoginBtn = document.getElementById('puter-login-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const sidebarButtons = document.querySelectorAll('.sidebar-button');
    const puterLogoutBtn = document.getElementById('puter-logout-btn');

    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', handleRegistration);
    }

    if (chatInput) {
        chatInput.addEventListener('input', autoResizeTextarea);
        chatInput.addEventListener('keydown', handleChatInput);
    }

    if (puterLoginBtn) {
        puterLoginBtn.addEventListener('click', handlePuterLogin);
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeSettingsModal);
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', handleSaveSettings);
    }

    sidebarButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.getAttribute('data-tab'));
        });
    });

    if (puterLogoutBtn) {
        puterLogoutBtn.addEventListener('click', handlePuterLogout);
    }

    if (window.puter && window.puter.auth) {
        puter.auth.onAuthStateChanged(updateAuthStatus);
    }
    
    populateModelDropdown();
    renderHistory(getChatHistory());
};
