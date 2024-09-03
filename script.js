document.addEventListener('DOMContentLoaded', () => {
    const rageInput = document.getElementById('rageInput');
    const translateButton = document.getElementById('translateButton');
    const calmOutput = document.getElementById('calmOutput');
    const formalSwitch = document.getElementById('formalSwitch');
    const switchLabel = document.querySelector('.switch-label');
    const limitMessage = document.createElement('p');
    limitMessage.style.color = 'red';
    limitMessage.style.marginTop = '10px';
    translateButton.parentNode.insertBefore(limitMessage, translateButton.nextSibling);

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

    formalSwitch.addEventListener('change', () => {
        switchLabel.textContent = formalSwitch.checked ? 'Formal' : 'Informal';
    });

    translateButton.addEventListener('click', async () => {
        const rageText = rageInput.value.trim();
        
        if (rageText.length === 0) {
            alert('Please enter some text to translate.');
            return;
        }

        if (rageText.length > 1000) {
            alert('Text must be 1000 characters or less.');
            return;
        }

        if (!checkRateLimit()) {
            return;
        }

        translateButton.disabled = true;
        translateButton.textContent = 'Translating...';

        const url = '/translate';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text: rageText,
                    formal: formalSwitch.checked
                }),
            });

            if (!response.ok) {
                throw new Error('Translation failed');
            }

            const result = await response.json();
            calmOutput.value = result.translatedText;
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                alert('Network error. Please check your internet connection and try again.');
            } else {
                alert('An error occurred while translating. Please try again.');
            }
        } finally {
            translateButton.disabled = false;
            translateButton.textContent = 'Be nice';
            checkRateLimit();
        }
    });

    // Check rate limit on page load
    checkRateLimit();
});

const copyButton = document.getElementById('copyButton');
const calmOutput = document.getElementById('calmOutput');

copyButton.addEventListener('click', () => {
    calmOutput.select();
    document.execCommand('copy');
    const copyIcon = copyButton.querySelector('img');
    if (copyIcon) {
        copyIcon.src = 'check.png'; // Assuming you have a check.png for confirmation
        setTimeout(() => {
            copyIcon.src = 'copy.png';
        }, 2000);
    }
});
