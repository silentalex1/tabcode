const P1 = "$$44dedocbat";

function D() {
    return P1.split('').reverse().join('');
}

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const submitLoginBtn = document.getElementById('submit-login');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const inviteCodeInput = document.getElementById('invite-code-input');
const errorMessage = document.getElementById('error-message');

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');

const aiSettingsTab = document.getElementById('ai-settings-tab');
const userSettingsTab = document.getElementById('user-settings-tab');
const aiSettingsContent = document.getElementById('ai-settings-content');
const userSettingsContent = document.getElementById('user-settings-content');

const puterLoginBtn = document.getElementById('puter-login-btn');
const chatInput = document.getElementById('chat-input');
const saveAiSettingsBtn = document.getElementById('save-ai-settings');
const saveUserSettingsBtn = document.getElementById('save-user-settings');

submitLoginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const inviteCode = inviteCodeInput.value;
    
    if (username && password && inviteCode === D()) {
        errorMessage.textContent = '';
        
        loginScreen.style.opacity = '0';
        
        setTimeout(() => {
            loginScreen.style.display = 'none';
            chatScreen.style.display = 'flex';
            
            setTimeout(() => {
                chatScreen.classList.add('visible');
            }, 10);
        }, 500);

    } else {
        errorMessage.textContent = 'Invalid credentials or invite code.';
    }
});

settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

function switchTab(activeTab, activeContent, inactiveTab, inactiveContent) {
    activeTab.classList.add('active');
    activeContent.classList.add('active');
    inactiveTab.classList.remove('active');
    inactiveContent.classList.remove('active');
}

aiSettingsTab.addEventListener('click', () => {
    switchTab(aiSettingsTab, aiSettingsContent, userSettingsTab, userSettingsContent);
});

userSettingsTab.addEventListener('click', () => {
    switchTab(userSettingsTab, userSettingsContent, aiSettingsTab, aiSettingsContent);
});

puterLoginBtn.addEventListener('click', () => {
    if (window.puter && window.puter.auth) {
        window.puter.auth.login();
    } else {
        console.warn('Puter.js not fully loaded. Login cannot be initiated.');
    }
});

chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
});

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
            
            if (message.toLowerCase() === 'a+i') {
                window.location.href = "homeworkhelper"; 
                return;
            }

            const chatMessages = document.getElementById('chat-messages');
            const newMessage = document.createElement('div');
            newMessage.className = 'chat-message';
            newMessage.textContent = message;
            chatMessages.appendChild(newMessage);

            chatMessages.scrollTop = chatMessages.scrollHeight;
            chatInput.value = '';
            chatInput.style.height = 'auto';
        }
    }
});

saveAiSettingsBtn.addEventListener('click', () => {
    const model = document.getElementById('ai-model-dropdown').value;
    const fastSpeed = document.getElementById('fast-ai-switch').checked;
    
    console.log('AI Settings Saved:', { model, fastSpeed });
    settingsModal.style.display = 'none';
});

saveUserSettingsBtn.addEventListener('click', () => {
    console.log('User Settings Saved.');
    settingsModal.style.display = 'none';
});
