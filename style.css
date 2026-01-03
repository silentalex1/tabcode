const loginBtn = document.getElementById('login-btn');
const authPage = document.getElementById('auth-page');
const chatPage = document.getElementById('chat-page');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');

loginBtn.addEventListener('click', async () => {
    const user = await puter.auth.signIn();
    if (user) {
        history.pushState({}, '', '/aichat');
        authPage.classList.add('hidden');
        chatPage.classList.remove('hidden');
    }
});

userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && userInput.value.trim() !== "") {
        const message = userInput.value;
        userInput.value = "";
        
        chatPage.classList.add('zoom-focus');
        
        appendMessage('User', message);
        
        const response = await puter.ai.chat(message);
        handleAIResponse(response);
    }
});

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.innerHTML = `<strong>${role}:</strong> ${text}`;
    msgDiv.style.marginBottom = "15px";
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleAIResponse(response) {
    const responseText = response.toString();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'ai-response';
    msgDiv.innerHTML = `<strong>PrysmisAI:</strong> <span class="text-content"></span>`;
    chatMessages.appendChild(msgDiv);

    const textSpan = msgDiv.querySelector('.text-content');
    const words = responseText.split(' ');
    
    for (let i = 0; i < words.length; i++) {
        textSpan.innerHTML += words[i] + ' ';
        await new Promise(r => setTimeout(r, 40));
    }

    triggerNeuralPass(msgDiv);
}

function triggerNeuralPass(element) {
    const scan = document.createElement('div');
    scan.className = 'neural-scan';
    element.appendChild(scan);

    const content = element.querySelector('.text-content');
    content.classList.add('glow-text');

    setTimeout(() => {
        content.classList.remove('glow-text');
        chatPage.classList.remove('zoom-focus');
    }, 2000);
}
