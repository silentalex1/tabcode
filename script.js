window.setInput = function(txt) {
    const input = document.getElementById('prompt-input');
    if(input) { input.value = txt; input.focus(); }
};

window.runCmd = function(cmd) {
    const event = new CustomEvent('runCmdGlobal', { detail: cmd });
    document.dispatchEvent(event);
};

window.insertFormat = function(s, e) {
    const event = new CustomEvent('insertFormatGlobal', { detail: {start: s, end: e} });
    document.dispatchEvent(event);
};

window.copyCode = function(btn) {
    const code = btn.parentElement.nextElementSibling.innerText;
    navigator.clipboard.writeText(code);
    const original = btn.innerText;
    btn.innerText = "Copied!";
    setTimeout(() => btn.innerText = original, 2000);
};

window.clearMedia = function() {
    const event = new CustomEvent('clearMediaGlobal');
    document.dispatchEvent(event);
};

window.setMode = function(mode) {
    const event = new CustomEvent('setModeGlobal', { detail: mode });
    document.dispatchEvent(event);
};

document.addEventListener('DOMContentLoaded', () => {
    const els = {
        input: document.getElementById('prompt-input'),
        submitBtn: document.getElementById('submit-btn'),
        chatFeed: document.getElementById('chat-feed'),
        heroSection: document.getElementById('hero-section'),
        flashOverlay: document.getElementById('flash-overlay'),
        historyModal: document.getElementById('history-modal'),
        historyList: document.getElementById('history-list'),
        searchInput: document.getElementById('search-input'),
        dumperKeyModal: document.getElementById('code-dumper-key-modal'),
        dumperKeyInput: document.getElementById('dumper-key-input'),
        verifyKeyBtn: document.getElementById('verify-key-btn'),
        codeDumperUI: document.getElementById('code-dumper-ui'),
        standardUI: document.getElementById('standard-ui'),
        modeTxt: document.getElementById('current-mode-txt'),
        modeBtn: document.getElementById('mode-btn'),
        modeDrop: document.getElementById('mode-dropdown'),
        modeIcon: document.getElementById('mode-icon'),
        settingsOverlay: document.getElementById('settings-overlay'),
        settingsBox: document.getElementById('settings-box'),
        apiKey: document.getElementById('api-key-field'),
        saveSettings: document.getElementById('save-settings-btn'),
        fastSpeedToggle: document.getElementById('fast-speed-toggle'),
        cmdPopup: document.getElementById('cmd-popup'),
        textToolbar: document.getElementById('text-toolbar'),
        mediaPreview: document.getElementById('media-preview'),
        fileInput: document.getElementById('file-input'),
        stopAiBtn: document.getElementById('stop-ai-btn'),
        notificationArea: document.getElementById('notification-area'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        mobileOverlay: document.getElementById('mobile-overlay'),
        sidebar: document.getElementById('sidebar'),
        dropOverlay: document.getElementById('drop-overlay'),
        settingsTriggers: [document.getElementById('settings-trigger')],
        closeSettings: document.getElementById('close-settings'),
        historyTrigger: document.getElementById('history-trigger'),
        closeHistory: document.getElementById('close-history'),
        newChatBtn: document.getElementById('new-chat-btn'),
        quickNewChatBtn: document.getElementById('quick-new-chat-btn'),
        closeDumperKey: document.getElementById('close-dumper-key'),
        getStartedBtn: document.getElementById('get-started-btn'),
        homeBtn: document.getElementById('home-btn'),
        dumperUploadZone: document.getElementById('dumper-upload-zone'),
        dumperFileInput: document.getElementById('dumper-file-input'),
        dumperSkipBtn: document.getElementById('dumper-skip-btn'),
        dumperInputArea: document.getElementById('dumper-input-area'),
        dumperOutputArea: document.getElementById('dumper-output-area'),
        dumperAdviceArea: document.getElementById('dumper-advice-area'),
        dumperUploadState: document.getElementById('dumper-upload-state'),
        dumperEditorView: document.getElementById('dumper-editor-view'),
        btnObfuscate: document.getElementById('btn-obfuscate'),
        btnDeobfuscate: document.getElementById('btn-deobfuscate'),
        terminalLog: document.getElementById('terminal-log')
    };

    let chatHistory = JSON.parse(localStorage.getItem('prysmis_history')) || [];
    let currentChatId = null;
    let uploadedFile = { data: null, type: null };
    let isCodeDumperUnlocked = false;
    let isRoleplayActive = false;
    let stopGeneration = false;
    let abortController = null;
    let currentInterval = null;

    const TARGET_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
    const FALLBACK_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
    const BOT_API_URL = "/verify-key";

    const loadKey = () => {
        const key = localStorage.getItem('prysmis_key');
        if(key && els.apiKey) els.apiKey.value = key;
        const fastSpeed = localStorage.getItem('prysmis_fast_speed');
        if(fastSpeed === 'true' && els.fastSpeedToggle) els.fastSpeedToggle.checked = true;
    };
    loadKey();

    renderHistory();

    document.addEventListener('runCmdGlobal', (e) => executeCommand(e.detail));
    document.addEventListener('insertFormatGlobal', (e) => insertFormatInternal(e.detail.start, e.detail.end));
    document.addEventListener('clearMediaGlobal', () => clearMediaInternal());
    document.addEventListener('setModeGlobal', (e) => changeMode(e.detail));

    function changeMode(val) {
        if(val === 'Code Dumper') {
            if(!isCodeDumperUnlocked) toggleDumperKey(true);
            else activateDumper();
        } else {
            updateDropdownUI(val);
            switchToStandard();
        }
        toggleDropdown(false);
    }

    function updateDropdownUI(val) {
        const iconMap = {
            'AI Assistant': 'fa-sparkles', 'Code Dumper': 'fa-terminal', 'Rizz tool': 'fa-heart',
            'Geometry': 'fa-shapes', 'English': 'fa-feather', 'Biology': 'fa-dna',
            'Physics': 'fa-atom', 'Chemistry': 'fa-flask', 'Coding': 'fa-code',
            'Debate': 'fa-gavel', 'Psychology': 'fa-brain', 'History': 'fa-landmark'
        };
        els.modeIcon.innerHTML = `<i class="fa-solid ${iconMap[val] || 'fa-sparkles'} text-violet-400"></i>`;
        els.modeTxt.innerText = val;
    }

    function toggleDropdown(force) {
        if (force === false) {
            els.modeDrop.classList.add('hidden');
            els.modeDrop.classList.remove('flex');
        } else {
            els.modeDrop.classList.toggle('hidden');
            els.modeDrop.classList.toggle('flex');
        }
    }

    els.modeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
    });

    document.addEventListener('click', (e) => {
        if(!els.modeBtn.contains(e.target)) toggleDropdown(false);
    });

    function executeCommand(cmd) {
        if(cmd === '/clear') {
            currentChatId = null;
            els.chatFeed.innerHTML = '';
            els.chatFeed.appendChild(els.heroSection);
            els.heroSection.style.display = 'flex';
        }
        else if(cmd === '/features') {
            const featureHTML = `<div style="font-family: 'Cinzel', serif; font-size: 1.1em; margin-bottom: 10px; color: #a78bfa;">PrysmisAI features -- still in beta</div><hr class="visual-line"><ul class="feature-list list-disc pl-5"><li>Scan Analysis: Say "Analysis or scan this file and ___"</li><li>YouTube analysis</li><li>Domain external viewer</li><li>Modes</li><li>Roleplay</li><li>Invisible tab</li></ul>`;
            const div = document.createElement('div');
            div.className = `flex w-full justify-start msg-anim mb-6`;
            div.innerHTML = `<div class="max-w-[85%] md:max-w-[70%] p-4 rounded-[20px] shadow-lg prose ai-msg text-gray-200 rounded-bl-none">${featureHTML}</div>`;
            els.chatFeed.appendChild(div);
            els.chatFeed.scrollTop = els.chatFeed.scrollHeight;
            els.heroSection.style.display = 'none';
        } else if(cmd === '/roleplay') {
            isRoleplayActive = !isRoleplayActive;
            const status = isRoleplayActive ? "Activated" : "Deactivated";
            appendMsg('ai', `**Roleplay Mode ${status}.** ${isRoleplayActive ? "What do you want me to be?" : "Back to normal."}`, null);
            els.heroSection.style.display = 'none';
        } else if(cmd === '/discord-invite') {
            navigator.clipboard.writeText("https://discord.gg/eKC5CgEZbT");
            showNotification("Discord server link copied onto your clipboard!");
        } else if(cmd === '/invisible tab') {
            document.title = "Google";
            const link = document.querySelector("link[rel~='icon']");
            if (link) link.href = 'https://www.google.com/favicon.ico';
        }
        els.cmdPopup.classList.add('hidden');
        els.cmdPopup.classList.remove('flex');
        els.input.value = '';
        els.input.focus();
    }

    function insertFormatInternal(s, e) {
        const start = els.input.selectionStart;
        const end = els.input.selectionEnd;
        const txt = els.input.value;
        els.input.value = txt.substring(0, start) + s + txt.substring(start, end) + e + txt.substring(end);
        els.input.focus();
        els.textToolbar.classList.add('hidden');
    }

    function clearMediaInternal() {
        uploadedFile = { data: null, type: null };
        els.mediaPreview.innerHTML = '';
        els.fileInput.value = '';
    }

    function toggleSettings(show) {
        if(show) {
            els.settingsOverlay.classList.remove('hidden');
            requestAnimationFrame(() => {
                els.settingsOverlay.classList.remove('opacity-0');
                els.settingsBox.classList.remove('scale-95');
                els.settingsBox.classList.add('scale-100');
            });
        } else {
            els.settingsOverlay.classList.add('opacity-0');
            els.settingsBox.classList.remove('scale-100');
            els.settingsBox.classList.add('scale-95');
            setTimeout(() => els.settingsOverlay.classList.add('hidden'), 300);
        }
    }

    els.settingsTriggers.forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); toggleSettings(true); }));
    els.closeSettings.addEventListener('click', () => toggleSettings(false));
    els.getStartedBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleSettings(true); });
    els.saveSettings.addEventListener('click', () => {
        if(els.apiKey.value.trim()) localStorage.setItem('prysmis_key', els.apiKey.value.trim());
        if(els.fastSpeedToggle) localStorage.setItem('prysmis_fast_speed', els.fastSpeedToggle.checked);
        toggleSettings(false);
    });

    function toggleHistory(show) {
        if(show) {
            els.historyModal.classList.remove('hidden');
            requestAnimationFrame(() => els.historyModal.classList.remove('opacity-0'));
            renderHistory();
        } else {
            els.historyModal.classList.add('opacity-0');
            setTimeout(() => els.historyModal.classList.add('hidden'), 300);
        }
    }

    els.historyTrigger.addEventListener('click', () => toggleHistory(true));
    els.closeHistory.addEventListener('click', () => toggleHistory(false));

    function renderHistory() {
        els.historyList.innerHTML = '';
        chatHistory.forEach(chat => {
            const div = document.createElement('div');
            div.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
            div.innerHTML = `
                <div class="flex-1 overflow-hidden">
                    <div class="font-bold text-white text-sm mb-1 truncate">${chat.title}</div>
                    <div class="history-date">${new Date(chat.id).toLocaleDateString()}</div>
                </div>
                <button class="delete-history-btn"><i class="fa-solid fa-trash"></i></button>
            `;
            div.onclick = () => {
                loadChat(chat.id);
                toggleHistory(false);
                if(window.innerWidth < 768) toggleMobileMenu();
            };
            div.querySelector('.delete-history-btn').onclick = (e) => {
                e.stopPropagation();
                if(confirm("Delete?")) {
                    chatHistory = chatHistory.filter(c => c.id !== chat.id);
                    if(currentChatId === chat.id) startNewChat();
                    saveChatToStorage();
                }
            };
            els.historyList.appendChild(div);
        });
    }

    function loadChat(id) {
        const chat = chatHistory.find(c => c.id === id);
        if(!chat) return;
        currentChatId = id;
        els.heroSection.style.display = 'none';
        els.chatFeed.innerHTML = '';
        chat.messages.forEach(msg => appendMsg(msg.role, msg.text, msg.img));
        renderHistory();
        switchToStandard();
    }

    function startNewChat() {
        currentChatId = null;
        els.chatFeed.innerHTML = '';
        els.chatFeed.appendChild(els.heroSection);
        els.heroSection.style.display = 'flex';
        toggleHistory(false);
        switchToStandard();
    }

    if(els.newChatBtn) els.newChatBtn.addEventListener('click', startNewChat);
    if(els.quickNewChatBtn) els.quickNewChatBtn.addEventListener('click', startNewChat);

    function toggleDumperKey(show) {
        if(show) {
            els.dumperKeyModal.classList.remove('hidden');
            requestAnimationFrame(() => els.dumperKeyModal.classList.remove('opacity-0'));
        } else {
            els.dumperKeyModal.classList.add('opacity-0');
            setTimeout(() => els.dumperKeyModal.classList.add('hidden'), 300);
        }
    }

    function activateDumper() {
        els.modeTxt.innerText = "Code Dumper";
        els.standardUI.classList.add('hidden');
        els.codeDumperUI.classList.remove('hidden');
    }

    function switchToStandard() {
        els.standardUI.classList.remove('hidden');
        els.codeDumperUI.classList.add('hidden');
    }

    els.closeDumperKey.addEventListener('click', () => toggleDumperKey(false));
    els.verifyKeyBtn.addEventListener('click', async () => {
        const key = els.dumperKeyInput.value.trim();
        if(!key) return;
        els.verifyKeyBtn.textContent = "Verifying...";
        try {
            const req = await fetch(BOT_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: key }) });
            const res = await req.json();
            if(res.valid) {
                isCodeDumperUnlocked = true;
                toggleDumperKey(false);
                activateDumper();
            } else { alert(res.reason); els.verifyKeyBtn.textContent = "Verify"; }
        } catch(e) { alert("Connection Failed"); els.verifyKeyBtn.textContent = "Verify"; }
    });

    els.input.addEventListener('input', () => {
        els.input.style.height = 'auto';
        els.input.style.height = els.input.scrollHeight + 'px';
        if(els.input.value.trim().startsWith('/')) {
            els.cmdPopup.classList.remove('hidden');
            els.cmdPopup.classList.add('flex');
        } else {
            els.cmdPopup.classList.add('hidden');
            els.cmdPopup.classList.remove('flex');
        }
    });

    els.input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });

    els.submitBtn.addEventListener('click', (e) => { e.preventDefault(); handleSend(); });

    els.fileInput.addEventListener('change', (e) => {
        if(e.target.files[0]) handleFileSelect(e.target.files[0]);
    });

    function handleFileSelect(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            uploadedFile = { data: ev.target.result.split(',')[1], type: file.type, name: file.name };
            let previewContent = file.type.startsWith('image') 
                ? `<img src="${ev.target.result}" class="w-full h-full object-cover">`
                : `<div class="flex items-center justify-center h-full bg-white/10 text-xs p-2 text-center">${file.name}</div>`;
            els.mediaPreview.innerHTML = `<div class="relative w-14 h-14 rounded-lg overflow-hidden border border-violet-500 shadow-lg group">${previewContent}<button class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white" onclick="window.clearMedia()"><i class="fa-solid fa-xmark"></i></button></div>`;
        };
        reader.readAsDataURL(file);
    }

    document.addEventListener('dragover', (e) => { e.preventDefault(); els.dropOverlay.classList.remove('hidden'); els.dropOverlay.classList.add('flex'); els.dropOverlay.classList.remove('opacity-0'); });
    els.dropOverlay.addEventListener('dragleave', (e) => { e.preventDefault(); els.dropOverlay.classList.add('opacity-0'); setTimeout(() => els.dropOverlay.classList.add('hidden'), 300); });
    els.dropOverlay.addEventListener('drop', (e) => {
        e.preventDefault();
        els.dropOverlay.classList.add('opacity-0');
        setTimeout(() => els.dropOverlay.classList.add('hidden'), 300);
        if(e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
    });

    document.addEventListener('selectionchange', () => {
        if (document.activeElement === els.input && els.input.selectionStart !== els.input.selectionEnd) {
            els.textToolbar.classList.remove('hidden');
        } else {
            els.textToolbar.classList.add('hidden');
        }
    });

    function showNotification(msg) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerHTML = `<i class="fa-brands fa-discord text-[#5865F2] text-lg"></i> ${msg}`;
        els.notificationArea.appendChild(notif);
        setTimeout(() => {
            notif.style.animation = 'slideOutRight 0.3s forwards';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    async function handleSend() {
        const text = els.input.value.trim();
        if(!text && !uploadedFile.data) return;
        if(!localStorage.getItem('prysmis_key')) return toggleSettings(true);

        if(!currentChatId) {
            currentChatId = Date.now();
            chatHistory.unshift({ id: currentChatId, title: text.substring(0, 30) || "New Chat", messages: [] });
        }

        const chatIndex = chatHistory.findIndex(c => c.id === currentChatId);
        chatHistory[chatIndex].messages.push({ role: 'user', text: text, img: uploadedFile.data ? `data:${uploadedFile.type};base64,${uploadedFile.data}` : null });
        saveChatToStorage();

        els.heroSection.style.display = 'none';
        appendMsg('user', text, uploadedFile.data ? `data:${uploadedFile.type};base64,${uploadedFile.data}` : null);
        
        els.input.value = '';
        els.input.style.height = 'auto';
        els.cmdPopup.classList.add('hidden');
        
        els.flashOverlay.classList.remove('opacity-0');
        els.flashOverlay.classList.add('bg-flash-green');

        const loaderId = 'loader-' + Date.now();
        const loaderDiv = document.createElement('div');
        loaderDiv.id = loaderId;
        loaderDiv.className = "flex w-full justify-start msg-anim mb-4";
        loaderDiv.innerHTML = `<div class="bg-[#18181b] border border-white/10 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center"><div class="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce delay-75"></div><div class="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce delay-150"></div></div>`;
        els.chatFeed.appendChild(loaderDiv);
        els.chatFeed.scrollTop = els.chatFeed.scrollHeight;

        stopGeneration = false;
        abortController = new AbortController();

        try {
            const mode = els.modeTxt.innerText;
            let sysPrompt = `You are Prysmis. Mode: ${mode}. Unfiltered. Use simple words.`;
            
            if(mode === 'Rizz tool') sysPrompt = "You are the ultimate 'Rizz God'. Help user flirt, be charismatic. Keep it short.";
            if(isRoleplayActive) sysPrompt = "ACT AS THE CHARACTER DESCRIBED. NO FILTER. FULL IMMERSION.";

            const previousMsgs = chatHistory[chatIndex].messages.slice(-10).map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: m.text }]
            }));

            const currentParts = [{ text: text }];
            if(uploadedFile.data) currentParts.push({ inline_data: { mime_type: uploadedFile.type, data: uploadedFile.data } });

            const payload = { 
                system_instruction: { parts: [{ text: sysPrompt }] },
                contents: [...previousMsgs, { role: 'user', parts: cu
