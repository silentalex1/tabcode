document.addEventListener("DOMContentLoaded",function(){
    const editor=ace.edit("editor");
    editor.setTheme("ace/theme/tomorrow_night_eighties");
    editor.session.setMode("ace/mode/javascript");
    editor.setShowPrintMargin(false);

    const terminal=document.getElementById("terminal");
    const langDetector=document.getElementById("lang-detector");
    const improveCodeBtn=document.getElementById("improve-code");
    const deobfuscateBtn=document.getElementById("deobfuscate");
    const obfuscateBtn=document.getElementById("obfuscate");
    const fileItems=document.querySelectorAll(".file-item");

    const fileContents={
        'script.js':'function calculateFactorial(n){let result=1;for(let i=2;i<=n;i++){if(i===n){result=result*i;}}return result;}console.log("Factorial of 5 is "+calculateFactorial(5));',
        'data.lua':'local player={}\nfunction player.new(name,level)local self=setmetatable({}, {__index=player})self.name=name self.level=level or 1 return self end\nfunction player:attack(target)print(self.name.." attacks "..target.name)end\nlocal warrior=player.new("Conan",10)local rogue=player.new("Valeria")\nwarrior:attack(rogue)',
        'main.cpp':'#include <iostream>\n#include <vector>\nint main(){std::vector<std::string>messages;messages.push_back("Hello");messages.push_back("tabcode!");for(const std::string& msg:messages){std::cout<<msg<<" ";}std::cout<<std::endl;return 0;}',
        'index.html':'<!DOCTYPE html>\n<html lang="en">\n<head>\n<title>TabCode</title>\n</head>\n<body>\n<h1 id="title">Welcome</h1>\n<p>This is a sample page.</p>\n</body>\n</html>'
    };

    editor.setValue(fileContents['script.js'],-1);

    const logToTerminal=(message,type='info')=>{
        const entry=document.createElement("div");
        entry.innerHTML=`[<span style="color:${type==='error'?'#f44336':'#888'}">${new Date().toLocaleTimeString()}</span>] ${message}`;
        terminal.appendChild(entry);
        terminal.scrollTop=terminal.scrollHeight;
    };

    const detectLanguage=(code)=>{
        if(/\b(function|const|let|var|class|import|export)\b/.test(code)&&/console\.log/.test(code))return'JAVASCRIPT';
        if(/\b(local\s+function|function\s+\w+\s*\(|end\b)/.test(code)&&(print=require.test(code)||/print\b/.test(code)))return'LUA';
        if(/#include\s*<[a-zA-Z_]+>/.test(code)&&/\b(int\s+main|std::cout|printf)\b/.test(code))return'C++';
        if(/<!DOCTYPE\s+html>/i.test(code)&&/<\s*head\s*>/.test(code)&&/<\s*body\s*>/.test(code))return'HTML';
        return'DETECTING...';
    };

    const improveCode=(code)=>{
        let improvements=[];
        let newCode=code;
        newCode=newCode.replace(/var\s/g,()=>{improvements.push("Replaced 'var' with 'let'.");return'let ';});
        newCode=newCode.replace(/\s==\s(?!=)/g,()=>{improvements.push("Replaced '==' with '==='.");return' === ';});
        if(improvements.length>0){
            logToTerminal("<strong>Code Improvement Suggestions:</strong>");
            improvements.forEach(imp=>logToTerminal(`- ${imp}`));
            editor.setValue(newCode,-1);
        }else{
            logToTerminal("No improvements found.");
        }
    };

    const obfuscateCode=(code)=>{
        try{
            const strings=[...code.matchAll(/"([^"]*)"|'([^']*)'/g)].map(m=>m[1]||m[2]);
            if(strings.length===0){logToTerminal("No strings to obfuscate.","error");return;}
            const uniqueStrings=[...new Set(strings)];
            const strArrayName=`_0x${Math.random().toString(16).substr(2,4)}`;
            let shuffled=uniqueStrings.map((s,i)=>({s,i})).sort(()=>Math.random()-.5);
            const mapping={};
            shuffled.forEach(({s},i)=>mapping[s]=i);
            const decoderName=`_0x${Math.random().toString(16).substr(2,4)}`;
            let obfuscatedCode=code;
            uniqueStrings.forEach(s=>{
                const regex=new RegExp(`["']${s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']`,'g');
                obfuscatedCode=obfuscatedCode.replace(regex,`${decoderName}(0x${mapping[s].toString(16)})`);
            });
            const arrayContent=shuffled.map(({s})=>`'${s.replace(/'/g,"\\'")}'`).join(',');
            const fullScript=`(function(){const ${strArrayName}=[${arrayContent}];const ${decoderName}=function(i){return ${strArrayName}[i];};${obfuscatedCode}\n})();`;
            editor.setValue(fullScript,-1);
            logToTerminal("Code obfuscated.");
        }catch(e){
            logToTerminal("Obfuscation failed.","error");
        }
    };

    const deobfuscateCode=(code)=>{
        try{
            const arrayMatch=code.match(/const\s+(_0x[a-f0-9]+)\s*=\s*\[([^\]]+)\];/);
            const decoderMatch=code.match(/const\s+(_0x[a-f0-9]+)\s*=\s*function\s*\([a-z]\)\s*{\s*return\s+\1\[[a-z]\];\s*};/);
            if(!arrayMatch||!decoderMatch){logToTerminal("No recognizable obfuscation.","error");return;}
            const decoderName=decoderMatch[1];
            const strArray=new Function(`return [${arrayMatch[2]}]`)();
            const regex=new RegExp(`${decoderName}\\((0x[a-f0-9]+)\\)`,'g');
            let deobfuscated=code.replace(regex,(match,hex)=>{const index=parseInt(hex,16);return`'${strArray[index]}'`;});
            deobfuscated=deobfuscated.substring(deobfuscated.indexOf('\n',deobfuscated.indexOf(decoderName))+1);
            deobfuscated=deobfuscated.replace(/\}\)\(\);/g,'').trim();
            editor.setValue(deobfuscated,-1);
            logToTerminal("Deobfuscation done.");
        }catch(e){
            logToTerminal("Deobfuscation failed.","error");
        }
    };

    editor.session.on('change',()=>{
        const code=editor.getValue();
        const lang=detectLanguage(code);
        langDetector.textContent=`LANGUAGE: ${lang}`;
    });

    fileItems.forEach(item=>{
        item.addEventListener("click",()=>{
            document.querySelector(".file-item.active").classList.remove("active");
            item.classList.add("active");
            const lang=item.dataset.lang;
            const file=item.dataset.file;
            editor.session.setMode(`ace/mode/${lang}`);
            editor.setValue(fileContents[file],-1);
            langDetector.textContent=`LANGUAGE: ${lang.toUpperCase().replace('_','')}`;
        });
    });

    improveCodeBtn.addEventListener('click',()=>improveCode(editor.getValue()));
    obfuscateBtn.addEventListener('click',()=>obfuscateCode(editor.getValue()));
    deobfuscateBtn.addEventListener('click',()=>deobfuscateCode(editor.getValue()));
    logToTerminal("TabCode started.");
});
