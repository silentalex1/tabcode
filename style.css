@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #050505; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }

.glow-bg {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: 
        radial-gradient(circle at 15% 15%, rgba(124, 58, 237, 0.08), transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(59, 130, 246, 0.08), transparent 40%);
    pointer-events: none;
    z-index: 0;
}

.glass-btn {
    background: rgba(20, 20, 20, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-popup {
    background: rgba(15, 15, 15, 0.95);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 -10px 50px rgba(0,0,0,0.7);
}

.mode-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 0.85rem;
    color: #9ca3af;
    display: flex;
    align-items: center;
    transition: 0.2s;
}
.mode-item:hover { background: rgba(255,255,255,0.08); color: white; }

.cmd-row {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    transition: 0.2s;
}
.cmd-row:hover { background: rgba(139, 92, 246, 0.1); }
.cmd-row:last-child { border-bottom: none; }

.suggestion-chip {
    padding: 6px 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 100px;
    font-size: 0.75rem;
    color: #d1d5db;
    transition: 0.2s;
    cursor: pointer;
}
.suggestion-chip:hover { background: rgba(255,255,255,0.1); border-color: rgba(139, 92, 246, 0.4); color: white; transform: translateY(-1px); }

.user-msg {
    background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%);
    box-shadow: 0 4px 15px rgba(109, 40, 217, 0.3);
}
.ai-msg {
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
}

.history-item {
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: #9ca3af;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.history-item:hover { background: rgba(255,255,255,0.05); color: white; }
.history-item.active { background: rgba(139, 92, 246, 0.1); color: white; border: 1px solid rgba(139, 92, 246, 0.2); }

.msg-anim { animation: msgPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; transform: translateY(10px); }
.animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes msgPop { to { opacity: 1; transform: translateY(0); } }

.prose p { margin-bottom: 0.6em; line-height: 1.6; color: #e4e4e7; }
.prose strong { color: #d8b4fe; font-weight: 700; }
.prose code { font-family: 'JetBrains Mono', monospace; color: #e879f9; font-size: 0.9em; }
