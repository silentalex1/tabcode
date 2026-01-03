const loginBtn = document.getElementById('login-btn');
const authPage = document.getElementById('auth-page');
const chatPage = document.getElementById('chat-page');
const chatViewport = document.getElementById('chat-viewport');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const historyList = document.getElementById('history-list');
const codePanel = document.getElementById('code-panel');
const artifactContent = document.getElementById('artifact-content');
const closePanel = document.getElementById('close-panel');
const copyBtn = document.getElementById('copy-artifact');

let currentCode = "";

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

userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

userInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        userInput.value = "";
        userInput.style.height = 'auto';
        
        const welcome = document.querySelector('.welcome-msg');
        if (welcome) welcome.remove();

        chatViewport.classList.add('zoom-active');
        appendMsg('user', text);
        saveToHistory(text);

        try {
            const response = await puter.ai.chat(text);
            renderAI(response.toString());
        } catch (err) {
            renderAI("System error. Please retry.");
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
        .replace(/\b(const|let|var|function|return|if|else|for|while|local|end|then)\b/g, '<span class="token-keyword">$1</span>')
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="token-string">$1</span>')
        .replace(/\b(\w+)(?=\()/g, '<span class="token-function">$1</span>');
}

async function renderAI(text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<div class="ai-label label">Prysmis</div><div class="content"></div>`;
    chatMessages.appendChild(div);
    const target = div.querySelector('.content');

    const codeRegex = /```([\s\S]*?)```/g;
    let match;
    let lastIdx = 0;
    let foundCode = false;

    while ((match = codeRegex.exec(text)) !== null) {
        const plainText = text.substring(lastIdx, match.index);
        await streamText(target, plainText);

        currentCode = match[1].trim();
        artifactContent.innerHTML = `<pre>${highlightCode(currentCode)}</pre>`;
        codePanel.classList.remove('hidden');
        foundCode = true;
        
        const placeholder = document.createElement('div');
        placeholder.style.color = 'var(--accent)';
        placeholder.style.fontSize = '0.8rem';
        placeholder.style.margin = '10px 0';
        placeholder.textContent = '[Code Artifact Generated in Side Panel]';
        target.appendChild(placeholder);

        lastIdx = codeRegex.lastIndex;
    }

    await streamText(target, text.substring(lastIdx));
    setTimeout(() => chatViewport.classList.remove('zoom-active'), 400);
}

async function streamText(container, text) {
    if (!text) return;
    const words = text.split(/(\s+)/); 
    for (const word of words) {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        container.appendChild(span);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        await new Promise(r => setTimeout(r, 15));
    }
}

closePanel.onclick = () => codePanel.classList.add('hidden');

copyBtn.onclick = () => {
    navigator.clipboard.writeText(currentCode);
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy Code", 2000);
};

document.getElementById('new-chat-btn').onclick = () => {
    chatMessages.innerHTML = `<div class="welcome-msg"><h2>System Ready</h2><p>New session started.</p></div>`;
    codePanel.classList.add('hidden');
};
