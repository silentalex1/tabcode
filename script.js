const loginBtn = document.getElementById('login-btn');
const authPage = document.getElementById('auth-page');
const chatPage = document.getElementById('chat-page');
const chatViewport = document.getElementById('chat-viewport');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const historyList = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat-btn');

loginBtn.addEventListener('click', async () => {
    try {
        const user = await puter.auth.signIn();
        if (user) {
            initSession();
        }
    } catch (e) {}
});

function initSession() {
    authPage.style.opacity = '0';
    setTimeout(() => {
        authPage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        window.history.pushState({}, '', '/chat');
    }, 500);
}

window.onload = async () => {
    if (puter.auth.isSignedIn()) {
        initSession();
    }
};

userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && userInput.value.trim() !== "") {
        const query = userInput.value;
        userInput.value = "";
        
        const welcome = document.querySelector('.welcome-msg');
        if (welcome) welcome.remove();

        chatViewport.classList.add('zoom-active');
        appendMessage('user', query);
        addToHistory(query);

        try {
            const response = await puter.ai.chat(query);
            renderAI(response.toString());
        } catch (err) {
            renderAI("System error. Re-initialize interface.");
        }
    }
});

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
        <div class="${role}-label label">${role === 'user' ? 'USER' : 'PRYSMIS'}</div>
        <div class="content">${text}</div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
}

function addToHistory(text) {
    const item = document.createElement('div');
    item.style = `
        padding: 10px 14px; 
        margin-bottom: 4px; 
        border-radius: 8px; 
        font-size: 0.8rem; 
        cursor: pointer; 
        white-space: nowrap; 
        overflow: hidden; 
        text-overflow: ellipsis; 
        color: var(--text-p);
        transition: background 0.2s;
    `;
    item.textContent = text;
    item.onmouseenter = () => item.style.background = 'rgba(255,255,255,0.03)';
    item.onmouseleave = () => item.style.background = 'transparent';
    historyList.prepend(item);
}

async function renderAI(text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
        <div class="ai-label label">PRYSMIS</div>
        <div class="content"></div>
    `;
    chatMessages.appendChild(div);
    
    const target = div.querySelector('.content');
    const words = text.split(' ');
    
    for(let i = 0; i < words.length; i++) {
        await new Promise(r => setTimeout(r, 35));
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = words[i] + ' ';
        target.appendChild(span);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    setTimeout(() => {
        chatViewport.classList.remove('zoom-active');
    }, 200);
}

newChatBtn.onclick = () => {
    chatMessages.innerHTML = `
        <div class="welcome-msg">
            <h2>System Online</h2>
            <p>New session initialized.</p>
        </div>
    `;
    chatViewport.classList.remove('zoom-active');
};
