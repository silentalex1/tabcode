document.addEventListener("DOMContentLoaded", () => {
    const REG_MODAL = document.getElementById("registration-modal");
    const REG_USERNAME_INPUT = document.getElementById("reg-username");
    const REG_PASSWORD_INPUT = document.getElementById("reg-password");
    const REG_INVITE_INPUT = document.getElementById("reg-invite");
    const REGISTER_BTN = document.getElementById("register-btn");
    const REG_ERROR_MSG = document.getElementById("reg-error");

    const CHAT_INTERFACE = document.getElementById("chat-interface");
    const CHAT_USERNAME_SPAN = document.getElementById("chat-username");
    const SETTINGS_BTN = document.getElementById("settings-btn");
    const CHAT_INPUT = document.getElementById("chat-input");
    const SEND_BTN = document.getElementById("send-btn");
    const CHAT_MESSAGES_DIV = document.getElementById("chat-messages");

    const SETTINGS_MODAL = document.getElementById("settings-modal");
    const MODAL_BACKDROP = document.getElementById("modal-backdrop");
    const TAB_AI = document.getElementById("tab-ai");
    const TAB_USER = document.getElementById("tab-user");
    const AI_SETTINGS_TAB = document.getElementById("ai-settings-tab");
    const USER_SETTINGS_TAB = document.getElementById("user-settings-tab");
    const GEMINI_API_KEY_INPUT = document.getElementById("gemini-api-key");
    const KEYBIND_INPUT = document.getElementById("keybind-input");
    const MODEL_SELECT = document.getElementById("model-select"); 
    const NEW_USERNAME_INPUT = document.getElementById("new-username");
    const NEW_PASSWORD = document.getElementById("new-password");
    const SAVE_SETTINGS_BTN = document.getElementById("save-settings-btn");

    
    const INVITE_CODE = "Tabcode44$$";

    
    let storedApiKey = localStorage.getItem('geminiApiKey') || '';
    let currentUsername = localStorage.getItem('username') || '';
    let selectedModel = localStorage.getItem('selectedModel') || 'gemini-2.5-pro';

    function getSelectedModel() {
        return localStorage.getItem('selectedModel') || 'gemini-2.5-pro';
    }

    

    function transitionToChat(username) {
        REG_ERROR_MSG.style.visibility = "hidden";
        REG_MODAL.classList.add("fade-out");
        
        setTimeout(() => {
            REG_MODAL.style.display = "none";
            CHAT_INTERFACE.classList.remove("hidden");
            CHAT_USERNAME_SPAN.textContent = username;
            NEW_USERNAME_INPUT.value = username;
        }, 400);
    }

    function displayError(message) {
        REG_ERROR_MSG.textContent = message;
        REG_ERROR_MSG.style.visibility = "visible";
    }

    REGISTER_BTN.addEventListener("click", () => {
        const username = REG_USERNAME_INPUT.value.trim();
        const password = REG_PASSWORD_INPUT.value.trim();
        const invite = REG_INVITE_INPUT.value;

        if (!username || !password || !invite) {
            displayError("Please fill out all fields.");
            return;
        }

        if (invite !== INVITE_CODE) {
            displayError("Invalid invite code.");
            return;
        }

        localStorage.setItem('username', username);
        localStorage.setItem('password', password); 
        currentUsername = username;
        transitionToChat(username);
    });

    

    SETTINGS_BTN.addEventListener("click", () => {
        GEMINI_API_KEY_INPUT.value = storedApiKey;
        KEYBIND_INPUT.value = localStorage.getItem('keybind') || 'a+i';
        MODEL_SELECT.value = getSelectedModel();
        SETTINGS_MODAL.classList.add("show");
        MODAL_BACKDROP.classList.remove("hidden");
    });

    MODAL_BACKDROP.addEventListener("click", () => {
        SETTINGS_MODAL.classList.remove("show");
        MODAL_BACKDROP.classList.add("hidden");
    });

    SAVE_SETTINGS_BTN.addEventListener("click", () => {
        const newKey = GEMINI_API_KEY_INPUT.value.trim();
        const newKeybind = KEYBIND_INPUT.value.trim();
        const newModel = MODEL_SELECT.value;

        
        if (newKey && newKey.length > 5 && newKey !== storedApiKey) { 
            validateApiKey(newKey).then(isValid => {
                if (isValid) {
                    storedApiKey = newKey;
                    localStorage.setItem('geminiApiKey', newKey);
                    
                    SETTINGS_MODAL.classList.remove("show");
                    MODAL_BACKDROP.classList.add("hidden");
                    appendMessage("system", "Gemini API key saved and validated. You can now chat.");
                } else {
                    displayCustomAlert("Invalid Gemini API Key. Please check the key and try again.");
                }
            });
        } else {
            SETTINGS_MODAL.classList.remove("show");
            MODAL_BACKDROP.classList.add("hidden");
        }
        
        
        if (newModel) {
            localStorage.setItem('selectedModel', newModel);
            selectedModel = newModel;
        }

        
        if (NEW_PASSWORD.value.trim()) {
            localStorage.setItem('password', NEW_PASSWORD.value.trim());
            NEW_PASSWORD.value = ""; 
        }

        
        localStorage.setItem('keybind', newKeybind);
    });

    TAB_AI.addEventListener("click", () => switchTab(TAB_AI, AI_SETTINGS_TAB));
    TAB_USER.addEventListener("click", () => switchTab(TAB_USER, USER_SETTINGS_TAB));

    function switchTab(clickedTab, contentTab) {
        document.querySelectorAll(".settings-tab").forEach(tab => tab.classList.remove("active"));
        document.querySelectorAll(".settings-tab-content").forEach(content => content.classList.remove("active"));
        clickedTab.classList.add("active");
        contentTab.classList.add("active");
    }

    

    function appendMessage(sender, text) {
        const messageDiv = document.createElement("div");
        messageDiv.className = sender === "user" ? "user-message" : "ai-message";
        const senderSpan = document.createElement("span");
        senderSpan.textContent = sender === "user" ? `${currentUsername}: ` : "Prysmis AI: ";
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(document.createTextNode(text));
        CHAT_MESSAGES_DIV.appendChild(messageDiv);
        CHAT_MESSAGES_DIV.scrollTop = CHAT_MESSAGES_DIV.scrollHeight;
    }

    function displayCustomAlert(message) {
        const alertBox = document.createElement("div");
        alertBox.textContent = message;
        alertBox.style.cssText = "position: fixed; top: 20px; right: 20px; padding: 15px; background: #EF4444; color: white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 1100; opacity: 0; transition: opacity 0.5s ease-in-out;";
        document.body.appendChild(alertBox);
        
        setTimeout(() => alertBox.style.opacity = 1, 10);
        setTimeout(() => {
            alertBox.style.opacity = 0;
            setTimeout(() => alertBox.remove(), 500);
        }, 3000);
    }

    

    async function validateApiKey(key) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`;
        const payload = {
            contents: [{ parts: [{ text: "test" }] }],
            config: { maxOutputTokens: 1 }
        };
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async function handleChat() {
        const userPrompt = CHAT_INPUT.value.trim();
        if (!userPrompt) return;

        CHAT_INPUT.value = "";
        appendMessage("user", userPrompt);

        if (!storedApiKey) {
            appendMessage("system", "Please enter your Gemini API key in the settings (⚙) to enable chat.");
            return;
        }

        const thinkingMessage = document.createElement("div");
        thinkingMessage.className = "ai-message thinking-message";
        thinkingMessage.textContent = "Prysmis AI: Thinking...";
        CHAT_MESSAGES_DIV.appendChild(thinkingMessage);
        CHAT_MESSAGES_DIV.scrollTop = CHAT_MESSAGES_DIV.scrollHeight;
        
        const selectedModel = getSelectedModel(); 
        let apiModelName = selectedModel;

        
        if (selectedModel.includes('llama') || selectedModel.includes('mistral')) {
            appendMessage("system", `⚠️ The selected model, **${selectedModel}**, is currently a placeholder for the Prysmis AI platform. Using **Gemini 2.5 Pro** for generation.`);
            apiModelName = 'gemini-2.5-pro'; 
        }

        const apiKey = storedApiKey; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${apiModelName}:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: {
                parts: [{ text: "You are the 'Homework Solver,' an AI specialized in providing step-by-step solutions, explanations, and accurate answers for academic problems across all subjects. Respond clearly and concisely." }]
            },
            config: {
                maxOutputTokens: 2048,
                temperature: 0.5
            }
        };

        const maxRetries = 3;
        let attempt = 0;
        
        while (attempt < maxRetries) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 429 || (errorData.error && errorData.error.message.includes("RATE_LIMIT"))) {
                        attempt++;
                        const delay = Math.pow(2, attempt) * 1000;
                        await new Promise(res => setTimeout(res, delay));
                        continue;
                    }
                    thinkingMessage.remove();
                    appendMessage("system", "Error: The API key may be invalid, or an external error occurred. Check the key in settings.");
                    return;
                }
    
                const data = await response.json();
                const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No valid response from AI. Please try rephrasing.";
                
                thinkingMessage.remove(); 
                appendMessage("system", aiResponse);
                return;
    
            } catch (error) {
                attempt++;
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(res => setTimeout(res, delay));
            }
        }
        
        thinkingMessage.remove();
        appendMessage("system", "A network error occurred or the service timed out after multiple retries. Please try again later.");
    }

    SEND_BTN.addEventListener("click", handleChat);
    CHAT_INPUT.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            handleChat();
        }
    });

    
    if (currentUsername) {
        transitionToChat(currentUsername);
    } else {
        REG_MODAL.style.display = "flex";
    }
});
