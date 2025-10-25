document.addEventListener("DOMContentLoaded", () => {
    const display = document.getElementById("display");
    const buttons = document.getElementById("buttons");
    let lastAsteriskTime = 0;
    const doubleClickTimeThreshold = 300;

    function appendToDisplay(value) {
        if (value === '**') {
            display.value += '°';
        } else {
            display.value += value;
        }
    }

    function calculate() {
        let expression = display.value;
        
        if (expression.trim() === "a+i") {
            window.location.href = "/homeworkhelper";
            return;
        }

        expression = expression.replace(/°/g, '**');
        expression = expression.replace(/×/g, '*');
        expression = expression.replace(/÷/g, '/');
        expression = expression.replace(/−/g, '-');

        try {
            const result = eval(expression);
            if (typeof result === 'number' && !isFinite(result)) {
                display.value = "Error";
            } else {
                display.value = result.toFixed(8).replace(/\.?0+$/, "");
            }
        } catch (e) {
            display.value = "Error";
        }
    }

    buttons.addEventListener("click", (e) => {
        const target = e.target;
        if (!target.classList.contains('btn')) return;

        const value = target.getAttribute('data-value');

        if (value === '=') {
            calculate();
        } else if (value === 'C') {
            display.value = '';
        } else if (value === 'del') {
            display.value = display.value.slice(0, -1);
        } else if (value === '**') {
            appendToDisplay('°');
        } else {
            appendToDisplay(value);
        }
    });

    display.addEventListener('keydown', (e) => {
        const key = e.key;

        if (key === 'Enter') {
            e.preventDefault();
            calculate();
        } else if (key === 'Backspace') {
        } else if (key === 'c' || key === 'C') {
            e.preventDefault();
            display.value = '';
        } else if ('0123456789+-.'.includes(key)) {
        } else if (key === '/') {
            e.preventDefault();
            appendToDisplay('÷');
        } else if (key === '-') {
            e.preventDefault();
            appendToDisplay('−');
        } else if (key === '*') {
            e.preventDefault();
            const currentTime = new Date().getTime();
            if (currentTime - lastAsteriskTime < doubleClickTimeThreshold) {
                display.value = display.value.slice(0, -1);
                appendToDisplay('°');
                lastAsteriskTime = 0;
            } else {
                appendToDisplay('×');
                lastAsteriskTime = currentTime;
            }
        } else if (key === 'a' || key === 'i') {
        } else {
            e.preventDefault();
        }
    });

    display.removeAttribute('readonly'); 
    display.focus();
});
