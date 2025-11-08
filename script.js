document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submitButton');
    const inviteCodeInput = document.getElementById('inviteCode');
    const errorMessage = document.getElementById('errorMessage');

    const checkCode = () => {
        submitButton.disabled = true;
        const enteredCode = inviteCodeInput.value;
        errorMessage.classList.remove('show');

        const validCodes = JSON.parse(localStorage.getItem('tabcode_passcodes')) || [];

        setTimeout(() => {
            if (enteredCode && validCodes.includes(enteredCode)) {
                window.location.href = '/aichat';
            } else {
                errorMessage.textContent = 'Invalid invite code.';
                errorMessage.classList.add('show');
                inviteCodeInput.focus();
                inviteCodeInput.value = '';
                submitButton.disabled = false;
            }
        }, 300);
    };

    submitButton.addEventListener('click', checkCode);

    inviteCodeInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkCode();
        }
    });
});
