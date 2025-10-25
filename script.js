document.addEventListener("DOMContentLoaded", () => {
    const display = document.getElementById("display");
    const buttons = document.getElementById("buttons");

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

        try {
            const result = eval(expression);
            if (typeof result === 'number' && !isFinite(result)) {
                display.value = "Error";
            } else {
                display.value = result.toFixed(5).replace(/\.?0+$/, "");
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
            // Default behavior is fine
        } else if (key === 'c' || key === 'C') {
            e.preventDefault();
            display.value = '';
        } else if ('0123456789+-*/.'.includes(key)) {
            // Default behavior is fine
        } else if (key === '*') {
            // Custom logic for converting ** to °
            if (display.value.slice(-1) === '*') {
                e.preventDefault();
                display.value = display.value.slice(0, -1) + '°';
            } else if (e.shiftKey) {
                // Allows shift+8 for *
            } else {
                // Default behavior (single *)
            }
        } else if (key === 'a' || key === 'i') {
            // Allows typing 'a' or 'i' for the special string
        } else {
            e.preventDefault();
        }
    });

    display.addEventListener('input', () => {
        // This input listener is a failsafe to handle manual keyboard input and the special 'a+i' string.
        // It ensures the degree symbol is used for math operations.
        // It's primarily here to prevent non-calculator characters from appearing if the readOnly attribute is removed.
        // Since the input is readonly, the button logic handles most of the display updates.
    });

    // Special handler to allow manual typing in a readonly field for this specific requirement
    // In a real application, you'd use a div or set the readonly field to false.
    // For this specific requirement, we must allow keyboard input *despite* readonly.
    display.removeAttribute('readonly'); 
    display.focus();
});
