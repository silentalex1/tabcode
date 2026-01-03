const loginBtn = document.getElementById('login-btn');
const authPage = document.getElementById('auth-page');
const chatPage = document.getElementById('chat-page');
const chatViewport = document.getElementById('chat-view-viewport');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');

loginBtn.addEventListener('click', async () => {
    const user = await puter.auth.signIn();
    if (user) {
        window.history.pushState({}, '', '/aichat');
        authPage.style.opacity = '0';
        setTimeout(() => {
            authPage.classList.add('hidden');
            chatPage.classList.remove('hidden');
        }, 500);
    }
});

userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && userInput.value.trim() !== "") {
        const query = userInput.value;
        userInput.value = "";
        
        chatViewport.classList.add('zoom-active');
        
        createMessageElement('user', query);
        
        try {
            const response = await puter.ai.chat(query, { model: 'gemini-3' });
            renderAIResponse(response.toString());
        } catch (err) {
            renderAIResponse("System Error: Connection to Gemini 3 failed.");
        }
    }
});

function createMessageElement(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}-message`;
    div.innerHTML = `<div style="font-size:0.7rem; color: #444; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">${role}</div><div>${text}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

async function renderAIResponse(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ai-response';
    msgDiv.innerHTML = `<div style="font-size:0.7rem; color: #4facfe; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">PrysmisAI</div><div class="text-target"></div>`;
    chatMessages.appendChild(msgDiv);

    const target = msgDiv.querySelector('.text-target');
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
        const span = document.createElement('span');
        span.className = 'word';
        span.style.animationDelay = `${i * 0.03}s`;
        span.textContent = words[i] + ' ';
        target.appendChild(span);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    const cursor = document.createElement('span');
    cursor.className = 'cursor cursor-blink';
    target.appendChild(cursor);

    setTimeout(() => {
        runNeuralPass(msgDiv, cursor, target);
    }, (words.length * 30) + 500);
}

function runNeuralPass(parent, cursor, target) {
    const scanner = document.createElement('div');
    scanner.className = 'neural-line scan-anim';
    parent.appendChild(scanner);

    const words = target.querySelectorAll('.word');
    words.forEach((w, idx) => {
        if (idx % 7 === 0) { 
            w.classList.add('glow-phrase');
        }
    });

    setTimeout(() => {
        cursor.classList.remove('cursor-blink');
        setTimeout(() => {
            cursor.style.opacity = '0';
            cursor.style.transition = 'opacity 1s';
            words.forEach(w => w.classList.remove('glow-phrase'));
            chatViewport.classList.remove('zoom-active');
        }, 1000);
    }, 1200);
}
