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
    const FAST_AI_SWITCH = document.getElementById("fast-ai-switch");
    const NEW_USERNAME_INPUT = document.getElementById("new-username");
    const NEW_PASSWORD = document.getElementById("new-password");
    const SAVE_SETTINGS_BTN = document.getElementById("save-settings-btn");

    const INVITE_CODE = "Tabcode44$$";
    const GEMINI_MODEL = "gemini-2.5-pro";

    let storedApiKey = localStorage.getItem('geminiApiKey') || '';
    let currentUsername = localStorage.getItem('username') || '';

    function transitionToChat(username) {
        REG_ERROR_MSG.style.visibility = "hidden";
        REG_MODAL.classList.add("fade-out");
        
        setTimeout(() => {
            REG_MODAL.style.display = "none";
            CHAT_INTERFACE.classList.remove("hidden");
            CHAT_USERNAME_SPAN.textContent = username;
            NEW_USERNAME_INPUT.value = username;
        }, 500);
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

        if (newKey && newKey.length > 5) { 
            validateApiKey(newKey).then(isValid => {
                if (isValid) {
                    storedApiKey = newKey;
                    localStorage.setItem('geminiApiKey', newKey);
                    
                    SETTINGS_MODAL.classList.remove("show");
                    MODAL_BACKDROP.classList.add("hidden");
                    appendMessage("system", "Gemini API key saved and validated. You can now chat.");
                } else {
                    alert("Invalid Gemini API Key. Please check the key and try again.");
                }
            });
        } else {
            SETTINGS_MODAL.classList.remove("show");
            MODAL_BACKDROP.classList.add("hidden");
        }
        
        if (NEW_PASSWORD.value.trim()) {
            localStorage.setItem('password', NEW_PASSWORD.value.trim());
            NEW_PASSWORD.value = ""; 
        }

        localStorage.setItem('keybind', newKeybind);
        localStorage.setItem('fastAiMode', FAST_AI_SWITCH.checked);
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

        appendMessage("system", "Thinking...");

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${storedApiKey}`;
        const payload = {
            contents: [{ parts: [{ text: userPrompt }] }],
            config: {
                maxOutputTokens: 2048,
                temperature: 0.7
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                appendMessage("system", "Error: The API key may be invalid, or an external error occurred. Check the key in settings.");
                return;
            }

            const data = await response.json();
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No valid response from AI.";
            
            CHAT_MESSAGES_DIV.lastChild.remove(); 
            appendMessage("system", aiResponse);

        } catch (error) {
            console.error("Fetch Error:", error);
            appendMessage("system", "A network error occurred. Please try again later.");
        }
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
