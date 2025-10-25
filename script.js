document.addEventListener("DOMContentLoaded",function(){
    let files=[];
    let activeFile=-1;
    let geminiApiKey="";
    const editor=ace.edit("editor");
    editor.setTheme("ace/theme/tomorrow_night_eighties");
    editor.setShowPrintMargin(false);

    const fileExplorer=document.getElementById("file-explorer");
    const addFileBtn=document.getElementById("add-file-btn");
    const addFileModal=document.getElementById("add-file-modal");
    const modalLang=document.getElementById("modal-language");
    const modalFile=document.getElementById("modal-filename");
    const modalCreate=document.getElementById("modal-create");
    const modalCancel=document.getElementById("modal-cancel");
    const langDetector=document.getElementById("lang-detector");
    const improveCodeBtn=document.getElementById("improve-code");
    const obfuscateBtn=document.getElementById("obfuscate");
    const deobfuscateBtn=document.getElementById("deobfuscate");
    const obfuscateLang=document.getElementById("obfuscate-language");
    const terminal=document.getElementById("terminal");
    const aiagentModal=document.getElementById("aiagent-modal");
    const geminiKeyInput=document.getElementById("gemini-key");
    const saveGeminiKeyBtn=document.getElementById("save-gemini-key");
    const registerLink=document.getElementById("register-link");
    const aiagentChat=document.getElementById("aiagent-chat");
    const aiagentInput=document.getElementById("aiagent-input");
    const aiagentSend=document.getElementById("aiagent-send");
    const aiagentClose=document.getElementById("aiagent-close");

    function updateFileSidebar(){
        fileExplorer.innerHTML="";
        files.forEach((file,idx)=>{
            const li=document.createElement("li");
            li.className="file-item"+(idx===activeFile?" active":"");
            li.dataset.idx=idx;
            li.innerHTML=`<i>${getLangIcon(file.lang)}</i>${file.name||"Untitled"}<div class="file-move">
                <button class="move-btn" data-move="up" ${idx===0?"disabled":""}>▲</button>
                <button class="move-btn" data-move="down" ${idx===files.length-1?"disabled":""}>▼</button>
            </div>`;
            li.onclick=()=>{
                setActiveFile(idx);
            };
            li.querySelectorAll(".move-btn").forEach(btn=>{
                btn.onclick=(e)=>{
                    e.stopPropagation();
                    moveFile(idx,btn.dataset.move);
                };
            });
            fileExplorer.appendChild(li);
        });
    }
    function setActiveFile(idx){
        activeFile=idx;
        editor.setValue(files[activeFile].content||"", -1);
        setEditorMode(files[activeFile].lang||"plain_text");
        langDetector.textContent="LANGUAGE: "+(files[activeFile].lang||"NONE").toUpperCase();
        updateFileSidebar();
    }
    function moveFile(idx,dir){
        if(dir==="up"&&idx>0){
            [files[idx],files[idx-1]]=[files[idx-1],files[idx]];
            updateFileSidebar();
        }
        if(dir==="down"&&idx<files.length-1){
            [files[idx],files[idx+1]]=[files[idx+1],files[idx]];
            updateFileSidebar();
        }
    }
    function getLangIcon(lang){
        if(/js|javascript/i.test(lang))return"🟨";
        if(/lua/i.test(lang))return"🟦";
        if(/cpp|c\+\+/i.test(lang))return"🟩";
        if(/html/i.test(lang))return"⬜";
        return"🟪";
    }
    function setEditorMode(lang){
        editor.session.setMode("ace/mode/"+(lang||"plain_text"));
    }
    addFileBtn.onclick=()=>{
        addFileModal.style.display="flex";
        modalLang.value="";
        modalFile.value="";
        modalLang.focus();
    };
    modalCancel.onclick=()=>{addFileModal.style.display="none";};
    modalCreate.onclick=()=>{
        let lang=modalLang.value.trim()||"plain_text";
        let name=modalFile.value.trim()||"Untitled";
        files.push({name,lang,content:""});
        addFileModal.style.display="none";
        setActiveFile(files.length-1);
    };
    editor.on("change",function(){
        if(activeFile>=0){
            files[activeFile].content=editor.getValue();
            langDetector.textContent="LANGUAGE: "+(files[activeFile].lang||"NONE").toUpperCase();
        }
    });
    function populateObfuscateDropdown(){
        obfuscateLang.innerHTML="";
        ["Auto","JavaScript","Lua","C++","HTML","Plain Text"].forEach(l=>{
            let opt=document.createElement("option");
            opt.value=l.toLowerCase().replace(/ /g,"_");
            opt.textContent=l;
            obfuscateLang.appendChild(opt);
        });
    }
    populateObfuscateDropdown();

    function logToTerminal(message,type="info"){
        const entry=document.createElement("div");
        entry.innerHTML=`[<span style="color:${type==="error"?"#f44336":"#888"}">${new Date().toLocaleTimeString()}</span>] ${message}`;
        terminal.appendChild(entry);
        terminal.scrollTop=terminal.scrollHeight;
    }
    function detectLanguage(code){
        if(/\b(function|const|let|var|class|import|export)\b/.test(code)&&/console\.log/.test(code))return"javascript";
        if(/\b(local\s+function|function\s+\w+\s*\(|end\b)/.test(code)&&(code.includes('print')||code.includes('require')))return"lua";
        if(/#include\s*<[a-zA-Z_]+>/.test(code)&&/\b(int\s+main|std::cout|printf)\b/.test(code))return"c_cpp";
        if(/<!DOCTYPE\s+html>/i.test(code)&&/<\s*head\s*>/.test(code)&&/<\s*body\s*>/.test(code))return"html";
        return"plain_text";
    }
    function smartImprove(code,lang){
        let improved=code;
        let improvements=[];
        if(lang==="javascript"){
            improved=improved.replace(/var\s/g,()=>{improvements.push("Replaced 'var' with 'let'.");return"let ";});
            improved=improved.replace(/\s==\s(?!=)/g,()=>{improvements.push("Replaced '==' with '==='.");return" === ";});
            improved=improved.replace(/function\s+(\w+)\s*\((.*?)\)\s*\{([\s\S]*?)\}/g,(m,fn,args,body)=>{
                if(!body.includes('return')){improvements.push(`Added return in ${fn}.`);body=body.trim()+"\nreturn;";}
                return`function ${fn}(${args}){${body}}`;
            });
            improved=improved.replace(/console\.log\(([^)]+)\);/g,(m,inside)=>{
                improvements.push("Improved console.log formatting.");
                return`console.log(String(${inside}).trim());`;
            });
            improved=improved.replace(/if\s*\(([^)]+)\)\s*\{\s*\}/g,(m,cond)=>{
                improvements.push("Removed empty if blocks.");
                return"";
            });
        }else if(lang==="lua"){
            improved=improved.replace(/local\s+(\w+)\s*=\s*\{\s*\}/g,(m,v)=>{improvements.push(`Initialized table ${v} properly.`);return m;});
            improved=improved.replace(/print\(([^)]+)\)/g,(m,inside)=>{
                improvements.push("Improved print formatting.");
                return`print(tostring(${inside}):gsub("^%s*(.-)%s*$", "%1"))`;
            });
            improved=improved.replace(/\s+end/g,(m)=>{improvements.push("Trimmed whitespace before 'end'.");return" end";});
        }else if(lang==="c_cpp"){
            improved=improved.replace(/using\s+namespace\s+std;/g,(m)=>{improvements.push("Avoided 'using namespace std'.");return"";});
            improved=improved.replace(/std::cout\s*<<\s*([^\n;]+);/g,(m,inside)=>{
                improvements.push("Improved std::cout formatting.");
                return`std::cout << ${inside}.c_str();`;
            });
            improved=improved.replace(/int\s+main\(\)/g,(m)=>{improvements.push("Added explicit return type for main.");return m;});
        }else if(lang==="html"){
            improved=improved.replace(/<title>([\s\S]*?)<\/title>/i,(m,t)=>{
                improvements.push("Enforced single title tag.");
                return"<title>TabCode</title>";
            });
            improved=improved.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/i,(m,attr,text)=>{
                improvements.push("Improved h1 tag formatting.");
                return`<h1${attr}>${text.trim()}</h1>`;
            });
        }
        return{code:improved,improvements};
    }
    async function aiImprove(code,lang){
        if(!geminiApiKey)return null;
        let resp=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key="+geminiApiKey,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                contents:[{parts:[{text:"Improve this "+lang+" code and explain what was improved, make it clean and readable with best practices:\n"+code}]}]
            })
        });
        let dat=await resp.json();
        if(dat.candidates&&dat.candidates[0]&&dat.candidates[0].content&&dat.candidates[0].content.parts[0].text){
            let txt=dat.candidates[0].content.parts[0].text;
            let split=txt.split("Improvements:");
            let improved=split[0].trim();
            let improvements=(split[1]||"").split("\n").map(s=>s.trim()).filter(Boolean);
            return{code:improved,improvements};
        }
        return null;
    }
    improveCodeBtn.onclick=async()=>{
        let code=editor.getValue();
        let lang=detectLanguage(code);
        let improvedRes=null;
        if(geminiApiKey){
            improvedRes=await aiImprove(code,lang);
        }
        if(!improvedRes){
            improvedRes=smartImprove(code,lang);
        }
        if(improvedRes&&improvedRes.code!==code){
            editor.setValue(improvedRes.code,-1);
            logToTerminal("<strong>Code Improvement Suggestions:</strong>");
            (improvedRes.improvements||[]).forEach(imp=>logToTerminal("- "+imp));
        }else{
            logToTerminal("No improvements found.");
        }
    };

    function toughObfuscate(code,lang){
        if(lang==="javascript"){
            let obfuscated=code.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g,m=>{
                let enc=btoa(m);
                return`eval(atob("${enc}"))`;
            });
            obfuscated=obfuscated.replace(/function\s+(\w+)/g,(m,fn)=>"function "+fn+"_obf");
            return obfuscated;
        }
        if(lang==="lua"){
            let obfuscated=code.replace(/print\(([^)]+)\)/g,(m,inside)=>`print(string.reverse(tostring(${inside})))`);
            obfuscated=obfuscated.replace(/local\s+(\w+)\s*=/g,(m,v)=>`local ${v}_obf =`);
            return obfuscated;
        }
        if(lang==="c_cpp"){
            let obfuscated=code.replace(/std::cout\s*<<\s*([^\n;]+);/g,(m,inside)=>`std::cout << std::string(${inside}).c_str();`);
            obfuscated=obfuscated.replace(/int\s+main\(\)/g,"int main_obf()");
            return obfuscated;
        }
        if(lang==="html"){
            let obfuscated=code.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/i,(m,attr,text)=>`<h1${attr}>${text.split('').reverse().join('')}</h1>`);
            obfuscated=obfuscated.replace(/<p([^>]*)>([\s\S]*?)<\/p>/i,(m,attr,text)=>`<p${attr}>${btoa(text)}</p>`);
            return obfuscated;
        }
        return code;
    }
    obfuscateBtn.onclick=()=>{
        let code=editor.getValue();
        let lang=obfuscateLang.value;
        if(lang==="auto"||lang==="plain_text")lang=detectLanguage(code);
        let obfuscated=toughObfuscate(code,lang);
        editor.setValue(obfuscated,-1);
        logToTerminal("Code obfuscated ("+lang+").");
    };
    function toughDeobfuscate(code,lang){
        if(lang==="javascript"){
            let deobfuscated=code.replace(/eval\(atob\("([^"]+)"\)\)/g,(m,b64)=>atob(b64));
            deobfuscated=deobfuscated.replace(/function\s+(\w+)_obf/g,(m,fn)=>"function "+fn);
            return deobfuscated;
        }
        if(lang==="lua"){
            let deobfuscated=code.replace(/print\(string\.reverse\(tostring\(([^)]+)\)\)\)/g,(m,inside)=>`print(${inside})`);
            deobfuscated=deobfuscated.replace(/local\s+(\w+)_obf\s*=/g,(m,v)=>`local ${v} =`);
            return deobfuscated;
        }
        if(lang==="c_cpp"){
            let deobfuscated=code.replace(/std::cout\s*<<\s*std::string\(([^)]+)\)\.c_str\(\);/g,(m,inside)=>`std::cout << ${inside};`);
            deobfuscated=deobfuscated.replace(/int\s+main_obf\(\)/g,"int main()");
            return deobfuscated;
        }
        if(lang==="html"){
            let deobfuscated=code.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/i,(m,attr,text)=>`<h1${attr}>${text.split('').reverse().join('')}</h1>`);
            deobfuscated=deobfuscated.replace(/<p([^>]*)>([\s\S]*?)<\/p>/i,(m,attr,text)=>{try{return`<p${attr}>${atob(text)}</p>`;}catch{return`<p${attr}>${text}</p>`;}});
            return deobfuscated;
        }
        return code;
    }
    deobfuscateBtn.onclick=()=>{
        let code=editor.getValue();
        let lang=detectLanguage(code);
        let deobfuscated=toughDeobfuscate(code,lang);
        editor.setValue(deobfuscated,-1);
        logToTerminal("Code deobfuscated ("+lang+").");
    };

    document.oncontextmenu=function(e){
        e.preventDefault();
        let menu=document.createElement("div");
        menu.className="aiagent-menu";
        menu.style="position:fixed;z-index:999;background:#23233d;border-radius:7px;padding:0;margin:0;top:"+e.clientY+"px;left:"+e.clientX+"px;box-shadow:0 2px 8px #23233d44;";
        menu.innerHTML='<button class="aiagent-menu-btn" style="background:var(--color-accent);color:#fff;border:none;font-weight:600;font-size:15px;border-radius:7px;padding:12px 24px;cursor:pointer;">Answer with tabcode ai agent.</button>';
        document.body.appendChild(menu);
        document.querySelector(".aiagent-menu-btn").onclick=()=>{
            menu.remove();
            openAiAgentChat();
        };
        document.body.onclick=()=>{if(menu)menu.remove();};
    };
    function openAiAgentChat(){
        aiagentChat.style.display="flex";
    }
    aiagentClose.onclick=()=>{aiagentChat.style.display="none";};
    aiagentSend.onclick=sendAiAgent;
    aiagentInput.onkeydown=function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAiAgent();}};
    function sendAiAgent(){
        let question=aiagentInput.value.trim();
        if(!question)return;
        let lang=activeFile>=0?files[activeFile].lang:"plain_text";
        let code=activeFile>=0?files[activeFile].content:"";
        if(geminiApiKey){
            fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key="+geminiApiKey,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({contents:[{parts:[{text:question+"\nExisting code:\n"+code}]}]})
            })
            .then(resp=>resp.json())
            .then(dat=>{
                if(dat.candidates&&dat.candidates[0]&&dat.candidates[0].content&&dat.candidates[0].content.parts[0].text){
                    let txt=dat.candidates[0].content.parts[0].text;
                    if(activeFile>=0){
                        files[activeFile].content=txt;
                        editor.setValue(txt,-1);
                        logToTerminal("AI agent updated your code.");
                    }
                }
            });
        }
        aiagentInput.value="";
        aiagentChat.style.display="none";
    }
    let drag=false,dragOffsetX=0,dragOffsetY=0;
    aiagentChat.querySelector(".aiagent-header").onmousedown=function(e){
        drag=true;
        dragOffsetX=e.clientX-aiagentChat.offsetLeft;
        dragOffsetY=e.clientY-aiagentChat.offsetTop;
    };
    document.onmousemove=function(e){
        if(drag){
            aiagentChat.style.left=(e.clientX-dragOffsetX)+"px";
            aiagentChat.style.top=(e.clientY-dragOffsetY)+"px";
        }
    };
    document.onmouseup=function(){drag=false;};

    // /aiagent mode command detection
    editor.commands.addCommand({
        name:"AiAgentModeCommand",
        bindKey:{win:"",mac:""},
        exec:function(ed){
            let val=ed.getValue();
            if(val.includes("/aiagent mode")){
                document.querySelector(".console-header .button-bar").insertAdjacentHTML('beforeend','<button id="aiagent-enter" style="background:var(--color-accent);color:#fff;border:none;font-weight:600;font-size:15px;border-radius:7px;padding:7px 18px;cursor:pointer;">Enter</button>');
                let enterBtn=document.getElementById("aiagent-enter");
                enterBtn.onclick=function(){
                    aiagentModal.style.display="flex";
                    editor.setValue(val.replace("/aiagent mode",""),-1);
                    enterBtn.remove();
                };
            }
        }
    });
    editor.on("input",function(){editor.commands.exec("AiAgentModeCommand",editor);});
    saveGeminiKeyBtn.onclick=()=>{
        geminiApiKey=geminiKeyInput.value.trim();
        aiagentModal.style.display="none";
        logToTerminal("Gemini API key saved. AI features enabled.");
    };
    registerLink.onclick=()=>{window.open("/registeraccount","_blank");};
    addFileModal.onclick=e=>{if(e.target===addFileModal)addFileModal.style.display="none";};
    aiagentModal.onclick=e=>{if(e.target===aiagentModal)aiagentModal.style.display="none";};
    updateFileSidebar();
    populateObfuscateDropdown();
});
