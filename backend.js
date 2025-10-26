document.addEventListener('DOMContentLoaded', () => {
    const inviteInput = document.getElementById('invite-input');
    const submitButton = document.getElementById('submit-button');
    const errorMessage = document.getElementById('error-message');
    const inviteContainer = document.getElementById('invite-container');
    const chatInterface = document.getElementById('chat-interface');

    function getInviteCode() {
        const charCodes = [116, 97, 98, 99, 111, 100, 101, 100, 52, 52, 36, 36];
        let code = '';
        for (let i = 0; i < charCodes.length; i++) {
            code += String.fromCharCode(charCodes[i]);
        }
        return code;
    }

    function handleSubmission() {
        const userInput = inviteInput.value.trim();
        const correctCode = getInviteCode();

        if (userInput === correctCode) {
            inviteContainer.style.opacity = '0';
            setTimeout(() => {
                inviteContainer.classList.add('hidden');
                chatInterface.classList.remove('hidden');
            }, 500); 
        } else {
            errorMessage.textContent = 'Incorrect code. Please try again.';
            inviteInput.value = '';
            setTimeout(() => {
                errorMessage.textContent = '';
            }, 3000);
        }
    }

    submitButton.addEventListener('click', handleSubmission);

    inviteInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSubmission();
        }
    });
});
