// Game state
let gameState = {
    currentLocation: window.location.pathname.split('/').pop(),
    inventory: [],
    protection: 1,
    tataDuenteFavor: 0,
    wisdom: 0,
    visitedLocations: []
};

// Load state from localStorage if exists
function loadGame() {
    const saved = localStorage.getItem('tataDuenteGame');
    if (saved) {
        gameState = JSON.parse(saved);
    }
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

// Update inventory display on page
function updateInventoryDisplay() {
    const invList = document.getElementById('inventory-list');
    if (invList) {
        invList.innerHTML = '';
        gameState.inventory.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            invList.appendChild(li);
        });
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

// Initialize on each page
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    trackVisit();
    updateInventoryDisplay();

    // If we're on grandma's house, maybe show special message if first visit
    if (gameState.currentLocation === 'grandmas-house.html' && !gameState.visitedLocations.includes('grandmas-house.html')) {
        // First time here
    }
});

// Make functions global for onclick attributes
window.takeItem = takeItem;

//------------------------------------------------------------------------------

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

// Make it global
window.learnFolklore = learnFolklore;

// Also ensure that gameState.learnedFolklore is initialized in loadGame
function loadGame() {
    const saved = localStorage.getItem('tataDuenteGame');
    if (saved) {
        gameState = JSON.parse(saved);
    } else {
        // Initialize folklore object if not present
        gameState.learnedFolklore = {
            tataDuente: false,
            laLlorona: false,
            cadejo: false,
            anansi: false,
            sisimito: false
        };
    }
}

// Reset game (clear localStorage and restart)
window.resetGame = function() {
    if (confirm('Are you sure? This will erase your current progress.')) {
        localStorage.removeItem('tataDuenteGame');
        // Redirect to prologue
        window.location.href = 'pages/prologue.html';
    }
};