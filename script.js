document.addEventListener('DOMContentLoaded', () => {
    const els = {
        setBtn: document.getElementById('settings-btn'),
        setUI: document.getElementById('settings-ui'),
        setCard: document.getElementById('settings-card'),
        closeSet: document.getElementById('close-set'),
        saveSet: document.getElementById('save-set'),
        apiKey: document.getElementById('api-key'),
        input: document.getElementById('user-in'),
        box: document.getElementById('input-box'),
        cmdMenu: document.getElementById('command-menu'),
        sendBtn: document.getElementById('send-btn'),
        chat: document.getElementById('chat-container'),
        welcome: document.getElementById('welcome-msg'),
        fileUp: document.getElementById('file-up'),
        preview: document.getElementById('image-preview'),
        modeTxt: document.getElementById('current-mode'),
        modeOpts: document.querySelectorAll('.mode-opt')
    };

    let fileData = null, fileType = null;
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent";

    if(localStorage.getItem('gemini_key')) {
        els.apiKey.value = localStorage.getItem('gemini_key');
        els.welcome.style.display = 'none';
    }

    const toggleSettings = (show) => {
        if(show) {
            els.setUI.classList.remove('hidden');
            setTimeout(() => { els.setUI.classList.remove('opacity-0'); els.setCard.classList.remove('scale-95'); }, 10);
        } else {
            els.setUI.classList.add('opacity-0'); els.setCard.classList.add('scale-95');
            setTimeout(() => els.setUI.classList.add('hidden'), 300);
        }
    };

    els.setBtn.onclick = () => toggleSettings(true);
    els.closeSet.onclick = () => toggleSettings(false);
    els.saveSet.onclick = () => {
        if(els.apiKey.value.trim()) {
            localStorage.setItem('gemini_key', els.apiKey.value.trim());
            els.saveSet.textContent = "Saved Successfully";
            els.saveSet.classList.add('bg-green-500', 'text-white');
            setTimeout(() => {
                toggleSettings(false);
                els.welcome.style.display = 'none';
                els.saveSet.textContent = "Save Changes";
                els.saveSet.classList.remove('bg-green-500', 'text-white');
            }, 800);
        }
    };

    els.input.addEventListener('input', () => {
        els.input.style.height = 'auto';
        els.input.style.height = els.input.scrollHeight + 'px';
        if(els.input.value.startsWith('/')) {
            els.cmdMenu.classList.remove('hidden');
            setTimeout(() => { els.cmdMenu.classList.remove('opacity-0', 'scale-95'); }, 10);
        } else {
            els.cmdMenu.classList.add('opacity-0', 'scale-95');
            setTimeout(() => els.cmdMenu.classList.add('hidden'), 200);
        }
    });

    els.input.onkeydown = (e) => {
        if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    };

    els.fileUp.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            fileData = ev.target.result.split(',')[1];
            fileType = file.type;
            els.preview.innerHTML = `
                <div class="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-500 shadow-lg animate-fade-in group">
                    <img src="${ev.target.result}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition" onclick="clearFile()">
                        <i class="fa-solid fa-xmark text-white"></i>
                    </div>
                </div>`;
        };
        reader.readAsDataURL(file);
    };

    window.clearFile = () => { fileData = null; els.preview.innerHTML = ''; els.fileUp.value = ''; };

    window.execCmd = (cmd) => {
        if(cmd === '/clear') { els.chat.innerHTML = ''; els.chat.appendChild(els.welcome); els.welcome.style.display = 'flex'; }
        else if(cmd === '/invisible tab') { document.title = "Google Docs"; document.querySelector("link[rel~='icon']").href = "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico"; }
        else if(cmd === '/features') { els.input.value = ''; addMsg('ai', "**Features:**\n- VibeCode Aesthetic\n- Smart Subject Modes\n- Vision Support\n- Privacy Cloaking"); }
        els.cmdMenu.classList.add('hidden'); els.input.value = ''; els.input.focus();
    };

    els.modeOpts.forEach(o => o.onclick = () => els.modeTxt.innerText = o.getAttribute('data-mode'));

    els.sendBtn.onclick = send;

    async function send() {
        const txt = els.input.value.trim();
        if(!txt && !fileData) return;
        
        if(!localStorage.getItem('gemini_key')) return toggleSettings(true);
        
        els.welcome.style.display = 'none';
        addMsg('user', txt, fileData ? `data:${fileType};base64,${fileData}` : null);
        
        els.input.value = ''; els.input.style.height = 'auto'; clearFile();

        const loader = document.createElement('div');
        loader.className = "flex w-full justify-start msg-enter";
        loader.innerHTML = `<div class="ai-bubble p-4 rounded-2xl rounded-bl-none shadow-lg flex items-center gap-2"><div class="loader"><span></span><span>
