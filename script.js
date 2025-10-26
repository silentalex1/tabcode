const P1 = "$$44dedocbat";

function D() {
    return P1.split('').reverse().join('');
}

function calculate(expression) {
    try {
        const result = new Function('return ' + expression)();
        if (typeof result === 'number' && !isNaN(result)) {
            return result;
        }
        return 'Invalid expression';
    } catch (e) {
        return 'Error in calculation';
    }
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
                window.location.href = "homeworkhelper.html";
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


window.onload = function() {
    if (window.location.pathname.endsWith('homeworkhelper.html') || window.location.pathname.endsWith('homeworkhelper')) {
        const problemInput = document.getElementById('problem-input');
        const submitButton = document.getElementById('submit-button');
        const clearButton = document.getElementById('clear-button');
        const outputContent = document.getElementById('output-content');
        
        if (submitButton) {
            submitButton.addEventListener('click', () => {
                const problem = problemInput.value.trim();
                if (problem) {
                    outputContent.innerHTML = `Analyzing: **${problem}**<br><br>...Thinking Mode Activated. Generating advanced solution.`;
                    
                    setTimeout(() => {
                        let solutionText = `**Problem:** ${problem}<br><br>**Generated Solution:** Photosynthesis is the process used by plants, algae, and certain bacteria to convert light energy into chemical energy, which is stored in glucose. This process primarily takes place in the chloroplasts using chlorophyll. <br><br>The balanced chemical equation for photosynthesis is:<br>$$6CO_{2} + 6H_{2}O + \text{light energy} \longrightarrow C_{6}H_{12}O_{6} + 6O_{2}$$<br>This demonstrates the conversion of carbon dioxide and water into glucose and oxygen, driven by light.`;

                        const calcMatch = problem.match(/calculate: (.*)/i);
                        if (calcMatch) {
                            const expression = calcMatch[1].trim();
                            const result = calculate(expression);
                            solutionText = `**Calculation Request:** ${expression}<br><br>**Result (using integrated helper function):** ${result}`;
                        }

                        outputContent.innerHTML = solutionText;
                    }, 1500);
                } else {
                    outputContent.textContent = 'Please enter a homework problem to get a solution.';
                }
            });
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                problemInput.value = '';
                outputContent.textContent = 'The generated solution will appear here.';
            });
        }
    }
};
