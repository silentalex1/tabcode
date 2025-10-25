let files = [], activeFile = null, geminiKey = null;

const aceModes = {
    javascript: 'javascript',
    lua: 'lua',
    cpp: 'c_cpp',
    html: 'html',
    text: 'text'
};

document.addEventListener("DOMContentLoaded", () => {
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/tomorrow_night_eighties");
    editor.session.setMode("ace/mode/text");
    editor.setShowPrintMargin(false);
    editor.setOptions({
        fontSize: "16pt",
        tabSize: 4,
        useSoftTabs: true
    });

    const fileExplorer = document.getElementById("fileExplorer");
    const terminal = document.getElementById("terminal");
    const langDetector = document.getElementById("lang-detector");
    const improveCodeBtn = document.getElementById("improve-code");
    const deobfuscateBtn = document.getElementById("deobfuscate");
    const obfuscateBtn = document.getElementById("obfuscate");
    const obfuscateLang = document.getElementById("obfuscate-language");
    const addFileBtn = document.getElementById("add-file-btn");
    const aiSettingsBtn = document.getElementById("ai-settings-btn"); 
    const modalBackdrop = document.getElementById("modal-backdrop");
    const modalAddFile = document.getElementById("modal-addfile");
    const modalAiAgent = document.getElementById("modal-aiagent");
    const createFileBtn = document.getElementById("create-file");
    const closeModalBtn = document.getElementById("close-addfile"); 
    const fileLangInput = document.getElementById("file-language");
    const fileNameInput = document.getElementById("file-name");
    const geminiKeyInput = document.getElementById("gemini-key");
    const saveGeminiBtn = document.getElementById("save-gemini");
    const registerLink = document.getElementById("register-link");
    const aiagentBox = document.getElementById("aiagent-box");
    const aiagentHeader = document.getElementById("aiagent-header");
    const aiagentClose = document.getElementById("aiagent-close");
    const aiagentInput = document.getElementById("aiagent-input");
    const aiagentSend = document.getElementById("aiagent-send");
    const aiAgentChatWindow = document.getElementById("aiagent-chat-window");

    function logToTerminal(message, type = 'info') {
        const entry = document.createElement("div");
        entry.className = `log-entry log-${type}`;
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        entry.innerHTML = `[<span style="color:${type === 'error' ? '#ff6b6b' : type === 'success' ? '#48bb78' : '#9898ad'}">${time}</span>] ${message}`;
        terminal.appendChild(entry);
        terminal.scrollTop = terminal.scrollHeight;
    }

    function detectLanguage(code) {
        if (/\b(function|const|let|class|import|export)\b/s.test(code) || /^\s*['"]use\s+strict['"];/s.test(code)) return 'javascript';
        if (/\b(local\s+(function|[\w,]+\s*=\s*)|function\s+[\w.]+\s*\()/.test(code)) return 'lua';
        if (/#include\s*<[a-zA-Z_]+>/i.test(code) || /\b(int\s+main|std::(cout|cin))/.test(code)) return 'cpp';
        if (/<html\s*[^>]*>|<\s*head\s*>|<\s*body\s*>/i.test(code)) return 'html';
        return 'text';
    }

    function updateSidebar() {
        fileExplorer.innerHTML = '';
        files.forEach((file, i) => {
            const li = document.createElement("li");
            li.className = "file-item" + (file === activeFile ? ' active' : '');
            li.dataset.index = i;
            li.innerHTML = `<i>${getIcon(file.lang)}</i><span class="file-name-text">${file.name || "Untitled"}</span><div class="file-controls"><button class="move-up" title="Move Up">▲</button><button class="move-down" title="Move Down">▼</button><button class="delete-file" title="Delete File">✕</button></div>`;
            
            li.addEventListener('click', () => {
                if (activeFile) activeFile.content = editor.getValue();
                activeFile = file;
                editor.setValue(file.content, -1);
                editor.session.setMode("ace/mode/" + (aceModes[file.lang] || aceModes.text));
                updateSidebar();
                langDetector.textContent = "LANGUAGE: " + (file.lang ? file.lang.toUpperCase() : "TEXT");
            });

            li.querySelector('.move-up').addEventListener('click', (e) => {
                e.stopPropagation();
                if (i > 0) { [files[i - 1], files[i]] = [files[i], files[i - 1]]; updateSidebar(); }
            });
            li.querySelector('.move-down').addEventListener('click', (e) => {
                e.stopPropagation();
                if (i < files.length - 1) { [files[i + 1], files[i]] = [files[i], files[i + 1]]; updateSidebar(); }
            });
            li.querySelector('.delete-file').addEventListener('click', (e) => {
                e.stopPropagation();
                const fileToDelete = files[i];
                if (confirm(`Are you sure you want to delete ${fileToDelete.name || "Untitled"}?`)) {
                    files.splice(i, 1);
                    if (fileToDelete === activeFile) {
                        activeFile = files[0] || null;
                        if (activeFile) {
                            editor.setValue(activeFile.content, -1);
                            editor.session.setMode("ace/mode/" + (aceModes[activeFile.lang] || aceModes.text));
                        } else {
                            editor.setValue("", -1);
                            editor.session.setMode("ace/mode/text");
                        }
                    }
                    updateSidebar();
                    logToTerminal(`File **${fileToDelete.name || "Untitled"}** deleted.`, 'success');
                }
            });

            fileExplorer.appendChild(li);
        });
        if (activeFile) {
             langDetector.textContent = "LANGUAGE: " + (activeFile.lang ? activeFile.lang.toUpperCase() : "TEXT");
        } else {
             langDetector.textContent = "LANGUAGE: TEXT";
             editor.setValue("", -1);
             editor.session.setMode("ace/mode/text");
        }
    }

    function getIcon(lang) {
        if (lang === "javascript") return "🟨";
        if (lang === "lua") return "🟦";
        if (lang === "cpp") return "🟩";
        if (lang === "html") return "⬜";
        return "📄";
    }
    
    function showModal(modalElement) {
        modalBackdrop.style.display = "block";
        modalElement.style.display = "block";
    }

    function hideModals() {
        modalBackdrop.style.display = "none";
        modalAddFile.style.display = "none";
        modalAiAgent.style.display = "none";
    }

    addFileBtn.onclick = () => {
        showModal(modalAddFile);
        fileLangInput.value = "";
        fileNameInput.value = "";
        fileNameInput.focus();
    };
    aiSettingsBtn.onclick = () => {
        showModal(modalAiAgent);
        geminiKeyInput.value = geminiKey || "";
    };
    closeModalBtn.onclick = hideModals; 
    modalBackdrop.onclick = hideModals;

    createFileBtn.onclick = () => {
        const lang = fileLangInput.value.trim().toLowerCase();
        const name = fileNameInput.value.trim() || `untitled.${lang === 'javascript' ? 'js' : lang === 'lua' ? 'lua' : lang === 'cpp' ? 'cpp' : lang === 'html' ? 'html' : 'txt'}`;
        const newFile = { name, lang, content: "" };
        files.push(newFile);
        activeFile = newFile;
        editor.session.setMode("ace/mode/" + (aceModes[lang] || aceModes.text));
        editor.setValue("", -1);
        updateSidebar();
        hideModals();
        logToTerminal(`File **${name}** created.`, 'success');
    };

    function obfuscateJS(code) {
        let obfuscated = code.replace(/(["'`])((?:(?=(\\?))\3.)*?)\1/gs, (m, quote, content) => quote + btoa(content.split('').reverse().join('')) + quote);
        obfuscated = obfuscated.replace(/([A-Za-z_]\w*)/g, (m) => m.split('').reverse().join(''));
        return obfuscated;
    }
    function obfuscateLua(code) {
        let obfuscated = code.replace(/print\(([^)]+)\)/g, (m, inside) => `print(string.reverse(tostring(${inside})))`);
        obfuscated = obfuscated.replace(/\b(local)\s+(\w+)\b/g, (m, keyword, v) => `${keyword} ${v.split('').reverse().join('')}`);
        return obfuscated;
    }
    function obfuscateCpp(code) {
        let obfuscated = code.replace(/std::cout\s*<<\s*([^\n;]+);/g, (m, inside) => `std::cout << reinterpret_cast<const char*>(reinterpret_cast<const void*>(${inside}));`);
        obfuscated = obfuscated.replace(/\b(int\s+main)\b\(\)/g, "$1_obf()");
        return obfuscated;
    }
    function obfuscateHTML(code) {
        let obfuscated = code.replace(/(<(h1|p)([^>]*)>)([\s\S]*?)(<\/\2>)/ig, (m, openTag, tag, attr, text, closeTag) => {
            return openTag + btoa(text.trim()) + closeTag;
        });
        return obfuscated;
    }
    function obfuscateCode(code, lang) {
        if (!activeFile) return logToTerminal("No file open to obfuscate.", "error");
        if (lang === "auto") lang = detectLanguage(code);
        let obfuscated = "";
        
        if (lang === "javascript") obfuscated = obfuscateJS(code);
        else if (lang === "lua") obfuscated = obfuscateLua(code);
        else if (lang === "cpp") obfuscated = obfuscateCpp(code);
        else if (lang === "html") obfuscated = obfuscateHTML(code);
        else { logToTerminal(`No obfuscator for language **${lang}**.`, "error"); return; }
        
        editor.setValue(obfuscated, -1);
        activeFile.content = obfuscated;
        logToTerminal(`Code obfuscated (**${lang}**).`, 'success');
    }

    function isBase64(str) {
        if (typeof str !== 'string' || str.length === 0) return false;
        try {
            return btoa(atob(str)) === str;
        } catch (e) {
            return false;
        }
    }

    function deobfuscateJS(code) {
        let deobfuscated = code.replace(/(["'`])([A-Za-z0-9+\/=]+)\1/gs, (m, quote, encoded) => {
            if (isBase64(encoded)) {
                try {
                    return quote + atob(encoded).split('').reverse().join('') + quote;
                } catch {
                    return m;
                }
            }
            return m;
        });
        deobfuscated = deobfuscated.replace(/([A-Za-z_]\w*)/g, (m) => m.split('').reverse().join(''));
        return deobfuscated;
    }

    function deobfuscateLua(code) {
        let deobfuscated = code.replace(/print\(string\.reverse\(tostring\(([^)]+)\)\)\)/g, (m, inside) => `print(${inside})`);
        deobfuscated = deobfuscated.replace(/\b(local)\s+(\w+)\b/g, (m, keyword, v) => `${keyword} ${v.split('').reverse().join('')}`);
        return deobfuscated;
    }
    function deobfuscateCpp(code) {
        let deobfuscated = code.replace(/std::cout\s*<<\s*reinterpret_cast<const char\*>\(reinterpret_cast<const void\*>\(([^)]+)\)\);/g, (m, inside) => `std::cout << ${inside};`);
        deobfuscated = deobfuscated.replace(/\b(int\s+main)_obf\(\)/g, "$1()");
        return deobfuscated;
    }
    function deobfuscateHTML(code) {
        let deobfuscated = code.replace(/(<(h1|p)([^>]*)>)([A-Za-z0-9+\/=]+)(<\/\2>)/ig, (m, openTag, tag, attr, encoded, closeTag) => {
            if (isBase64(encoded)) {
                try {
                    return openTag + atob(encoded) + closeTag;
                } catch {
                    return m;
                }
            }
            return m;
        });
        return deobfuscated;
    }
    function deobfuscateCode(code) {
        if (!activeFile) return logToTerminal("No file open to deobfuscate.", "error");
        let lang = detectLanguage(code);
        let deobfuscated = code; 

        if (lang === "javascript") deobfuscated = deobfuscateJS(code);
        else if (lang === "lua") deobfuscated = deobfuscateLua(code);
        else if (lang === "cpp") deobfuscated = deobfuscateCpp(code);
        else if (lang === "html") deobfuscated = deobfuscateHTML(code);
        else { logToTerminal(`No deobfuscator for language **${lang}**.`, "error"); return; }
        
        editor.setValue(deobfuscated, -1);
        activeFile.content = deobfuscated;
        logToTerminal(`Code deobfuscated (**${lang}**).`, 'success');
    }

    function improveJS(code) {
        const imp = ["Switched 'var' to 'const'/'let'.", "Standardized equality checks to '==='.", "Simplified console output."];
        let newCode = code.replace(/\bvar\s/g, "let ");
        newCode = newCode.replace(/\s==\s(?!=)/g, " === ");
        newCode = newCode.replace(/console\.log\(([^)]+)\);/g, "console.log(String($1).trim());");
        return { code: newCode, imp };
    }
    function improveLua(code) {
        const imp = ["Used string.gsub for cleaner print output."];
        let newCode = code.replace(/print\(([^)]+)\)/g, "print(tostring($1):gsub('^%s*(.-)%s*$', '%1'))");
        return { code: newCode, imp };
    }
    function improveCpp(code) {
        const imp = ["Replaced basic print with modern C++ string output."];
        let newCode = code.replace(/printf\(([^)]+)\)/g, "std::cout << $1");
        return { code: newCode, imp };
    }
    function improveHTML(code) {
        const imp = ["Normalized text content within heading tags."];
        let newCode = code.replace(/(<h\d([^>]*)>)([\s\S]*?)(<\/h\d>)/ig, (m, openTag, attr, text, closeTag) => {
             return openTag + text.trim() + closeTag;
        });
        return { code: newCode, imp };
    }
    function improveCode(code) {
        if (!activeFile) return logToTerminal("No file open to improve.", "error");
        const lang = detectLanguage(code);
        let result = { code: code, imp: [] };

        if (lang === "javascript") result = improveJS(code);
        else if (lang === "lua") result = improveLua(code);
        else if (lang === "cpp") result = improveCpp(code);
        else if (lang === "html") result = improveHTML(code);

        if (geminiKey) {
            logToTerminal("AI improvement applied with Gemini API key **(Simulated)**.");
        }

        if (result.imp.length > 0) {
            logToTerminal("<strong>Code Improvement Suggestions:</strong>");
            result.imp.forEach(imp => logToTerminal(`- ${imp}`));
            editor.setValue(result.code, -1);
            activeFile.content = result.code;
            logToTerminal(`Code improved (**${lang}**).`, 'success');
        } else {
            logToTerminal("No local improvements found.");
        }
    }

    improveCodeBtn.onclick = () => improveCode(editor.getValue());
    obfuscateBtn.onclick = () => obfuscateCode(editor.getValue(), obfuscateLang.value);
    deobfuscateBtn.onclick = () => deobfuscateCode(editor.getValue());
    obfuscateLang.className = "dropdown-clean";

    editor.session.on('change', () => {
        const code = editor.getValue();
        if (activeFile) activeFile.content = code;
        const lang = detectLanguage(code);
        langDetector.textContent = "LANGUAGE: " + (lang ? lang.toUpperCase() : "TEXT");
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) { 
            const val = editor.getValue();
            if (val.includes("/aiagent mode")) {
                showAiAgentBox(e.clientX, e.clientY);
                const newVal = val.replace("/aiagent mode", "");
                editor.setValue(newVal, -1); 
            }
        }
    });

    saveGeminiBtn.onclick = () => {
        geminiKey = geminiKeyInput.value.trim();
        hideModals();
        if (geminiKey) {
            logToTerminal("Gemini API key saved.", 'success');
        } else {
            logToTerminal("Gemini API key cleared.", 'info');
        }
    };

    registerLink.onclick = (e) => {
        e.preventDefault();
        window.open(registerLink.href, "_blank");
    };

    document.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        showAiAgentBox(e.clientX, e.clientY);
    });

    function showAiAgentBox(x, y) {
        aiagentBox.style.display = "flex";
        aiagentInput.focus();
        // Since the AI box is fixed bottom-right, we don't need dynamic positioning here, 
        // but the contextmenu event triggers it. We'll just ensure it's visible.
    }
    
    aiagentClose.onclick = () => { aiagentBox.style.display = "none"; };
    aiagentSend.onclick = () => aiAgentSend();
    aiagentInput.onkeydown = e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); aiAgentSend(); }
    };
    function aiAgentSend() {
        const question = aiagentInput.value.trim();
        if (!question) return;

        const userMessage = document.createElement("div");
        userMessage.className = "chat-message user-message";
        userMessage.textContent = `You: ${question}`;
        aiAgentChatWindow.appendChild(userMessage);

        aiagentInput.value = "";
        aiAgentChatWindow.scrollTop = aiAgentChatWindow.scrollHeight;

        // Gemini AI integration would go here (call Gemini API with question and geminiKey)
        const aiResponse = document.createElement("div");
        aiResponse.className = "chat-message system-message";
        if (geminiKey) {
             aiResponse.textContent = `AI: Analyzing code in **${activeFile ? activeFile.name : "Untitled"}**... (Response Simulated)`;
             logToTerminal("AI agent query sent with saved key.", 'info');
        } else {
             aiResponse.textContent = `AI: Please set your Gemini API key in the settings (⚙) to use this feature.`;
             logToTerminal("AI agent query failed: No API key set.", 'error');
        }
        aiAgentChatWindow.appendChild(aiResponse);
        aiAgentChatWindow.scrollTop = aiAgentChatWindow.scrollHeight;
    }

    let dragging = false, dragOffset = { x: 0, y: 0 };
    aiagentHeader.onmousedown = function(e) {
        dragging = true;
        dragOffset.x = e.clientX - aiagentBox.getBoundingClientRect().left;
        dragOffset.y = e.clientY - aiagentBox.getBoundingClientRect().top;
        document.body.style.userSelect = "none";
    };
    document.onmousemove = function(e) {
        if (dragging) {
            let newX = e.clientX - dragOffset.x;
            let newY = e.clientY - dragOffset.y;
            
            // Constrain movement to viewport
            newX = Math.max(0, Math.min(newX, window.innerWidth - aiagentBox.offsetWidth));
            newY = Math.max(0, Math.min(newY, window.innerHeight - aiagentBox.offsetHeight));

            // Convert position back to right/bottom offsets for 'fixed' element for better drag behavior
            aiagentBox.style.left = newX + "px";
            aiagentBox.style.top = newY + "px";
            aiagentBox.style.right = "unset";
            aiagentBox.style.bottom = "unset";
        }
    };
    document.onmouseup = function() { dragging = false; document.body.style.userSelect = "auto"; };

    // Initial file setup
    if (files.length === 0) {
        files.push({ name: "welcome.js", lang: "javascript", content: "const message = \"Welcome to TabCode!\\n\\nRight-click to open the AI Agent.\\nType /aiagent mode in the editor and press Enter to open the AI Agent.\\nClick '+ Add File' below to get started.\";\\nconsole.log(message);" });
        activeFile = files[0];
        editor.setValue(activeFile.content, -1);
        editor.session.setMode("ace/mode/javascript");
        logToTerminal("Ready to code!", 'info');
    }
    updateSidebar();
});
