const INVITE_CODE = "tabcoded44$$";
const AI_MODEL = "grok-4";

function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
}

function handleLogin() {
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
            chatScreen.style.opacity = '1';
        }, 500);

    } else {
        errorMessage.textContent = 'Invalid credentials or invite code.';
    }
}

function createThinkingAnimation() {
    const thinking = document.createElement('div');
    thinking.className = 'thinking-animation';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'thinking-dot';
        thinking.appendChild(dot);
    }
    return thinking;
}

function handleChatInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        const chatMessages = document.getElementById('chat-messages');

        if (message) {
            const userMessage = document.createElement('div');
            userMessage.className = 'chat-message user-message';
            userMessage.textContent = message;
            chatMessages.appendChild(userMessage);

            chatMessages.scrollTop = chatMessages.scrollHeight;
            chatInput.value = '';
            chatInput.style.height = 'auto';

            
            const thinkingAnimation = createThinkingAnimation();
            chatMessages.appendChild(thinkingAnimation);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            
            setTimeout(() => {
                chatMessages.removeChild(thinkingAnimation);

                const aiMessage = document.createElement('div');
                aiMessage.className = 'chat-message ai-message';
                
                let mockResponse = `I processed your request using the ${AI_MODEL} model. Please ask me a question!`;
                if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
                    mockResponse = "Hello! I am ready to help you with your query. What can I assist you with today?";
                }
                
                aiMessage.textContent = mockResponse;
                chatMessages.appendChild(aiMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1800);
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

window.onload = function() {
    const createAccountBtn = document.getElementById('create-account-btn');
    const chatInput = document.getElementById('chat-input');
    const puterLoginBtn = document.getElementById('puter-login-btn');

    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', handleLogin);
    }

    if (chatInput) {
        chatInput.addEventListener('input', autoResizeTextarea);
        chatInput.addEventListener('keydown', handleChatInput);
    }

    if (puterLoginBtn) {
        puterLoginBtn.addEventListener('click', handlePuterLogin);
    }
};
