document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const els = {
        setBtnDesk: document.getElementById('settings-btn-desktop'),
        setBtnMob: document.getElementById('settings-btn-mobile'),
        setUI: document.getElementById('settings-ui'),
        setCard: document.getElementById('settings-card'),
        closeSet: document.getElementById('close-set'),
        saveSet: document.getElementById('save-set'),
        apiKey: document.getElementById('api-key'),
        
        modeBtn: document.getElementById('mode-selector'),
        modeDrop: document.getElementById('mode-dropdown'),
        modeTxt: document.getElementById('current-mode'),
        modeArrow: document.getElementById('dropdown-arrow'),
        modeOpts: document.querySelectorAll('.mode-opt'),

        input: document.getElementById('user-in'),
        box: document.getElementById('input-box'),
        cmdMenu: document.getElementById('command-menu'),
        sendBtn: document.getElementById('send-btn'),
        chat: document.getElementById('chat-container'),
        welcome: document.getElementById('welcome-msg'),
        fileUp: document.getElementById('file-up'),
        preview: document.getElementById('image-preview')
    };

    let fileData = null, fileType = null;
    let isSettingsOpen = false;
    let isDropdownOpen = false;
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent";

    // --- Initialization ---
    if(localStorage.getItem('gemini_key')) {
        els.apiKey.value = localStorage.getItem('gemini_key');
        els.welcome.style.display = 'none';
    }

    // --- Settings Logic ---
    const toggleSettings = (show) => {
        isSettingsOpen = show;
        if(show) {
            els.setUI.classList.remove('hidden');
            // Force reflow
            void els.setUI.offsetWidth; 
            els.setUI.classList.remove('opacity-0');
            els.setCard.classList.remove('scale-95');
            els.setCard.classList.add('scale-100');
        } else {
            els.setUI.classList.add('opacity-0');
            els.setCard.classList.remove('scale-100');
            els.setCard.classList.add('scale-95');
            setTimeout(() => {
                if(!isSettingsOpen) els.setUI.classList.add('hidden');
            }, 300);
        }
    };

    els.setBtnDesk.addEventListener('click', () => toggleSettings(true));
    els.setBtnMob.addEventListener('click', () => toggleSettings(true));
    els.closeSet.addEventListener('click', () => toggleSettings(false));

    els.saveSet.addEventListener('click', () => {
        const key = els.apiKey.value.trim();
        if(key) {
            localStorage.setItem('gemini_key', key);
            els.saveSet.textContent = "Saved!";
            els.saveSet.classList.add('bg-green-600');
            setTimeout(() => {
                toggleSettings(false);
                els.welcome.style.display = 'none';
                els.saveSet.textContent = "Save Settings";
                els.saveSet.classList.remove('bg-green-600');
            }, 800);
        }
    });

    // --- Dropdown Logic (Persistent) ---
    const toggleDropdown = (e) => {
        e.stopPropagation();
        isDropdownOpen = !isDropdownOpen;
        if(isDropdownOpen) {
            els.modeDrop.classList.remove('hidden');
            els.modeArrow.classList.add('rotate-180');
        } else {
            els.modeDrop.classList.add('hidden');
            els.modeArrow.classList.remove('rotate-180');
        }
    };

    els.modeBtn.addEventListener('click', toggleDropdown);

    document.addEventListener('click', (e) => {
        if(isDropdownOpen && !els.modeBtn.contains(e.target) && !els.modeDrop.contains(e.target)) {
            isDropdownOpen = false;
            els.modeDrop.classList.add('hidden');
            els.modeArrow.classList.remove('rotate-180');
        }
    });

    els.modeOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            els.modeTxt.innerText = opt.getAttribute('data-mode');
            isDropdownOpen = false;
            els.modeDrop.classList.add('hidden');
            els.modeArrow.classList.remove('rotate-180');
        });
    });

    // --- Input & Commands ---
    els.input.addEventListener('input', () => {
        els.input.style.height = 'auto';
        els.input.style.height = els.input.scrollHeight + 'px';
        
        if(els.input.value.startsWith('/')) {
            els.cmdMenu.classList.remove('hidden');
            setTimeout(() => els.cmdMenu.classList.remove('opacity-0', 'scale-95'), 10);
        } else {
            els.cmdMenu.classList.add('opacity-0', 'scale-95');
            setTimeout(() => els.cmdMenu.classList.add('hidden'), 200);
        }
    });

    els.input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });

    // --- File Upload ---
    els.fileUp.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            fileData = ev.target.result.split(',')[1];
            fileType = file.type;
            els.preview.innerHTML = `
                <div class="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-500 shadow-lg animate-fade-in group">
                    <img src="${ev.target.result}" class="w-full h-full object-cover">
                    <button class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white" onclick="clearFile()">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>`;
        };
        reader.readAsDataURL(file);
    });

    window.clearFile = () => { fileData = null; els.preview.innerHTML = ''; els.fileUp.value = ''; };

    // --- Command Execution ---
    window.execCmd = (cmd) => {
        if(cmd === '/clear') {
            els.chat.innerHTML = '';
            els.chat.appendChild(els.welcome);
            els.welcome.style.display = 'flex';
        } else if (cmd === '/invisible tab') {
            document.title = "Google Docs";
            const link = document.querySelector("link[rel~='icon']");
            if(link) link.href = "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico";
        } else if (cmd === '/features') {
            els.input.value = '';
            addMsg('ai', "**Prysmis Features:**\n- **Smart Modes:** Geometry, Biology, etc.\n- **VibeCode UI:** Smooth animations & glassmorphism.\n- **Privacy:** Invisible Tab cloaking.\n- **Vision:** Image analysis.");
            return; // Don't focus input immediately to let user read
        }
        
        els.cmdMenu.classList.add('hidden');
        if(cmd !== '/features') els.input.value = '';
        els.input.focus();
    };

    els.sendBtn.addEventListener('click', send);

    // --- Core Chat Logic ---
    async function send() {
        const txt = els.input.value.trim();
        if(!txt && !fileData) return;
        
        if(!localStorage.getItem('gemini_key')) return toggleSettings(true);
        
        els.welcome.style.display = 'none';
        addMsg('user', txt, fileData ? `data:${fileType};base64,${fileData}` : null);
        
        els.input.value = ''; 
        els.input.style.height = 'auto'; 
        clearFile();
        els.cmdMenu.classList.add('hidden');

        // Loader
        const loader = document.createElement('div');
        loader.className = "flex w-full justify-start msg-enter mb-2";
        loader.innerHTML = `<div class="ai-bubble p-4 rounded-2xl rounded-bl-none shadow-lg flex items-center gap-2"><div class="loader"><span></span><span></span><span></span></div></div>`;
        els.chat.appendChild(loader);
        els.chat.scrollTop = els.chat.scrollHeight;

        try {
            const systemPrompt = `You are Prysmis, the #1 learning assistant. 
            CURRENT MODE: ${els.modeTxt.innerText}.
            INSTRUCTIONS:
            - If Mode is Geometry: focus on theorems, shapes, and formulas.
            - If Mode is English: focus on grammar, tone, and literature.
            - If Mode is Biology: focus on cellular processes and organisms.
            - If Mode is AI Assistant: Be helpful, concise, and smart.
            - Keep formatting clean (Use bold, lists, markdown).
            - Do not mention being an AI model, you are Prysmis.`;

            const parts = [{ text: `${systemPrompt}\n\nUser Query: ${txt}` }];
            if(fileData) parts.push({ inline_data: { mime_type: fileType, data: fileData } });

            const req = await fetch(`${API_URL}?key=${localStorage.getItem('gemini_key')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts }] })
            });
            const res = await req.json();
            loader.remove();
            
            if(res.error) {
                addMsg('ai', `**Error:** ${res.error.message}`);
            } else {
                const rawText = res.candidates[0].content.parts[0].text;
                streamText(rawText);
            }

        } catch(e) { 
            loader.remove(); 
            addMsg('ai', "**Connection Error.** Please check your internet or API key."); 
        }
    }

    // --- Animation & Rendering ---
    function addMsg(role, text, img) {
        if(role === 'ai') return; // AI handled by streamText

        const div = document.createElement('div');
        div.className = `flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'} msg-enter mb-6`;
        
        let html = text.replace(/\n/g, '<br>');
        if(img) html = `<img src="${img}" class="max-w-[200px] rounded-lg mb-3 border border-white/20">` + html;

        div.innerHTML = `<div class="max-w-[85%] md:max-w-[70%] p-4 md:p-5 rounded-[1.2rem] shadow-xl prose ${role === 'user' ? 'user-bubble text-white rounded-br-none' : 'ai-bubble text-gray-200 rounded-bl-none'}">${html}</div>`;
        els.chat.appendChild(div);
        els.chat.scrollTop = els.chat.scrollHeight;
    }

    function streamText(text) {
        const div = document.createElement('div');
        div.className = `flex w-full justify-start msg-enter mb-6`;
        const bubble = document.createElement('div');
        bubble.className = `max-w-[90%] md:max-w-[75%] p-5 rounded-[1.2rem] rounded-bl-none shadow-xl prose ai-bubble text-gray-200`;
        div.appendChild(bubble);
        els.chat.appendChild(div);

        // Pre-format markdown for cleaner splitting
        const words = text.split(' ');
        let i = 0;
        
        const interval = setInterval(() => {
            if(i >= words.length) {
                clearInterval(interval);
                // Re-render full markdown at end to ensure lists/tables formatting is perfect
                bubble.innerHTML = parseMarkdown(text); 
                return;
            }
            // Append simple text first for typing effect
            bubble.innerHTML = parseMarkdown(words.slice(0, i + 1).join(' '));
            els.chat.scrollTop = els.chat.scrollHeight;
            i++;
        }, 50); // Speed of typing
    }

    function parseMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
});
