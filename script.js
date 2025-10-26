const P1 = "$$44dedocbat";

function D() {
    return P1.split('').reverse().join('');
}

// --- General Functions for Both UIs ---
function setupChatUI(chatInputId, chatMessagesId, loginScreenId, chatScreenId) {
    const chatInput = document.getElementById(chatInputId);
    const chatMessages = document.getElementById(chatMessagesId);
    const loginScreen = document.getElementById(loginScreenId);
    const chatScreen = document.getElementById(chatScreenId);

    // Function to handle login success and UI transition
    const handleLoginSuccess = () => {
        loginScreen.style.opacity = '0';
        setTimeout(() => {
            loginScreen.style.display = 'none';
            chatScreen.style.display = 'flex';
            
            // This class logic is only really necessary for the main UI's smoother opacity transition
            if (chatScreen.classList) {
                chatScreen.classList.add('visible');
            }
        }, 500);
    };

    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = (chatInput.scrollHeight) + 'px';
        });

        // Send message on Enter
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = chatInput.value.trim();
                if (message) {
                    // Check for the 'a+i' command only on the main chat interface
                    if (chatInputId === 'chat-input' && message.toLowerCase() === 'a+i') {
                        window.location.href = "homeworkhelper.html";
                        return;
                    }

                    const newMessage = document.createElement('div');
                    // Use appropriate class name for the respective page
                    newMessage.className = (chatInputId === 'chat-input') ? 'chat-message' : 'chat-message-helper';
                    newMessage.textContent = message;
                    chatMessages.appendChild(newMessage);

                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    chatInput.value = '';
                    chatInput.style.height = 'auto';
                }
            }
        });
    }

    return { handleLoginSuccess };
}

// --- Logic for the main index.html (Sophisticated UI) ---
function setupMainUI() {
    const mainUI = setupChatUI('chat-input', 'chat-messages', 'login-screen', 'chat-screen');
    
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
    const saveAiSettingsBtn = document.getElementById('save-ai-settings');
    const saveUserSettingsBtn = document.getElementById('save-user-settings');

    // Login handler
    if (submitLoginBtn) {
        submitLoginBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const inviteCode = inviteCodeInput.value;
            
            if (username && password && inviteCode === D()) {
                errorMessage.textContent = '';
                mainUI.handleLoginSuccess();
            } else {
                errorMessage.textContent = 'Invalid credentials or invite code.';
            }
        });
    }

    // Settings Modal Handlers
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => { settingsModal.style.display = 'flex'; });
        closeSettingsBtn.addEventListener('click', () => { settingsModal.style.display = 'none'; });
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) { settingsModal.style.display = 'none'; }
        });
    }

    // Settings Tab Logic
    const switchTab = (activeTab, activeContent, inactiveTab, inactiveContent) => {
        activeTab.classList.add('active');
        activeContent.classList.add('active');
        inactiveTab.classList.remove('active');
        inactiveContent.classList.remove('active');
    };
    if (aiSettingsTab && userSettingsTab) {
        aiSettingsTab.addEventListener('click', () => {
            switchTab(aiSettingsTab, aiSettingsContent, userSettingsTab, userSettingsContent);
        });
        userSettingsTab.addEventListener('click', () => {
            switchTab(userSettingsTab, userSettingsContent, aiSettingsTab, aiSettingsContent);
        });
    }

    // Save Settings
    if (saveAiSettingsBtn) {
        saveAiSettingsBtn.addEventListener('click', () => {
            // Logic to save AI settings
            console.log('AI Settings Saved.');
            settingsModal.style.display = 'none';
        });
    }
    if (saveUserSettingsBtn) {
        saveUserSettingsBtn.addEventListener('click', () => {
            // Logic to save User settings
            console.log('User Settings Saved.');
            settingsModal.style.display = 'none';
        });
    }

    // Puter Login
    if (puterLoginBtn) {
        puterLoginBtn.addEventListener('click', () => {
            if (window.puter && window.puter.auth) {
                window.puter.auth.login();
            } else {
                console.warn('Puter.js not fully loaded. Login cannot be initiated.');
            }
        });
    }
}

// --- Logic for the homeworkhelper.html (Simple UI) ---
function setupHelperUI() {
    const helperUI = setupChatUI('chat-input-helper', 'helper-chat-messages', 'helper-login-screen', 'helper-chat-screen');
    
    const submitLoginBtn = document.getElementById('helper-submit-login');
    const usernameInput = document.getElementById('helper-username-input');
    const passwordInput = document.getElementById('helper-password-input');
    const inviteCodeInput = document.getElementById('helper-invite-code-input');
    const errorMessage = document.getElementById('helper-error-message');

    // Login handler
    if (submitLoginBtn) {
        submitLoginBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const inviteCode = inviteCodeInput.value;
            
            if (username && password && inviteCode === D()) {
                errorMessage.textContent = '';
                helperUI.handleLoginSuccess();
            } else {
                errorMessage.textContent = 'Invalid credentials or invite code.';
            }
        });
    }
}


window.onload = function() {
    const path = window.location.pathname;

    if (path.endsWith('index.html') || path === '/') {
        setupMainUI();
    } else if (path.endsWith('homeworkhelper.html')) {
        setupHelperUI();
    }
};
