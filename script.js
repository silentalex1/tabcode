document.addEventListener('DOMContentLoaded', () => {
    const inviteCodeInput = document.getElementById('inviteCode');
    const submitButton = document.getElementById('submitButton');
    const errorMessageElement = document.getElementById('errorMessage');

    const SERVER_URL = 'http://localhost:3000';

    const handleLoginAttempt = async () => {
        const enteredCode = inviteCodeInput.value;
        if (!enteredCode) return;

        try {
            const response = await fetch(`${SERVER_URL}/validate-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: enteredCode }),
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = '/aichat';
            } else {
                errorMessageElement.textContent = 'Please enter the correct invite code.';
                errorMessageElement.classList.add('show');
                inviteCodeInput.value = '';
                inviteCodeInput.focus();
            }
        } catch (error) {
            errorMessageElement.textContent = 'Error connecting to the server.';
            errorMessageElement.classList.add('show');
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
