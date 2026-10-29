
const display = document.querySelector("#display");
const buttons = document.querySelector(".buttons");

let firstNumber = null;
let operator = null;
let secondNumber = null;

let waitingForSecondNumber = false;
let shouldResetDisplay = false;

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        return "Nice try! You can't divide by zero.";
    }

    return a / b;
}

function operate(operator, a, b) {
    switch (operator) {
        case "+":
            return add(a, b);
        case "-":
            return subtract(a, b);
        case "*":
            return multiply(a, b);
        case "/":
            return divide(a, b);
        default:
            return null;
    }
}

// Avoid long floating-point results such as 0.30000000000000004.
function formatResult(number) {
    if (!Number.isFinite(number)) {
        return String(number);
    }

    return String(Number(number.toPrecision(12)));
}

function showResult(result) {
    display.textContent = String(result);
}

function clearCalculator() {
    firstNumber = null;
    secondNumber = null;
    operator = null;

    waitingForSecondNumber = false;
    shouldResetDisplay = false;

    showResult("0");
}

function inputDigit(digit) {
    // A new digit after a result starts a fresh calculation.
    if (shouldResetDisplay) {
        display.textContent = digit;
        shouldResetDisplay = false;
        return;
    }

    // Start the second operand after an operator.
    if (waitingForSecondNumber) {
        display.textContent = digit;
        waitingForSecondNumber = false;
        return;
    }

    // Replace the initial zero instead of appending to it.
    if (display.textContent === "0") {
        display.textContent = digit;
    } else {
        display.textContent += digit;
    }
}

function inputDecimal() {
    if (shouldResetDisplay || waitingForSecondNumber) {
        display.textContent = "0.";
        shouldResetDisplay = false;
        waitingForSecondNumber = false;
        return;
    }

    // Only allow one decimal point per number.
    if (!display.textContent.includes(".")) {
        display.textContent += ".";
    }
}

function calculate() {
    // Do nothing until we have two numbers and an operator.
    if (
        operator === null ||
        firstNumber === null ||
        waitingForSecondNumber
    ) {
        return;
    }

    secondNumber = Number(display.textContent);

    const result = operate(operator, firstNumber, secondNumber);

    if (
        typeof result === "string" ||
        !Number.isFinite(result)
    ) {
        showResult(
            result === null
                ? "Invalid operation"
                : typeof result === "string"
                    ? result
                    : "Math error!"
        );

        firstNumber = null;
        secondNumber = null;
        operator = null;
        waitingForSecondNumber = false;
        shouldResetDisplay = true;
        return;
    }

    const formattedResult = formatResult(result);
    showResult(formattedResult);

    // Reset the pending operation after calculating.
    firstNumber = null;
    secondNumber = null;
    operator = null;

    waitingForSecondNumber = false;
    shouldResetDisplay = true;
}

function chooseOperator(nextOperator) {
    const currentNumber = Number(display.textContent);

    // Consecutive operators replace the previous operator.
    if (waitingForSecondNumber) {
        operator = nextOperator;
        return;
    }

    // If an operation is pending, calculate it first.
    if (operator !== null && firstNumber !== null) {
        calculate();

        // An error message or invalid state must not be
        // interpreted as a number for the next calculation.
        if (shouldResetDisplay && firstNumber === null) {
            if (
                display.textContent !== "0" &&
                !Number.isFinite(Number(display.textContent))
            ) {
                return;
            }
        }
    }

    firstNumber = Number(display.textContent);
    operator = nextOperator;
    waitingForSecondNumber = true;
    shouldResetDisplay = false;
}

function backspace() {
    if (shouldResetDisplay) {
        // Editing a completed result starts from zero.
        display.textContent = "0";
        shouldResetDisplay = false;
        return;
    }

    if (waitingForSecondNumber) {
        return;
    }

    const currentText = display.textContent;

    if (currentText.length <= 1 ||
        (currentText.length === 2 && currentText.startsWith("-"))) {
        display.textContent = "0";
    } else {
        display.textContent = currentText.slice(0, -1);
    }
}

// Use one click listener for the entire button container.
buttons.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    if (button.dataset.digit !== undefined) {
        inputDigit(button.dataset.digit);
    } else if (button.dataset.operator !== undefined) {
        chooseOperator(button.dataset.operator);
    } else {
        switch (button.dataset.action) {
            case "clear":
                clearCalculator();
                break;
            case "equals":
                calculate();
                break;
            case "decimal":
                inputDecimal();
                break;
            case "backspace":
                backspace();
                break;
        }
    }
});

// Keyboard support.
document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        inputDigit(key);
    } else if (["+", "-", "*", "/"].includes(key)) {
        chooseOperator(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === ".") {
        inputDecimal();
    } else if (key === "Backspace") {
        backspace();
    } else if (key === "Escape") {
        clearCalculator();
    }
});
