document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const translateButton = document.getElementById('translateButton');
    const calmOutput = document.getElementById('calmOutput');
    const formalSwitch = document.getElementById('formalSwitch');
    const switchLabel = document.querySelector('.switch-label');
    const tabs = document.querySelectorAll('.tab');
    const switchContainer = document.querySelector('.switch-container');
    const limitMessage = document.createElement('p');
    limitMessage.style.color = 'red';
    limitMessage.style.marginTop = '10px';
    translateButton.parentNode.insertBefore(limitMessage, translateButton.nextSibling);

    let currentMode = 'nice';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            currentMode = tab.dataset.mode;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateUI();
        });
    });

    formalSwitch.addEventListener('change', () => {
        switchLabel.textContent = formalSwitch.checked ? 'Formal' : 'Informal';
    });

    function updateUI() {
        updatePlaceholders();
    }

    function updatePlaceholders() {
        if (currentMode === 'nice') {
            inputText.placeholder = "Go crazy here...";
            calmOutput.placeholder = "Your polite translation will appear here...";
            translateButton.textContent = "Translate";
            formalSwitch.disabled = false;
            switchContainer.style.opacity = '1';
            switchContainer.style.pointerEvents = 'auto';
        } else if (currentMode === 'mean') {
            inputText.placeholder = "Enter your nice text here...";
            calmOutput.placeholder = "Your mean translation will appear here...";
            translateButton.textContent = "Translate";
            formalSwitch.checked = false;
            formalSwitch.disabled = true;
            switchContainer.style.opacity = '0.5';
            switchContainer.style.pointerEvents = 'none';
        }
        switchLabel.textContent = formalSwitch.checked ? 'Formal' : 'Informal';
    }

    function checkRateLimit() {
        const now = Date.now();
        const twoHoursAgo = now - (2 * 60 * 60 * 1000);
        let translations = JSON.parse(localStorage.getItem('translations') || '[]');
        
        translations = translations.filter(t => t > twoHoursAgo);
        
        if (translations.length >= 1000) {
            updateButtonState(false);
            return false;
        }
        
        translations.push(now);
        localStorage.setItem('translations', JSON.stringify(translations));
        updateButtonState(true);
        return true;
    }

    function updateButtonState(enabled) {
        translateButton.disabled = !enabled;
        translateButton.style.backgroundColor = enabled ? '#28afed' : '#cccccc';
        limitMessage.textContent = enabled ? '' : "You reached a temporary limit. Now you're on your own.";
    }

    translateButton.addEventListener('click', async () => {
        if (!checkRateLimit()) return;

        const inputData = inputText.value.trim();
        if (inputData === '') return;

        const url = '/translate';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text: inputData,
                    formal: formalSwitch.checked,
                    mode: currentMode
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            calmOutput.value = data.translatedText;
        } catch (error) {
            console.error('Error:', error);
            calmOutput.value = 'An error occurred while processing. Please try again.';
        }
    });

    updateUI();
});
