const loginBtn = document.getElementById('login-btn');
const authPage = document.getElementById('auth-page');
const chatPage = document.getElementById('chat-page');
const chatViewport = document.getElementById('chat-viewport');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const historyList = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat-btn');

let chatHistory = [];

loginBtn.addEventListener('click', async () => {
    try {
        const user = await puter.auth.signIn();
        if (user) {
            enterApp();
        }
    } catch (err) {}
});

function enterApp() {
    authPage.style.opacity = '0';
    setTimeout(() => {
        authPage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        window.history.pushState({}, '', '/chat');
    }, 400);
}

window.onload = async () => {
    if (puter.auth.isSignedIn()) {
        enterApp();
    }
};

userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && userInput.value.trim() !== "") {
        const text = userInput.value;
        userInput.value = "";
        
        const welcome = document.querySelector('.welcome-msg');
        if (welcome) welcome.remove();

        chatViewport.classList.add('zoom-active');
        
        appendMsg('user', text);
        saveToHistory(text);

        try {
            const response = await puter.ai.chat(text);
            renderAI(response.toString());
        } catch (err) {
            renderAI("I am having trouble connecting. Please try again.");
        }
    }
});

function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
        <div class="${role}-label label">${role === 'user' ? 'You' : 'Prysmis'}</div>
        <div class="content">${text}</div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveToHistory(text) {
    const item = { prompt: text, id: Date.now() };
    chatHistory.push(item);
    
    const div = document.createElement('div');
    div.className = 'history-item';
    div.textContent = text;
    div.onclick = () => {
        userInput.value = text;
        userInput.focus();
    };
    historyList.prepend(div);
}

async function renderAI(text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
        <div class="ai-label label">Prysmis</div>
        <div class="content"></div>
    `;
    chatMessages.appendChild(div);
    
    const target = div.querySelector('.content');
    const words = text.split(' ');
    
    for(let i = 0; i < words.length; i++) {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = words[i] + ' '; 
        target.appendChild(span);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        await new Promise(r => setTimeout(r, 45));
    }

    setTimeout(() => {
        chatViewport.classList.remove('zoom-active');
    }, 300);
}

newChatBtn.onclick = () => {
    chatMessages.innerHTML = `
        <div class="welcome-msg">
            <h2>Ready</h2>
            <p>Started a new session.</p>
        </div>
    `;
    chatViewport.classList.remove('zoom-active');
};
