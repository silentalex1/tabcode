const INVITE_CODE = "tabcoded44$$";
const AI_MODEL = "grok-4";
const CHAT_HISTORY_KEY = 'chatHistory';

function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
}

function saveChatHistory(history) {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}

function getChatHistory() {
    const history = localStorage.getItem(CHAT_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
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

function renderMessage(content, role) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${role}-message`;
    messageElement.textContent = content;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderHistory(history) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = ''; 
    renderMessage("Hello and welcome to prysmis ai what can i do for you?", "ai");
    history.forEach(item => {
        renderMessage(item.content, item.role);
    });
}

async function handleChatInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        const chatMessages = document.getElementById('chat-messages');

        if (message) {
            
            renderMessage(message, "user");

            chatInput.value = '';
            chatInput.style.height = 'auto';

            const thinkingAnimation = createThinkingAnimation();
            chatMessages.appendChild(thinkingAnimation);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const history = getChatHistory();
            history.push({ role: "user", content: message });
            saveChatHistory(history);

            try {
                const aiResponse = await puter.ai.chat.complete({
                    model: AI_MODEL,
                    messages: history.slice(-5) 
                });

                chatMessages.removeChild(thinkingAnimation);
                const responseText = aiResponse.choices[0].message.content;

                renderMessage(responseText, "ai");
                
                history.push({ role: "ai", content: responseText });
                saveChatHistory(history);

            } catch (e) {
                console.error("AI response error:", e);
                chatMessages.removeChild(thinkingAnimation);
                renderMessage("Sorry, I ran into an error trying to get a response.", "ai");
            }
        }
    }
}

function handlePuterLogin() {
    if (window.puter && window.puter.auth && window.puter.auth.signIn) {
        window.puter.auth.signIn();
    } else {
        console.error("Puter authentication library is not available.");
    }
}

function handlePuterLogout() {
    if (window.puter && window.puter.auth && window.puter.auth.signOut) {
        window.puter.auth.signOut().then(() => {
            alert("Logged out successfully.");
        }).catch(e => {
            console.error("Logout failed:", e);
        });
    }
}

window.onload = function() {
    const createAccountBtn = document.getElementById('create-account-btn');
    const chatInput = document.getElementById('chat-input');
    const puterLoginBtn = document.getElementById('puter-login-btn');
    const settingsBtn = document.getElementById('settings-btn');

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
        settingsBtn.addEventListener('click', () => {
            alert("Settings functionality would be implemented here, perhaps for user preferences or model selection!");
        });
    }

    renderHistory(getChatHistory());
};
