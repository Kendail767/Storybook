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

// A helper function to find a good voice for telling a story
function getStorytellerVoice(voices) {
    // 1. First, try to find a specific, high-quality male voice on your system
    const targetNames = ["Google UK English Male", "Samantha", "Alex", "Microsoft David Desktop"];
    let selectedVoice = voices.find(voice => targetNames.includes(voice.name));
    
    if (selectedVoice) return selectedVoice;

    // 2. If not found, try to find any male English voice
    selectedVoice = voices.find(voice => voice.lang.includes('en-') && voice.name.includes('Male'));
    if (selectedVoice) return selectedVoice;

    // 3. If still not found, just pick the first English voice available
    selectedVoice = voices.find(voice => voice.lang.includes('en-'));
    if (selectedVoice) return selectedVoice;

    // 4. Fallback to the system's default voice
    return voices.find(voice => voice.default) || voices[0];
}

// The main function to read the story
const speakStory = function() {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const storyText = document.querySelector('.story')?.innerText;
    if (!storyText) return;

    // Wait for voices to be loaded before trying to select one
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        const utterance = new SpeechSynthesisUtterance(storyText);
        
        // Pick the best voice for the job
        utterance.voice = getStorytellerVoice(voices);
        
        utterance.rate = 0.85;  // A slower rate adds to the dramatic effect
        utterance.pitch = 0.9;  // A slightly lower pitch can feel more authoritative
        utterance.lang = 'en-US';
        
        window.speechSynthesis.speak(utterance);
    };
};

function listAvailableVoices() {
    // The voices list loads asynchronously, so we need to wait for it to be ready.
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log(`Found ${voices.length} voices on this device:`);
        voices.forEach(voice => {
            console.log(`- ${voice.name} (lang: ${voice.lang}, local: ${voice.localService})`);
        });
    };
}