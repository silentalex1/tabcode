const loginBtn = document.getElementById('login-btn');
const authPage = document.getElementById('auth-page');
const chatPage = document.getElementById('chat-page');
const chatViewport = document.getElementById('chat-viewport');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const historyList = document.getElementById('history-list');

loginBtn.addEventListener('click', async () => {
    const user = await puter.auth.signIn();
    if (user) {
        window.history.pushState({}, '', '/aichat');
        authPage.style.display = 'none';
        chatPage.classList.remove('hidden');
    }
});

userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && userInput.value.trim() !== "") {
        const query = userInput.value;
        userInput.value = "";
        
        chatViewport.classList.add('zoom-active');
        appendMessage('user', query);
        updateHistory(query);

        try {
            const resp = await puter.ai.chat(query, { model: 'google-gemini-3-pro' });
            renderAI(resp.toString());
        } catch (err) {
            renderAI("Critical Error: Please ensure you have an active Puter session and access to Gemini 3.");
        }
    }
});

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<div class="${role}-label label">${role}</div><div class="content">${text}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateHistory(text) {
    const item = document.createElement('div');
    item.style = "padding:10px; margin-bottom:5px; border-radius:6px; background:rgba(255,255,255,0.03); font-size:0.85rem; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#94a3b8;";
    item.textContent = text;
    historyList.prepend(item);
}

async function renderAI(text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<div class="ai-label label">PrysmisAI</div><div class="content" style="position:relative;"></div>`;
    chatMessages.appendChild(div);
    
    const target = div.querySelector('.content');
    const words = text.split(' ');
    
    for(let i=0; i<words.length; i++) {
        const span = document.createElement('span');
        span.className = 'word';
        span.style.animationDelay = `${i * 0.03}s`;
        span.textContent = words[i] + ' ';
        target.appendChild(span);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'neural-line scan-active';
        target.appendChild(line);
        
        setTimeout(() => {
            chatViewport.classList.remove('zoom-active');
        }, 1200);
    }, words.length * 30 + 500);
}

document.getElementById('new-chat-btn').onclick = () => {
    chatMessages.innerHTML = "";
    chatViewport.classList.remove('zoom-active');
};
