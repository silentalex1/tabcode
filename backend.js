let currentModel = 'grok-4';
let conversationHistory = [];

function getInviteCode() {
    const charCodes = [116, 97, 98, 99, 111, 100, 101, 100, 52, 52, 36, 36];
    let code = '';
    for (let i = 0; i < charCodes.length; i++) {
        code += String.fromCharCode(charCodes[i]);
    }
    return code;
}

function createMessageElement(message, isStreaming = false) {
    const messagesContainer = document.getElementById('messages-container');
    const messageDiv = document.createElement('div');
    const isUser = message.role === 'user';
    messageDiv.className = isUser ? 'message user-message' : 'message ai-message';

    const senderDiv = document.createElement('div');
    senderDiv.className = 'message-sender';
    senderDiv.textContent = isUser ? 'You' : 'TabCoded AI';

    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'message-content-wrapper';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message.content;
    
    if (!isUser && messagesContainer.lastChild) {
        const lastMessage = messagesContainer.lastChild;
        const lastSender = lastMessage.querySelector('.message-sender');
        if(lastSender && lastSender.textContent === 'You') {
            const replyLine = document.createElement('div');
            replyLine.className = 'ai-reply-line';
            wrapperDiv.appendChild(replyLine);
        }
    }

    wrapperDiv.appendChild(contentDiv);
    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(wrapperDiv);

    if (isStreaming) {
        messageDiv.dataset.streaming = "true";
    }

    return messageDiv;
}

function appendMessage(message) {
    const messagesContainer = document.getElementById('messages-container');
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const text = messageInput.value.trim();

    if (text === '') return;

    const userMessage = { role: 'user', content: text };
    conversationHistory.push(userMessage);
    appendMessage(userMessage);
    messageInput.value = '';
    messageInput.style.height = 'auto';

    const aiMessage = { role: 'assistant', content: '' };
    const aiMessageElement = createMessageElement(aiMessage, true);
    document.getElementById('messages-container').appendChild(aiMessageElement);
    const aiContentDiv = aiMessageElement.querySelector('.message-content');
    
    try {
        const stream = await puter.ai.chat(conversationHistory, {
            model: currentModel,
            stream: true,
        });

        for await (const chunk of stream) {
            aiMessage.content += chunk;
            aiContentDiv.textContent = aiMessage.content;
            document.getElementById('messages-container').scrollTop = document.getElementById('messages-container').scrollHeight;
        }
        
        conversationHistory.push(aiMessage);

    } catch (error) {
        aiContentDiv.textContent = 'Sorry, an error occurred. Please try again.';
        console.error("Error with AI chat:", error);
    } finally {
        aiMessageElement.removeAttribute('data-streaming');
    }
}

function handleSubmission() {
    const inviteInput = document.getElementById('invite-input');
    const inviteContainer = document.getElementById('invite-container');
    const chatInterface = document.getElementById('chat-interface');
    const errorMessage = document.getElementById('error-message');

    const userInput = inviteInput.value.trim();
    const correctCode = getInviteCode();

    if (userInput === correctCode) {
        inviteContainer.style.opacity = '0';
        setTimeout(() => {
            inviteContainer.classList.add('hidden');
            chatInterface.classList.remove('hidden');
            document.getElementById('message-input').focus();
        }, 500);
    } else {
        errorMessage.textContent = 'Incorrect code. Please try again.';
        inviteInput.value = '';
        setTimeout(() => {
            errorMessage.textContent = '';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit-button');
    const inviteInput = document.getElementById('invite-input');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const modelSwitcher = document.getElementById('model-switcher');

    submitButton.addEventListener('click', handleSubmission);
    inviteInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSubmission();
        }
    });

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });

    modelSwitcher.addEventListener('change', (event) => {
        currentModel = event.target.value;
    });
});
