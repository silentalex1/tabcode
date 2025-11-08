javascript:(function() {
    const SERVER_URL = 'https://api.tabcode.cfd';
    const ADMIN_SECRET_KEY = 'CHANGE_THIS_TO_A_VERY_SECRET_KEY';
    const BOOKMARKLET_ID = 'tabcode-admin-panel';

    function cleanup() {
        const elm = document.getElementById(BOOKMARKLET_ID);
        if (elm) elm.remove();
    }
    if (document.getElementById(BOOKMARKLET_ID)) return cleanup();
    cleanup();

    const css = `
        #${BOOKMARKLET_ID} {
            position: fixed; top: 50px; left: 50px; z-index: 2147483647;
            background: #1e1e1e; border: 1px solid #8792eb; border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.5); font-family: 'Segoe UI', sans-serif;
            min-width: 320px;
        }
        #tabcode-header {
            padding: 10px 15px; cursor: move; background-color: #8792eb; color: #121212;
            border-top-left-radius: 9px; border-top-right-radius: 9px; font-weight: bold;
            display: flex; justify-content: space-between; align-items: center; user-select: none;
        }
        #tabcode-content { padding: 20px; }
        #${BOOKMARKLET_ID} button { cursor: pointer; }
        #passcode-list { list-style: none; padding: 0; margin-top: 15px; max-height: 180px; overflow-y: auto; }
        #passcode-list li {
            background: #2a2a2a; padding: 8px 12px; border-radius: 5px; margin-bottom: 5px;
            display: flex; justify-content: space-between; align-items: center; font-size: 14px;
        }
        .delete-passcode { cursor: pointer; }
        #tabcode-status { padding: 10px; background: #333; opacity: 0; transition: opacity 0.3s ease; text-align: center; }
        #tabcode-status.show { opacity: 1; }
    `;
    const html = `
        <div id="tabcode-header"><span>Tabcode Admin Panel</span><span id="tabcode-close-btn" style="cursor:pointer;">&times;</span></div>
        <div id="tabcode-content">
            <input type="text" id="newPasscodeInput" placeholder="Enter new passcode" style="width: calc(100% - 22px); padding: 10px; background: #121212; border: 1px solid #8792eb; color: #fff; border-radius: 5px;">
            <button id="addPasscodeBtn" style="width: 100%; padding: 10px; margin-top: 10px; background: #8792eb; border: none; border-radius: 5px; font-weight: bold;">Add Passcode</button>
            <strong style="display: block; margin-top: 20px;">Active Passcodes:</strong>
            <ul id="passcode-list"></ul>
        </div>
        <div id="tabcode-status"></div>
    `;

    const style = document.createElement('style'); style.innerHTML = css; document.head.appendChild(style);
    const elm = document.createElement('div'); elm.id = BOOKMARKLET_ID; elm.innerHTML = html; document.body.appendChild(elm);
    
    const statusEl = document.getElementById('tabcode-status');
    let statusTimer;
    const showStatus = (message, isError = false) => {
        clearTimeout(statusTimer);
        statusEl.textContent = message;
        statusEl.style.color = isE
