document.getElementById('registerBtn').addEventListener('click', function() {
    const inviteCode = document.getElementById('inviteCode').value;
    if (inviteCode === 'Tabcode$$55') {
        document.querySelector('.form').classList.add('hidden');
        document.getElementById('chatUI').classList.remove('hidden');
    } else {
        alert('Invalid invite code.');
    }
});

document.getElementById('settingsBtn').addEventListener('click', function() {
    document.getElementById('settingsUI').classList.remove('hidden');
});

document.getElementById('closeSettings').addEventListener('click', function() {
    document.getElementById('settingsUI').classList.add('hidden');
});

document.getElementById('saveSettings').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value;
    // Save settings logic here
    alert('Settings saved!');
});
