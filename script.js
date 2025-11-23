document.addEventListener('DOMContentLoaded', () => {
    const els = {
        settingsTriggers: [document.getElementById('settings-trigger'), document.getElementById('mobile-settings-btn')],
        settingsOverlay: document.getElementById('settings-overlay'),
        settingsBox: document.getElementById('settings-box'),
        closeSettings: document.getElementById('close-settings'),
        saveSettings: document.getElementById('save-settings-btn'),
        apiKey: document.getElementById('api-key-field'),
        
        modeBtn: document.getElementById('mode-btn'),
        modeDrop: document.getElementById('mode-dropdown'),
        modeTxt: document.getElementById('current-mode-txt'),
        modeItems: document.querySelectorAll('.mode-item'),

        input: document.getElementById('prompt-input'),
        fileInput: document.getElementById('file-input'),
        mediaPreview: document.getElementById('media-preview'),
        cmdPopup: document.getElementById('cmd-popup'),
        submitBtn: document.getElementById('submit-btn'),
        chatFeed: document.getElementById('chat-feed'),
        heroSection: document.getElementById('hero-section'),
        getStartedBtn: document.getElementById('get-started-btn')
    };

    let uploadedFile = { data: null, type: null };
    let isSettingsOpen = false;
    let isDropdownOpen = false;
    
    const TARGET_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
    const FALLBACK_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

    const loadKey = () => {
        const key = localStorage.getItem('prysmis_key');
        if(key) {
            els.apiKey.value = key;
        }
    };
    loadKey();

    const toggleSettings = (show) => {
        isSettingsOpen = show;
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
    };

    els.settingsTriggers.forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSettings(true);
    }));
    
    els.closeSettings.addEventListener('click', () => toggleSettings(false));

    els.saveSettings.addEventListener('click', () => {
        if(els.apiKey.value.trim()) {
            localStorage.setItem('prysmis_key', els.apiKey.value.trim());
            els.saveSettings.textContent = "Saved Successfully";
            els.saveSettings.classList.add('bg-green-500', 'text-white');
            setTimeout(() => {
                toggleSettings(false);
                els.saveSettings.textContent = "Save Changes";
                els.saveSettings.classList.remove('bg-green-500', 'text-white');
            }, 800);
        }
    });

    const toggleDropdown = (e) => {
        e.stopPropagation();
        isDropdownOpen = !isDropdownOpen;
        if(isDropdownOpen) {
            els.modeDrop.classList.remove('hidden');
            els.modeDrop.classList.add('flex');
        } else {
            els.modeDrop.classList.add('hidden');
            els.modeDrop.classList.remove('flex');
        }
    };

    els.modeBtn.addEventListener('click', toggleDropdown);
    document.addEventListener('click', (e) => {
        if(isDropdownOpen && !els.modeBtn.contains(e.target)) {
            isDropdownOpen = false;
            els.modeDrop.classList.add('hidden');
            els.modeDrop.classList.remove('flex');
        }
    });

    els.modeItems.forEach(item => {
        item.addEventListener('click', () => {
            els.modeTxt.innerText = item.getAttribute('data-val');
        });
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
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    els.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            uploadedFile.data = ev.target.result.split(',')[1];
            uploadedFile.type = file.type;
            els.mediaPreview.innerHTML = `
                <div class="relative w-14 h-14 rounded-lg overflow-hidden border border-violet-500 shadow-lg group">
                    <img src="${ev.target.result}" class="w-full h-full object-cover">
                    <button class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white" onclick="clearMedia()">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    });

    window.clearMedia = () => {
        uploadedFile = { data: null, type: null };
        els.mediaPreview.innerHTML = '';
        els.fileInput.value = '';
    };

    window.runCmd = (cmd) => {
        if(cmd === '/clear') {
            els.chatFeed.innerHTML = '';
            els.chatFeed.appendChild(els.heroSection);
            els.heroSection.style.display = 'flex';
        } else if (cmd === '/features') {
            els.input.value = '';
            appendMsg('ai', `**Prysmis Capabilities:**\n- **Subject Mastery:** Specialized modes for Geometry, Biology, Coding, etc.\n- **Rizz tool:** Expert social dating advice.\n- **Vision:** Analyze images.\n- **Privacy:** Cloaking features.\n- **Persona:** Roleplay adaptation.`);
        } else if (cmd === '/invisible tab') {
            document.title = "Google Docs";
            const icon = document.querySelector("link[rel~='icon']");
            if(icon) icon.href = "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico";
        } else if (cmd === '/discord-server') {
            appendMsg('ai', "Join our community: [Discord Link Placeholder]");
            els.input.value = '';
        } else if (cmd === '/roleplay') {
            appendMsg('ai', "Roleplay mode activated. Who should I become?");
            els.input.value = '';
        }
        
        els.cmdPopup.classList.add('hidden');
        els.cmdPopup.classList.remove('flex');
        if(cmd !== '/features') els.input.value = '';
        els.input.focus();
    };

    window.setInput = (txt) => {
        els.input.value = txt;
        els.input.focus();
    };

    els.getStartedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSettings(true);
    });

    els.submitBtn.addEventListener('click', handleSend);

    async function handleSend() {
        const text = els.input.value.trim();
        if(!text && !uploadedFile.data) return;

        if(!localStorage.getItem('prysmis_key')) {
            toggleSettings(true);
            return;
        }

        els.heroSection.style.display = 'none';
        
        appendMsg('user', text, uploadedFile.data ? `data:${uploadedFile.type};base64,${uploadedFile.data}` : null);
        
        els.input.value = '';
        els.input.style.height = 'auto';
        els.cmdPopup.classList.add('hidden');
        clearMedia();

        const loaderId = 'loader-' + Date.now();
        const loaderDiv = document.createElement('div');
        loaderDiv.id = loaderId;
        loaderDiv.className = "flex w-full justify-start msg-anim mb-4";
        loaderDiv.innerHTML = `<div class="bg-[#18181b] border border-white/10 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center"><div class="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce delay-75"></div><div class="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce delay-150"></div></div>`;
        els.chatFeed.appendChild(loaderDiv);
        els.chatFeed.scrollTop = els.chatFeed.scrollHeight;

        try {
            const mode = els.modeTxt.innerText;
            let sysPrompt = `You are Prysmis. Mode: ${mode}. Be helpful, concise, and use formatting.`;
            
            if(mode === 'Rizz tool') {
                sysPrompt = "You are the ultimate 'Rizz God'. Your only purpose is to help the user flirt, be charismatic, and smooth with the person they are talking to. Give top-tier pickup lines, responses to texts, and dating advice. Be cool, confident, and slightly edgy.";
            }

            const payload = {
                contents: [{
                    parts: [
                        { text: sysPrompt + "\nUser: " + text }
                    ]
                }]
            };

            if(uploadedFile.data) {
                payload.contents[0].parts.push({
                    inline_data: { mime_type: uploadedFile.type, data: uploadedFile.data }
                });
            }

            let response = await fetch(`${TARGET_URL}?key=${localStorage.getItem('prysmis_key')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if(response.status === 404 || response.status === 400) {
                response = await fetch(`${FALLBACK_URL}?key=${localStorage.getItem('prysmis_key')}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            const data = await response.json();
            document.getElementById(loaderId).remove();

            if(data.error) {
                appendMsg('ai', `Error: ${data.error.message}`);
            } else if (data.candidates && data.candidates[0].content) {
                const aiText = data.candidates[0].content.parts[0].text;
                streamResponse(aiText);
            } else {
                appendMsg('ai', "No response received.");
            }

        } catch(err) {
            document.getElementById(loaderId)?.remove();
            appendMsg('ai', "Connection failed. Please check your internet or API key.");
        }
    }

    function appendMsg(role, text, img) {
        if(role === 'ai') return;
        const div = document.createElement('div');
        div.className = `flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'} msg-anim mb-6`;
        
        let content = text.replace(/\n/g, '<br>');
        if(img) content = `<img src="${img}" class="max-w-[200px] rounded-lg mb-2 border border-white/20">` + content;

        div.innerHTML = `<div class="max-w-[85%] md:max-w-[70%] p-4 rounded-[20px] shadow-lg prose ${role === 'user' ? 'user-msg text-white rounded-br-none' : 'ai-msg text-gray-200 rounded-bl-none'}">${content}</div>`;
        els.chatFeed.appendChild(div);
        els.chatFeed.scrollTop = els.chatFeed.scrollHeight;
    }

    function streamResponse(text) {
        const div = document.createElement('div');
        div.className = `flex w-full justify-start msg-anim mb-6`;
        const bubble = document.createElement('div');
        bubble.className = "max-w-[90%] md:max-w-[75%] p-5 rounded-[20px] rounded-bl-none shadow-lg prose ai-msg text-gray-200";
        div.appendChild(bubble);
        els.chatFeed.appendChild(div);

        const chars = text.split('');
        let i = 0;
        let currentText = "";

        const interval = setInterval(() => {
            if(i >= chars.length) {
                clearInterval(interval);
                bubble.innerHTML = parseMD(text);
                return;
            }
            currentText += chars[i];
            bubble.innerHTML = parseMD(currentText) + "<span class='inline-block w-2 h-4 bg-violet-400 ml-1 animate-pulse align-middle'></span>";
            els.chatFeed.scrollTop = els.chatFeed.scrollHeight;
            i++;
        }, 15);
    }

    function parseMD(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
});
