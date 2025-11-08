document.addEventListener('DOMContentLoaded', () => {
    const inviteCodeInput = document.getElementById('inviteCode');
    const submitButton = document.getElementById('submitButton');
    const errorMessageElement = document.getElementById('errorMessage');

    const TABCODE_STORAGE_KEY = 'tabcode_passcodes';

    const handleLoginAttempt = () => {
        const enteredCode = inviteCodeInput.value;
        const storedCodes = localStorage.getItem(TABCODE_STORAGE_KEY);
        const validCodes = storedCodes ? JSON.parse(storedCodes) : [];

        const isCodeValid = validCodes.includes(enteredCode);

        if (isCodeValid) {
            window.location.href = '/aichat';
        } else {
            errorMessageElement.textContent = 'Please enter the correct invite code.';
            errorMessageElement.classList.add('show');
            inviteCodeInput.value = '';
            inviteCodeInput.focus();
        }
    };

    submitButton.addEventListener('click', handleLoginAttempt);

    inviteCodeInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleLoginAttempt();
        }
    });
});
