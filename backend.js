import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let db, auth;
let userId = '';
const MESSAGE_COLLECTION_NAME = 'chatMessages'; 

function getInviteCode() {
    const charCodes = [116, 97, 98, 99, 111, 100, 101, 100, 52, 52, 36, 36];
    let code = '';
    for (let i = 0; i < charCodes.length; i++) {
        code += String.fromCharCode(charCodes[i]);
    }
    return code;
}

async function initFirebase() {
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    if (!firebaseConfig) {
        console.error("Firebase configuration is missing.");
        return;
    }

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
        userId = auth.currentUser?.uid || crypto.randomUUID();
        document.getElementById('user-id-display').textContent = `User ID: ${userId}`;
        subscribeToMessages(appId);
    } catch (error) {
        console.error("Firebase Auth Error:", error);
    }
}

function getChatCollectionRef(appId) {
    return collection(db, `artifacts/${appId}/public/data/${MESSAGE_COLLECTION_NAME}`);
}

function createMessageElement(message) {
    const isUser = message.role === 'user';
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message ai-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message.text;
    
    const sender = document.createElement('div');
    sender.className = 'message-sender';
    sender.textContent = isUser ? 'You' : 'TabCoded AI';

    messageDiv.appendChild(sender);
    messageDiv.appendChild(contentDiv);
    return messageDiv;
}

function subscribeToMessages(appId) {
    const messagesContainer = document.getElementById('messages-container');
    const q = query(getChatCollectionRef(appId), orderBy('timestamp', 'desc'), limit(50)); 

    onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = ''; 
        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        messages.reverse().forEach(message => {
            messagesContainer.appendChild(createMessageElement(message));
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const text = messageInput.value.trim();
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    if (text === '') return;

    try {
        await addDoc(getChatCollectionRef(appId), {
            text: text,
            role: 'user',
            userId: userId,
            timestamp: serverTimestamp()
        });
        messageInput.value = '';

        setTimeout(async () => {
            await addDoc(getChatCollectionRef(appId), {
                text: `Thanks for your question: "${text}". As a safe homework helper, I can give you a hint or explain a concept! How can I assist with your schoolwork today?`,
                role: 'ai',
                userId: 'AI',
                timestamp: serverTimestamp()
            });
        }, 1500);

    } catch (error) {
        console.error("Error sending message:", error);
    }
}

function handleSubmission(isInitialCodeCheck) {
    const inviteInput = document.getElementById('invite-input');
    const inviteContainer = document.getElementById('invite-container');
    const chatInterface = document.getElementById('chat-interface');
    const errorMessage = document.getElementById('error-message');

    const userInput = inviteInput.value.trim();
    const correctCode = getInviteCode();

    if (userInput === correctCode || !isInitialCodeCheck) {
        inviteContainer.style.opacity = '0';
        setTimeout(() => {
            inviteContainer.classList.add('hidden');
            chatInterface.classList.remove('hidden');
            initFirebase();
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
    const messageInput = document.getElementById('message-input');
    
    submitButton.addEventListener('click', () => handleSubmission(true));

    document.getElementById('invite-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSubmission(true);
        }
    });

    if(messageInput) {
        document.getElementById('send-button').addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
    }
});
