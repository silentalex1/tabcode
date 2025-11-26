document.addEventListener('DOMContentLoaded', () => {
    let currentMode = "AI Assistant";
    let geminiKey = localStorage.getItem('geminiKey') || "";
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    let currentChatId = null;
    let abortController = null;
    let isGenerating = false;
    let uploadedFiles = [];

    const els = {
        promptInput: document.getElementById('prompt-input'),
        submitBtn: document.getElementById('submit-btn'),
        stopBtn: document.getElementById('stop-ai-btn'),
        chatFeed: document.getElementById('chat-feed'),
        heroSection: document.getElementById('hero-section'),
        fileInput: document.getElementById('file-input'),
        mediaPreview: document.getElementById('media-preview'),
        modeBtn: document.getElementById('mode-btn'),
        modeDropdown: document.getElementById('mode-dropdown'),
        modeIcon: document.getElementById('mode-icon'),
        currentModeTxt: document.getElementById('current-mode-txt'),
        settingsOverlay: document.getElementById('settings-overlay'),
        apiKeyField: document.getElementById('api-key-field'),
        historyModal: document.getElementById('history-modal'),
        historyList: document.getElementById('history-list'),
        cmdPopup: document.getElementById('cmd-popup'),
        dropOverlay: document.getElementById('drop-overlay'),
        standardUi: document.getElementById('standard-ui'),
        codeDumperUi: document.getElementById('code-dumper-ui'),
        dumperKeyModal: document.getElementById('code-dumper-key-modal'),
        verifyKeyBtn: document.getElementById('verify-key-btn'),
        dumperKeyInput: document.getElementById('dumper-key-input')
    };

    if (geminiKey) els.apiKeyField.value = geminiKey;

    window.toggleSettings = () => {
        const isHidden = els.settingsOverlay.classList.contains('hidden');
        if (isHidden) {
            els.settingsOverlay.classList.remove('hidden');
            setTimeout(() => {
                els.settingsOverlay.classList.remove('opacity-0');
                document.getElementById('settings-box').classList.remove('scale-95');
            }, 10);
        } else {
            els.settingsOverlay.classList.add('opacity-0');
            document.getElementById('settings-box').classList.add('scale-95');
            setTimeout(() => els.settingsOverlay.classList.add('hidden'), 300);
        }
    };

    window.toggleHistory = () => {
        const isHidden = els.historyModal.classList.contains('hidden');
        if (isHidden) {
            renderHistory();
            els.historyModal.classList.remove('hidden');
            setTimeout(() => {
                els.historyModal.classList.remove('opacity-0');
                els.historyModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        } else {
            els.historyModal.classList.add('opacity-0');
            els.historyModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => els.historyModal.classList.add('hidden'), 300);
        }
    };

    window.setInput = (text) => {
        els.promptInput.value = text;
        els.promptInput.focus();
    };

    window.insertFormat = (start, end) => {
        const startPos = els.promptInput.selectionStart;
        const endPos = els.promptInput.selectionEnd;
        const val = els.promptInput.value;
        els.promptInput.value = val.substring(0, startPos) + start + val.substring(startPos, endPos) + end + val.substring(endPos);
        els.promptInput.focus();
    };

    window.runCmd = (cmd) => {
        els.promptInput.value = cmd;
        els.cmdPopup.classList.add('hidden');
        els.promptInput.focus();
    };

    document.getElementById('settings-trigger').addEventListener('click', window.toggleSettings);
    document.getElementById('close-settings').addEventListener('click', window.toggleSettings);
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        geminiKey = els.apiKeyField.value.trim();
        localStorage.setItem('geminiKey', geminiKey);
        showNotification('Settings Saved', 'success');
        window.toggleSettings();
    });

    document.getElementById('history-trigger').addEventListener('click', window.toggleHistory);
    document.getElementById('close-history').addEventListener('click', window.toggleHistory);
    document.getElementById('new-chat-btn').addEventListener('click', () => {
        startNewChat();
        window.toggleHistory();
    });
    document.getElementById('quick-new-chat-btn').addEventListener('click', startNewChat);

    function startNewChat() {
        currentChatId = null;
        uploadedFiles = [];
        els.mediaPreview.innerHTML = '';
        els.heroSection.classList.remove('hidden');
        els.chatFeed.innerHTML = '';
        els.chatFeed.appendChild(els.heroSection);
        showNotification('New Chat Started', 'info');
    }

    els.modeBtn.addEventListener('click', () => {
        els.modeDropdown.classList.toggle('hidden');
        els.modeDropdown.classList.toggle('flex');
    });

    document.querySelectorAll('.mode-item').forEach(item => {
        item.addEventListener('click', () => {
            const val = item.getAttribute('data-val');
            currentMode = val;
            els.currentModeTxt.innerText = val;
            els.modeIcon.innerHTML = item.querySelector('i').outerHTML;
            els.modeDropdown.classList.add('hidden');
            els.modeDropdown.classList.remove('flex');
            
            if (val === 'Code Dumper') {
                els.codeDumperUi.classList.remove('hidden');
                els.codeDumperUi.classList.add('flex');
                els.standardUi.classList.add('hidden');
                verifyCodeDumperAccess();
            } else {
                els.codeDumperUi.classList.add('hidden');
                els.standardUi.classList.remove('hidden');
                els.standardUi.classList.add('flex');
            }
        });
    });

    function verifyCodeDumperAccess() {
        const hasAccess = sessionStorage.getItem('dumperAccess');
        if (!hasAccess) {
            els.dumperKeyModal.classList.remove('hidden');
            setTimeout(() => els.dumperKeyModal.classList.remove('opacity-0'), 10);
        }
    }

    els.verifyKeyBtn.addEventListener('click', async () => {
        const key = els.dumperKeyInput.value.trim();
        if (!key) return;
        
        try {
            const res = await fetch('/verify-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            });
            const data = await res.json();
            if (data.valid) {
                sessionStorage.setItem('dumperAccess', 'true');
                els.dumperKeyModal.classList.add('opacity-0');
                setTimeout(() => els.dumperKeyModal.classList.add('hidden'), 300);
                showNotification('Access Granted', 'success');
            } else {
                showNotification(data.reason || 'Invalid Key', 'error');
            }
        } catch (e) {
            showNotification('Connection Error', 'error');
        }
    });

    document.getElementById('close-dumper-key').addEventListener('click', () => {
        els.dumperKeyModal.classList.add('opacity-0');
        setTimeout(() => els.dumperKeyModal.classList.add('hidden'), 300);
        els.currentModeTxt.innerText = 'AI Assistant';
        els.codeDumperUi.classList.add('hidden');
        els.standardUi.classList.remove('hidden');
    });

    els.fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    window.addEventListener('dragover', (e) => {
        e.preventDefault();
        els.dropOverlay.classList.remove('hidden');
        els.dropOverlay.classList.remove('opacity-0');
        els.dropOverlay.classList.add('flex');
    });

    els.dropOverlay.addEventListener('dragleave', (e) => {
        e.preventDefault();
        els.dropOverlay.classList.add('opacity-0');
        setTimeout(() => els.dropOverlay.classList.add('hidden'), 300);
    });

    els.dropOverlay.addEventListener('drop', (e) => {
        e.preventDefault();
        els.dropOverlay.classList.add('opacity-0');
        setTimeout(() => els.dropOverlay.classList.add('hidden'), 300);
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        if (!files.length) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result.split(',')[1];
                const mimeType = file.type;
                uploadedFiles.push({ inlineData: { data: base64, mimeType } });
                
                const previewItem = document.createElement('div');
                previewItem.className = 'relative w-16 h-16 rounded-lg overflow-hidden border border-white/20 group';
                
                if (mimeType.startsWith('image/')) {
                    previewItem.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
                } else {
                    previewItem.innerHTML = `<div class="w-full h-full bg-white/10 flex items-center justify-center"><i class="fa-solid fa-file text-white"></i></div>`;
                }
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition cursor-pointer';
                removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                removeBtn.onclick = () => {
                    uploadedFiles = uploadedFiles.filter(f => f.inlineData.data !== base64);
                    previewItem.remove();
                };
                
                previewItem.appendChild(removeBtn);
                els.mediaPreview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    }

    els.promptInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value.startsWith('/')) {
            els.cmdPopup.classList.remove('hidden');
            els.cmdPopup.classList.add('flex');
        } else {
            els.cmdPopup.classList.add('hidden');
            els.cmdPopup.classList.remove('flex');
        }
    });

    els.promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    els.submitBtn.addEventListener('click', sendMessage);

    els.stopBtn.addEventListener('click', () => {
        if (abortController) {
            abortController.abort();
            abortController = null;
            isGenerating = false;
            endGenerationState();
            showNotification('Generation Stopped', 'info');
        }
    });

    async function sendMessage() {
        const text = els.promptInput.value.trim();
        if ((!text && uploadedFiles.length === 0) || isGenerating) return;
        if (!geminiKey) {
            window.toggleSettings();
            showNotification('Please set your API Key', 'error');
            return;
        }

        if (text.startsWith('/')) {
            handleCommand(text);
            els.promptInput.value = '';
            return;
        }

        els.heroSection.classList.add('hidden');
        appendMessage('user', text);
        els.promptInput.value = '';
        els.promptInput.style.height = 'auto';
        els.mediaPreview.innerHTML = '';
        
        startGenerationState();

        const model = "gemini-2.5-pro"; 
        const parts = [];
        if (text) parts.push({ text: `Mode: ${currentMode}. ${text}` });
        uploadedFiles.forEach(f => parts.push(f));
        uploadedFiles = [];

        try {
            abortController = new AbortController();
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts }],
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ]
                }),
                signal: abortController.signal
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
            appendMessage('ai', aiText);
            
            saveToHistory(text, aiText);

        } catch (error) {
            if (error.name !== 'AbortError') {
                appendMessage('ai', "**Error:** Failed to generate response. check API Key.");
            }
        } finally {
            endGenerationState();
            abortController = null;
        }
    }

    function handleCommand(cmd) {
        const c = cmd.split(' ')[0];
        if (c === '/clear') startNewChat();
        else if (c === '/features') showNotification('Features: AI Chat, File Analysis, Code Dumper, Modes', 'info');
        else if (c === '/discord-invite') window.open('https://discord.gg/yourinvite', '_blank');
        else showNotification('Unknown Command', 'error');
    }

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = `w-full max-w-3xl mx-auto p-6 rounded-3xl mb-6 msg-anim ${role === 'user' ? 'user-msg text-white self-end ml-auto' : 'ai-msg text-gray-200'}`;
        
        if (role === 'ai') {
            const html = marked.parse(text);
            div.innerHTML = `<div class="prose prose-invert max-w-none">${html}</div>`;
            
            div.querySelectorAll('pre code').forEach((block) => {
                const parent = block.parentElement;
                const wrapper = document.createElement('div');
                wrapper.className = 'code-block';
                
                const header = document.createElement('div');
                header.className = 'code-header';
                header.innerHTML = `<span>Code</span><button class="copy-btn"><i class="fa-regular fa-copy"></i> Copy</button>`;
                
                header.querySelector('button').addEventListener('click', () => {
                    navigator.clipboard.writeText(block.innerText);
                    showNotification('Copied to clipboard', 'success');
                });
                
                parent.parentNode.insertBefore(wrapper, parent);
                wrapper.appendChild(header);
                wrapper.appendChild(parent);
            });
        } else {
            div.innerText = text;
        }
        
        els.chatFeed.appendChild(div);
        els.chatFeed.scrollTop = els.chatFeed.scrollHeight;
    }

    function startGenerationState() {
        isGenerating = true;
        els.stopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        els.submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    }

    function endGenerationState() {
        isGenerating = false;
        els.stopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        els.submitBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    }

    function saveToHistory(user, ai) {
        if (!currentChatId) {
            currentChatId = Date.now();
            chatHistory.unshift({ id: currentChatId, title: user.substring(0, 30) + "...", date: new Date().toLocaleDateString(), messages: [] });
        }
        const chat = chatHistory.find(c => c.id === currentChatId);
        if (chat) {
            chat.messages.push({ role: 'user', content: user });
            chat.messages.push({ role: 'ai', content: ai });
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        }
    }

    function renderHistory() {
        els.historyList.innerHTML = '';
        chatHistory.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'history-item';
            if (chat.id === currentChatId) item.classList.add('active');
            item.innerHTML = `
                <div>
                    <div class="font-bold text-gray-200 text-sm truncate w-48">${chat.title}</div>
                    <div class="history-date">${chat.date}</div>
                </div>
                <button class="delete-history-btn"><i class="fa-solid fa-trash"></i></button>
            `;
            item.querySelector('.delete-history-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                chatHistory = chatHistory.filter(c => c.id !== chat.id);
                localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
                renderHistory();
                if (chat.id === currentChatId) startNewChat();
            });
            item.addEventListener('click', () => {
                loadChat(chat);
                window.toggleHistory();
            });
            els.historyList.appendChild(item);
        });
    }

    function loadChat(chat) {
        currentChatId = chat.id;
        els.heroSection.classList.add('hidden');
        els.chatFeed.innerHTML = '';
        chat.messages.forEach(msg => appendMessage(msg.role, msg.content));
    }

    function showNotification(msg, type) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        const color = type === 'success' ? 'text-emerald-400' : type === 'error' ? 'text-red-400' : 'text-blue-400';
        const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle';
        notif.innerHTML = `<i class="fa-solid ${icon} ${color} text-lg"></i> <span>${msg}</span>`;
        document.getElementById('notification-area').appendChild(notif);
        setTimeout(() => {
            notif.style.animation = 'slideOutRight 0.4s forwards';
            setTimeout(() => notif.remove(), 400);
        }, 3000);
    }
});
