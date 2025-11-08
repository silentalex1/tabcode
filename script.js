document.addEventListener('DOMContentLoaded', () => {
    const inviteCodeInput = document.getElementById('inviteCode');
    const submitButton = document.getElementById('submitButton');
    const buttonParagraph = submitButton.querySelector('p');
    const errorMessageElement = document.getElementById('errorMessage');

    const API_URL = 'https://api.tabcode.cfd';
    const originalButtonText = buttonParagraph.textContent;

    const setLoadingState = (isLoading) => {
        submitButton.disabled = isLoading;
        buttonParagraph.textContent = isLoading ? 'Checking...' : originalButtonText;
    };

    const handleLoginAttempt = async () => {
        const enteredCode = inviteCodeInput.value.trim();
        if (!enteredCode || submitButton.disabled) {
            return;
        }

        setLoadingState(true);
        errorMessageElement.classList.remove('show');

        try {
            const response = await fetch(`${API_URL}/validate-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: enteredCode
                }),
            });

            const result = await response.json();

            if (result.success) {
                buttonParagraph.textContent = 'Success!';
                window.location.href = '/aichat';
            } else {
                errorMessageElement.textContent = 'Please enter the correct invite code.';
                errorMessageElement.classList.add('show');
                inviteCodeInput.value = '';
                inviteCodeInput.focus();
                setLoadingState(false);
            }
        } catch (error) {
            errorMessageElement.textContent = 'Cannot connect to server.';
            errorMessageElement.classList.add('show');
            setLoadingState(false);
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
