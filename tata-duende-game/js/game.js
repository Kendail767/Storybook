// Game state
let gameState = {
    currentLocation: window.location.pathname.split('/').pop(),
    inventory: [],
    protection: 1,
    tataDuenteFavor: 0,
    wisdom: 0,
    visitedLocations: [],
    learnedFolklore: {
        tataDuente: false,
        laLlorona: false,
        cadejo: false,
        anansi: false,
        sisimito: false
    },
    questStage: 'village',
    curseActive: true,
    timeOfDay: 'morning'
};

// Load state from localStorage if exists
function loadGame() {
    const saved = localStorage.getItem('tataDuenteGame');
    if (saved) {
        let parsed = JSON.parse(saved);
        // merge with default so new properties don't break old saves
        for (let key in parsed) {
            if (gameState.hasOwnProperty(key)) {
                gameState[key] = parsed[key];
            }
        }
    }
    // make sure currentLocation is updated to the actual page
    gameState.currentLocation = window.location.pathname.split('/').pop();
}

// Save state to localStorage
function saveGame() {
    localStorage.setItem('tataDuenteGame', JSON.stringify(gameState));
}

// Add item to inventory
function takeItem(item) {
    if (!gameState.inventory.includes(item)) {
        gameState.inventory.push(item);
        saveGame();
        alert(`You took the ${item}.`);
        updateInventoryDisplay();
    } else {
        alert(`You already have the ${item}.`);
    }
}

// Remove item from inventory (useful for when items get used)
function removeItem(item) {
    let index = gameState.inventory.indexOf(item);
    if (index !== -1) {
        gameState.inventory.splice(index, 1);
        saveGame();
        updateInventoryDisplay();
    }
}

// Update inventory display on page
function updateInventoryDisplay() {
    const invList = document.getElementById('inventory-list');
    if (invList) {
        invList.innerHTML = '';
        for (let i = 0; i < gameState.inventory.length; i++) {
            const li = document.createElement('li');
            li.textContent = gameState.inventory[i];
            invList.appendChild(li);
        }
    }
    
    // Add a reset button inside the inventory box if it doesn't already have one
    const invDiv = document.querySelector('.inventory');
    if (invDiv && !document.getElementById('reset-btn-inside')) {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'reset-btn-inside';
        resetBtn.textContent = '⟳ New Game';
        resetBtn.style.marginTop = '10px';
        resetBtn.style.padding = '5px 10px';
        resetBtn.style.backgroundColor = '#b57d4a';
        resetBtn.style.border = 'none';
        resetBtn.style.borderRadius = '5px';
        resetBtn.style.cursor = 'pointer';
        resetBtn.style.color = 'white';
        resetBtn.style.fontWeight = 'bold';
        resetBtn.onclick = function() {
            if (confirm('Start a new game? Your current progress will be lost.')) {
                localStorage.removeItem('tataDuenteGame');
                // go to root index.html, which will redirect to prologue
                window.location.href = '../index.html';
            }
        };
        invDiv.appendChild(resetBtn);
    }
}

// Track visited locations
function trackVisit() {
    const page = window.location.pathname.split('/').pop();
    if (!gameState.visitedLocations.includes(page)) {
        gameState.visitedLocations.push(page);
        saveGame();
    }
}

// Folklore knowledge flags
function learnFolklore(topic) {
    if (topic === 'all') {
        gameState.learnedFolklore = {
            tataDuente: true,
            laLlorona: true,
            cadejo: true,
            anansi: true,
            sisimito: true
        };
        alert("You have learned all the old stories from Don Chico.");
    } else {
        gameState.learnedFolklore[topic] = true;
        alert(`You learned about ${topic}.`);
    }
    saveGame();
}

// Reset game (clear localStorage and restart)
function resetGame() {
    if (confirm('Are you sure? This will erase your current progress.')) {
        localStorage.removeItem('tataDuenteGame');
        window.location.href = 'pages/prologue.html';
    }
}

// Initialize on each page
document.addEventListener('DOMContentLoaded', function() {
    loadGame();
    trackVisit();
    updateInventoryDisplay();
    updateTimeDisplay();
});

// Make functions global for onclick attributes
window.takeItem = takeItem;
window.removeItem = removeItem;
window.learnFolklore = learnFolklore;
window.resetGame = resetGame;

function updateTimeDisplay() {
    const timeElem = document.getElementById('time-indicator');
    if (timeElem) {
        let icon = '';
        if (gameState.timeOfDay === 'morning') icon = '☀️';
        else if (gameState.timeOfDay === 'dusk') icon = '🌙';
        else if (gameState.timeOfDay === 'night') icon = '⭐';
        else icon = '☀️';
        timeElem.textContent = icon + ' ' + gameState.timeOfDay.toUpperCase();
    }
}

 function addReadButton() {
    const storyDiv = document.querySelector('.story');
    if (!storyDiv) return;
    if (document.getElementById('readButton')) return;

    const btn = document.createElement('button');
    btn.id = 'readButton';
    btn.textContent = '🔊 Read Story (Old Man Voice)';
    btn.className = 'btn';
    btn.style.marginBottom = '15px';
    btn.style.backgroundColor = '#6b8c5c';

    storyDiv.parentNode.insertBefore(btn, storyDiv);

    // Helper: try to find a voice that sounds like an old male narrator
    function getOldManVoice(voices) {
        // Priority list – these are common male/natural voices across platforms
        const preferredNames = [
            'Google UK English Male',
            'Microsoft David Desktop',
            'Samantha',          // Actually female but sounds neutral, use as fallback
            'Alex',              // Mac's male voice
            'Daniel',            // Some Android devices
            'Google US English',
            'Fred'               // Some Windows TTS
        ];
        for (let name of preferredNames) {
            let voice = voices.find(v => v.name.includes(name) && v.lang.includes('en'));
            if (voice) return voice;
        }
        // Fallback: first male voice in English
        let maleVoice = voices.find(v => v.lang.includes('en') && v.name.toLowerCase().includes('male'));
        if (maleVoice) return maleVoice;
        // Last resort: any English voice
        return voices.find(v => v.lang.includes('en'));
    }

    const readStory = function() {
        const text = storyDiv.innerText;
        if (!text) return;

        // Cancel any ongoing speech (removed to avoid mobile issues? Let's keep it but be careful)
        // On mobile, cancel() can block, but without it overlapping speech is annoying.
        // We'll add a small delay to avoid conflict.
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set storyteller parameters: slow, low pitch
        utterance.rate = 0.8;      // slower for dramatic effect
        utterance.pitch = 0.65;     // lower = older, gruffer
        utterance.lang = 'en-US';

        // Wait for voices to be loaded, then pick the best one
        const voices = window.speechSynthesis.getVoices();
        if (voices.length) {
            utterance.voice = getOldManVoice(voices);
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                utterance.voice = getOldManVoice(window.speechSynthesis.getVoices());
                window.speechSynthesis.speak(utterance);
            };
            return; // will speak inside the event
        }
        
        window.speechSynthesis.speak(utterance);
    };

    btn.addEventListener('click', readStory);
    btn.addEventListener('touchstart', readStory);
}