const loginBtn = document.getElementById('login-btn');
const authPage = document.getElementById('auth-page');
const chatPage = document.getElementById('chat-page');
const chatViewport = document.getElementById('chat-viewport');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const historyList = document.getElementById('history-list');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');

(async () => {
    if (await puter.auth.isSignedIn()) {
        showChat();
    }
})();

loginBtn.onclick = async () => {
    const user = await puter.auth.signIn();
    if (user) showChat();
};

function showChat() {
    authPage.classList.add('hidden');
    chatPage.classList.remove('hidden');
}

async function handleMsg() {
    const query = userInput.value.trim();
    if (!query) return;

    userInput.value = "";
    chatViewport.classList.add('zoom-active');
    
    appendMessage('user', query);
    addToHistory(query);

    try {
        const response = await puter.ai.chat(query);
        await renderAI(response.toString());
    } catch (err) {
        appendMessage('ai', "Neural link interrupted. Please try again.");
    } finally {
        chatViewport.classList.remove('zoom-active');
    }
}

userInput.onkeypress = (e) => { if (e.key === 'Enter') handleMsg(); };
sendBtn.onclick = handleMsg;

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<div class="${role}-label label">${role === 'user' ? 'Access' : 'PrysmisAI'}</div><div class="content">${text}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
}

async function renderAI(text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<div class="ai-label label">PrysmisAI</div><div class="content"></div>`;
    chatMessages.appendChild(div);
    
    const target = div.querySelector('.content');
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
        const span = document.createElement('span');
        span.className = 'word';
        span.style.animationDelay = `${i * 0.02}s`;
        span.textContent = words[i] + ' ';
        target.appendChild(span);
        if (i % 5 === 0) chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function addToHistory(text) {
    const item = document.createElement('div');
    item.style = "padding:12px; margin-bottom:8px; border-radius:10px; background:var(--glass); font-size:0.85rem; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text-dim); border:1px solid transparent; transition:0.2s;";
    item.textContent = text;
    item.onmouseover = () => item.style.borderColor = 'var(--border)';
    item.onmouseout = () => item.style.borderColor = 'transparent';
    historyList.prepend(item);
}

newChatBtn.onclick = () => {
    chatMessages.innerHTML = "";
    userInput.focus();
};
