const loginBtn = document.getElementById('login-btn');
const authPage = document.getElementById('auth-page');
const chatPage = document.getElementById('chat-page');
const chatViewport = document.getElementById('chat-viewport');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const historyList = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat-btn');

// Authentication Logic
loginBtn.addEventListener('click', async () => {
    try {
        const user = await puter.auth.signIn();
        if (user) {
            transitionToChat();
        }
    } catch (e) {
        console.error("Authentication failed", e);
    }
});

function transitionToChat() {
    authPage.style.opacity = '0';
    setTimeout(() => {
        authPage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        window.history.pushState({}, '', '/aichat');
    }, 400);
}

// Check if already signed in on load
window.onload = async () => {
    if (puter.auth.isSignedIn()) {
        transitionToChat();
    }
};

// Handle Input
userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && userInput.value.trim() !== "") {
        const query = userInput.value;
        userInput.value = "";
        
        // Remove welcome message on first chat
        const welcome = document.querySelector('.welcome-msg');
        if (welcome) welcome.remove();

        chatViewport.classList.add('zoom-active');
        appendMessage('user', query);
        addToHistory(query);

        try {
            // Using a standard high-performance model
            const response = await puter.ai.chat(query);
            renderAI(response.toString());
        } catch (err) {
            renderAI("System connectivity lost. Please ensure your Puter session is active.");
            console.error(err);
        }
    }
});

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
        <div class="${role}-label label">${role === 'user' ? 'Access node' : 'Prysmis AI'}</div>
        <div class="content">${text}</div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addToHistory(text) {
    const item = document.createElement('div');
    item.style = `
        padding: 12px; 
        margin-bottom: 8px; 
        border-radius: 8px; 
        background: rgba(255,255,255,0.03); 
        font-size: 0.8rem; 
        cursor: pointer; 
        white-space: nowrap; 
        overflow: hidden; 
        text-overflow: ellipsis; 
        color: #94a3b8;
        border: 1px solid transparent;
        transition: all 0.2s;
    `;
    item.textContent = text;
    item.onmouseover = () => item.style.borderColor = 'rgba(59, 130, 246, 0.3)';
    item.onmouseout = () => item.style.borderColor = 'transparent';
    historyList.prepend(item);
}

async function renderAI(text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
        <div class="ai-label label">PrysmisAI</div>
        <div class="content" style="position:relative;"></div>
    `;
    chatMessages.appendChild(div);
    
    const target = div.querySelector('.content');
    const words = text.split(' ');
    
    // Smooth word-by-word streaming effect
    for(let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 40)); // Speed of typing
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = words[i] + ' ';
        target.appendChild(span);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Neural line effect after typing
    const line = document.createElement('div');
    line.className = 'neural-line';
    target.appendChild(line);
    
    setTimeout(() => {
        line.classList.add('scan-active');
        chatViewport.classList.remove('zoom-active');
    }, 100);
}

newChatBtn.onclick = () => {
    chatMessages.innerHTML = `
        <div class="welcome-msg">
            <h2>System Ready</h2>
            <p>New session initialized.</p>
        </div>
    `;
    chatViewport.classList.remove('zoom-active');
};
