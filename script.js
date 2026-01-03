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
        if (user) enterApp();
    } catch (err) {}
});

function enterApp() {
    authPage.classList.add('hidden');
    chatPage.classList.remove('hidden');
    window.history.pushState({}, '', '/chat');
}

window.onload = async () => {
    if (puter.auth.isSignedIn()) enterApp();
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
            renderAI("Connectivity error. Please try again.");
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
    const div = document.createElement('div');
    div.className = 'history-item';
    div.textContent = text;
    div.onclick = () => { userInput.value = text; userInput.focus(); };
    historyList.prepend(div);
}

function highlightCode(code) {
    return code
        .replace(/(\/\/.+)/g, '<span class="token-comment">$1</span>')
        .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|await|async|try|catch)\b/g, '<span class="token-keyword">$1</span>')
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="token-string">$1</span>')
        .replace(/\b(\w+)(?=\()/g, '<span class="token-function">$1</span>');
}

async function renderAI(text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<div class="ai-label label">Prysmis</div><div class="content"></div>`;
    chatMessages.appendChild(div);
    const target = div.querySelector('.content');

    const parts = text.split(/(```[\s\S]*?```)/g);

    for (const part of parts) {
        if (part.startsWith('```')) {
            const code = part.replace(/```/g, '').trim();
            const container = document.createElement('div');
            container.className = 'code-container';
            container.innerHTML = `
                <div class="code-header"><span>Code</span><button class="copy-btn">Copy</button></div>
                <pre class="code-content">${highlightCode(code)}</pre>
            `;
            container.querySelector('.copy-btn').onclick = (e) => {
                navigator.clipboard.writeText(code);
                e.target.textContent = 'Copied!';
                setTimeout(() => e.target.textContent = 'Copy', 2000);
            };
            target.appendChild(container);
        } else {
            const words = part.split(' ');
            for (const word of words) {
                if (word === "") continue;
                const span = document.createElement('span');
                span.className = 'word';
                span.innerHTML = word + '&nbsp;';
                target.appendChild(span);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                await new Promise(r => setTimeout(r, 40));
            }
        }
    }
    
    setTimeout(() => chatViewport.classList.remove('zoom-active'), 400);
}

newChatBtn.onclick = () => {
    chatMessages.innerHTML = `<div class="welcome-msg"><h2>Ready</h2><p>New session started.</p></div>`;
    chatViewport.classList.remove('zoom-active');
};
