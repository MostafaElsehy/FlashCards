// App state
let flashcards = [];
let currentCardIndex = 0;
let quizScore = { correct: 0, attempts: 0 };
let currentQuizCard = null;
let isShuffleMode = false;
let shuffledCards = [];
let studyStats = {
    cardsStudied: 0,
    lastStudyDate: null,
    studyStreak: 0
};

// New practice mode scores
let practiceScores = {
    typing: { correct: 0, attempts: 0 },
    multipleChoice: { correct: 0, attempts: 0 },
    fillBlank: { correct: 0, attempts: 0 },
    scramble: { correct: 0, attempts: 0 },
    listening: { correct: 0, attempts: 0 }
};

// Practice mode state
let currentPracticeMode = 'typing';
let currentPracticeCard = null;
let scrambledWord = '';

let isProcessingMCQuestion = false;

// Online/Offline detection
let isOnline = navigator.onLine;

// Test if we can actually access online voices
let canAccessOnlineVoices = false;



// DOM elements - will be initialized after DOM loads
let flashcardForm, wordInput, meaningInput, exampleInput, flashcard, cardWord, cardMeaning, cardExample;
let nextCardBtn, prevCardBtn, cardCounter, quizQuestion, quizAnswer, submitAnswerBtn, quizFeedback;
let scoreDisplay, resetScoreBtn, shuffleModeBtn, deleteCardBtn, exportDataBtn, importDataBtn;
let importFileInput, importImageBtn, importImageFileInput, clearAllDataBtn;
let mcScoreDisplay, mcQuestion, mcOptions, mcFeedback, resetMCScoreBtn;
let fbScoreDisplay, fbQuestion, fbAnswer, submitFBAnswerBtn, fbFeedback, resetFBScoreBtn;
let scrambleScoreDisplay, scrambleQuestion, scrambledWordEl, scrambleAnswer, submitScrambleAnswerBtn, scrambleFeedback, resetScrambleScoreBtn;
let listeningScoreDisplay, listeningQuestion, playWordBtn, listeningAnswer, submitListeningAnswerBtn, listeningFeedback, resetListeningScoreBtn;
let totalCardsEl, quizPercentageEl, cardsStudiedEl, studyStreakEl;
let modeButtons, practiceModes;



// Initialize DOM elements
function initDOMElements() {
    flashcardForm = document.getElementById('flashcardForm');
    wordInput = document.getElementById('word');
    meaningInput = document.getElementById('meaning');
    exampleInput = document.getElementById('example');
    flashcard = document.getElementById('flashcard');
    cardWord = document.getElementById('cardWord');
    cardMeaning = document.getElementById('cardMeaning');
    cardExample = document.getElementById('cardExample');
    nextCardBtn = document.getElementById('nextCard');
    prevCardBtn = document.getElementById('prevCard');
    cardCounter = document.getElementById('cardCounter');
    quizQuestion = document.getElementById('quizQuestion');
    quizAnswer = document.getElementById('quizAnswer');
    submitAnswerBtn = document.getElementById('submitAnswer');
    quizFeedback = document.getElementById('quizFeedback');
    scoreDisplay = document.getElementById('score');
    resetScoreBtn = document.getElementById('resetScore');
    shuffleModeBtn = document.getElementById('shuffleMode');
    deleteCardBtn = document.getElementById('deleteCard');
    exportDataBtn = document.getElementById('exportData');
    importDataBtn = document.getElementById('importData');
    importFileInput = document.getElementById('importFile');
    importImageBtn = document.getElementById('importImage');
    importImageFileInput = document.getElementById('importImageFile');
    clearAllDataBtn = document.getElementById('clearAllData');
    
    // Multiple choice elements
    mcScoreDisplay = document.getElementById('mcScore');
    mcQuestion = document.getElementById('mcQuestion');
    mcOptions = document.getElementById('mcOptions');
    mcFeedback = document.getElementById('mcFeedback');
    resetMCScoreBtn = document.getElementById('resetMCScore');
    
    // Fill in blank elements
    fbScoreDisplay = document.getElementById('fbScore');
    fbQuestion = document.getElementById('fbQuestion');
    fbAnswer = document.getElementById('fbAnswer');
    submitFBAnswerBtn = document.getElementById('submitFBAnswer');
    fbFeedback = document.getElementById('fbFeedback');
    resetFBScoreBtn = document.getElementById('resetFBScore');
    
    // Scramble elements
    scrambleScoreDisplay = document.getElementById('scrambleScore');
    scrambleQuestion = document.getElementById('scrambleQuestion');
    scrambledWordEl = document.getElementById('scrambledWord');
    scrambleAnswer = document.getElementById('scrambleAnswer');
    submitScrambleAnswerBtn = document.getElementById('submitScrambleAnswer');
    scrambleFeedback = document.getElementById('scrambleFeedback');
    resetScrambleScoreBtn = document.getElementById('resetScrambleScore');
    
    // Listening elements
    listeningScoreDisplay = document.getElementById('listeningScore');
    listeningQuestion = document.getElementById('listeningQuestion');
    playWordBtn = document.getElementById('playWord');
    listeningAnswer = document.getElementById('listeningAnswer');
    submitListeningAnswerBtn = document.getElementById('submitListeningAnswer');
    listeningFeedback = document.getElementById('listeningFeedback');
    resetListeningScoreBtn = document.getElementById('resetListeningScore');
    
    // Statistics elements
    totalCardsEl = document.getElementById('totalCards');
    quizPercentageEl = document.getElementById('quizPercentage');
    cardsStudiedEl = document.getElementById('cardsStudied');
    studyStreakEl = document.getElementById('studyStreak');
    
    // Practice mode elements
    modeButtons = document.querySelectorAll('.mode-btn');
    practiceModes = document.querySelectorAll('.practice-mode');
    
    console.log('DOM elements initialized');
    console.log('flashcardForm:', flashcardForm);
}

// Initialize app - Single consolidated initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialization started...');
    
    // Initialize DOM elements first
    initDOMElements();
    
    // Initialize all components
    initThemeToggle();
    initSpeechSynthesis();
    loadData();
    setupEventListeners();
    
    // Setup pronunciation buttons
    setupPronunciationButtons();
    
    // Preload voices for better offline support
    preloadVoices();
    
    // Initialize online/offline detection AFTER voices are loaded
    initOnlineDetection();
    
    // Update UI and displays first
    updateUI();
    updateButtonStates(); // Ensure button states are correct on load
    updateStudyStreak();
    
    // Register service worker
    registerServiceWorker();
    
    // Track study sessions
    startStudySession();
    
    // Save session data when page unloads
    window.addEventListener('beforeunload', endStudySession);
});

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install prompt
    showInstallPrompt();
});

function showInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    const installBtn = document.getElementById('installBtn');
    const closeBtn = document.getElementById('closeInstallPrompt');
    
    if (installPrompt && deferredPrompt) {
        installPrompt.classList.add('show');
        
        installBtn.addEventListener('click', () => {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
                installPrompt.classList.remove('show');
            });
        });
        
        closeBtn.addEventListener('click', () => {
            installPrompt.classList.remove('show');
        });
    }
}

// Load data from localStorage
function loadData() {
    const savedFlashcards = localStorage.getItem('flashcards');
    const savedScore = localStorage.getItem('quizScore');
    const savedStats = localStorage.getItem('studyStats');
    const savedPracticeScores = localStorage.getItem('practiceScores');
    const savedCardIndex = localStorage.getItem('currentCardIndex');
    
    if (savedFlashcards) {
        flashcards = JSON.parse(savedFlashcards);
    }
    
    if (savedScore) {
        quizScore = JSON.parse(savedScore);
    }
    
    if (savedStats) {
        studyStats = JSON.parse(savedStats);
    }
    
    if (savedPracticeScores) {
        practiceScores = JSON.parse(savedPracticeScores);
    }
    
    if (savedCardIndex) {
        currentCardIndex = JSON.parse(savedCardIndex);
        // Ensure currentCardIndex is within valid range
        if (currentCardIndex >= flashcards.length) {
            currentCardIndex = 0;
        }
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    localStorage.setItem('quizScore', JSON.stringify(quizScore));
    localStorage.setItem('studyStats', JSON.stringify(studyStats));
    localStorage.setItem('practiceScores', JSON.stringify(practiceScores));
    localStorage.setItem('currentCardIndex', JSON.stringify(currentCardIndex));
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    console.log('flashcardForm:', flashcardForm);
    
    // Form submission
    if (flashcardForm) {
        flashcardForm.addEventListener('submit', addFlashcard);
        console.log('Form event listener added');
    } else {
        console.error('flashcardForm not found!');
    }
    
    // Flashcard click to flip
    flashcard.addEventListener('click', flipCard);
    
    // Navigation buttons
    nextCardBtn.addEventListener('click', nextCard);
    prevCardBtn.addEventListener('click', prevCard);
    
    // Quiz submission
    submitAnswerBtn.addEventListener('click', submitQuizAnswer);
    
    // Control buttons
    resetScoreBtn.addEventListener('click', resetScore);
    shuffleModeBtn.addEventListener('click', toggleShuffleMode);
    deleteCardBtn.addEventListener('click', deleteCurrentCard);
    exportDataBtn.addEventListener('click', exportFlashcards);
    importDataBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importFlashcards);
    importImageBtn.addEventListener('click', () => importImageFileInput.click());
    importImageFileInput.addEventListener('change', handleImageImport);
    clearAllDataBtn.addEventListener('click', clearAllData);
    
    // Practice mode switching
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => switchPracticeMode(btn.dataset.mode));
    });
    
    // Multiple choice
    resetMCScoreBtn.addEventListener('click', () => resetPracticeScore('multipleChoice'));
    
    // Fill in blank
    submitFBAnswerBtn.addEventListener('click', submitFillBlankAnswer);
    resetFBScoreBtn.addEventListener('click', () => resetPracticeScore('fillBlank'));
    fbAnswer.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitFillBlankAnswer();
        }
    });
    
    // Scramble
    submitScrambleAnswerBtn.addEventListener('click', submitScrambleAnswer);
    resetScrambleScoreBtn.addEventListener('click', () => resetPracticeScore('scramble'));
    scrambleAnswer.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitScrambleAnswer();
        }
    });
    
    // Listening
    if (playWordBtn) {
        playWordBtn.addEventListener('click', () => {
            console.log('Play Word clicked, currentPracticeCard:', currentPracticeCard);
            if (currentPracticeCard && currentPracticeCard.word) {
                playWordBtn.textContent = '🔊 Playing...';
                playWordBtn.disabled = true;
                speakText(currentPracticeCard.word, 'en-US');
                
                // Reset button after a short delay
                setTimeout(() => {
                    if (playWordBtn) {
                        playWordBtn.textContent = '🔊 Play Word';
                        playWordBtn.disabled = false;
                    }
                }, 2000);
            } else {
                showFeedback('No word available to play', 'error');
            }
        });
    }
    

    
    submitListeningAnswerBtn.addEventListener('click', submitListeningAnswer);
    resetListeningScoreBtn.addEventListener('click', () => resetPracticeScore('listening'));
    listeningAnswer.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitListeningAnswer();
        }
    });
    

    
    // Enter key for quiz answer
    quizAnswer.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitQuizAnswer();
        }
    });
}

// Add new flashcard
function addFlashcard(e) {
    console.log('addFlashcard function called');
    e.preventDefault();
    
    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();
    const example = exampleInput.value.trim();
    
    if (!word || !meaning || !example) {
        alert('Please fill in all fields');
        return;
    }
    
    const newCard = {
        id: Date.now(),
        word: word,
        meaning: meaning,
        example: example
    };
    
    flashcards.push(newCard);
    
    // Reset form
    flashcardForm.reset();
    
    // If this is the first card, set currentCardIndex to 0
    if (flashcards.length === 1) {
        currentCardIndex = 0;
    }
    
    // Display the current card
    displayCurrentCard();
    
    // Update button states immediately
    updateButtonStates();
    
    // Update all other UI elements
    updateUI();
    
    // Save the current card index
    saveData();
    
    // Show success message
    showFeedback('Flashcard added successfully!', 'success');
}

// Centralized function to update button states
function updateButtonStates() {
    if (flashcards.length === 0) {
        nextCardBtn.disabled = true;
        prevCardBtn.disabled = true;
        deleteCardBtn.disabled = true;
    } else {
        nextCardBtn.disabled = currentCardIndex >= flashcards.length - 1;
        prevCardBtn.disabled = currentCardIndex <= 0;
        deleteCardBtn.disabled = false;
    }
}

// Update UI based on current state
function updateUI() {
    updateCardCounter();
    updateScoreDisplay();
    updateAllPracticeScores();
    updatePracticeSection();
    updateStatistics();
    updateDisplay(); // Call updateDisplay to handle all display logic
    
    // Update button states
    updateButtonStates();
    
    // Update pronunciation button states
    updatePronunciationButtons();
    
    // Initialize current practice mode
    switchPracticeMode(currentPracticeMode);
}

// Display current card
function displayCurrentCard() {
    if (flashcards.length === 0) return;
    
    const card = getCurrentCard();
    cardWord.textContent = card.word;
    cardMeaning.textContent = card.meaning;
    cardExample.textContent = card.example;
    
    // Reset card to front
    flashcard.classList.remove('flipped');
    
    // Update pronunciation button states
    updatePronunciationButtons();
}

// Get current card (handles shuffle mode)
function getCurrentCard() {
    if (isShuffleMode && shuffledCards.length > 0) {
        return shuffledCards[currentCardIndex];
    }
    return flashcards[currentCardIndex];
}

// Display empty state
function displayEmptyState() {
    cardWord.textContent = 'No cards yet';
    cardMeaning.textContent = 'Add some flashcards first!';
    cardExample.textContent = '';
    flashcard.classList.remove('flipped');
    
    // Update pronunciation button states
    updatePronunciationButtons();
}

// Flip card
function flipCard() {
    if (flashcards.length === 0) return;
    flashcard.classList.toggle('flipped');
    
    // Track study activity
    if (!flashcard.classList.contains('flipped')) {
        studyStats.cardsStudied++;
        updateStudyStreak();
        saveData();
    }
}

// Next card
function nextCard() {
    if (flashcards.length === 0) return;
    
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    displayCurrentCard();
    updateCardCounter();
    updateButtonStates(); // Update button states immediately
    saveData(); // Save the current card index
}

// Previous card
function prevCard() {
    if (flashcards.length === 0) return;
    
    currentCardIndex = currentCardIndex === 0 ? flashcards.length - 1 : currentCardIndex - 1;
    displayCurrentCard();
    updateCardCounter();
    updateButtonStates(); // Update button states immediately
    saveData(); // Save the current card index
}

// Toggle shuffle mode
function toggleShuffleMode() {
    isShuffleMode = !isShuffleMode;
    
    if (isShuffleMode) {
        // Create shuffled array
        shuffledCards = [...flashcards].sort(() => Math.random() - 0.5);
        shuffleModeBtn.textContent = '🔀 Shuffle Mode: ON';
        shuffleModeBtn.classList.add('btn-primary');
        shuffleModeBtn.classList.remove('btn-outline');
    } else {
        shuffledCards = [];
        shuffleModeBtn.textContent = '🔀 Shuffle Mode: OFF';
        shuffleModeBtn.classList.remove('btn-primary');
        shuffleModeBtn.classList.add('btn-outline');
    }
    
    currentCardIndex = 0;
    displayCurrentCard();
    updateCardCounter();
    updateButtonStates(); // Update button states immediately
    saveData(); // Save the current card index
}

// Delete current card
function deleteCurrentCard() {
    if (flashcards.length === 0) return;
    
    if (confirm('Are you sure you want to delete this card?')) {
        const cardToDelete = getCurrentCard();
        flashcards = flashcards.filter(card => card.id !== cardToDelete.id);
        
        if (isShuffleMode) {
            shuffledCards = shuffledCards.filter(card => card.id !== cardToDelete.id);
        }
        
        if (flashcards.length === 0) {
            currentCardIndex = 0;
        } else if (currentCardIndex >= flashcards.length) {
            currentCardIndex = flashcards.length - 1;
        }
        
        saveData();
        updateUI();
        updateButtonStates(); // Ensure button states are correct after deletion
        showFeedback('Card deleted successfully!', 'success');
    }
}

// Update card counter
function updateCardCounter() {
    const total = isShuffleMode ? shuffledCards.length : flashcards.length;
    cardCounter.textContent = `${currentCardIndex + 1} / ${total}`;
}

// Update score display
function updateScoreDisplay() {
    scoreDisplay.textContent = `${quizScore.correct} / ${quizScore.attempts}`;
}

// Update all practice scores
function updateAllPracticeScores() {
    mcScoreDisplay.textContent = `${practiceScores.multipleChoice.correct} / ${practiceScores.multipleChoice.attempts}`;
    fbScoreDisplay.textContent = `${practiceScores.fillBlank.correct} / ${practiceScores.fillBlank.attempts}`;
    scrambleScoreDisplay.textContent = `${practiceScores.scramble.correct} / ${practiceScores.scramble.attempts}`;
    listeningScoreDisplay.textContent = `${practiceScores.listening.correct} / ${practiceScores.listening.attempts}`;
}

// Update practice section
function updatePracticeSection() {
    // Hide all practice modes
    practiceModes.forEach(mode => {
        mode.style.display = 'none';
    });
    
    // Show current practice mode
    const currentMode = document.getElementById(`${currentPracticeMode}-mode`);
    if (currentMode) {
        currentMode.style.display = 'block';
    }
}

// Update statistics
function updateStatistics() {
    totalCardsEl.textContent = flashcards.length;
    
    // Calculate overall practice performance
    const totalAttempts = Object.values(practiceScores).reduce((sum, score) => sum + score.attempts, 0);
    const totalCorrect = Object.values(practiceScores).reduce((sum, score) => sum + score.correct, 0);
    const percentage = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    quizPercentageEl.textContent = `${percentage}%`;
    
    cardsStudiedEl.textContent = studyStats.cardsStudied;
    studyStreakEl.textContent = `${studyStats.studyStreak} days`;
}

// Update study streak
function updateStudyStreak() {
    const today = new Date().toDateString();
    
    if (studyStats.lastStudyDate !== today) {
        const lastDate = studyStats.lastStudyDate ? new Date(studyStats.lastStudyDate) : null;
        const todayDate = new Date(today);
        
        if (!lastDate || (todayDate - lastDate) / (1000 * 60 * 60 * 24) === 1) {
            studyStats.studyStreak++;
        } else if ((todayDate - lastDate) / (1000 * 60 * 60 * 24) > 1) {
            studyStats.studyStreak = 1;
        }
        
        studyStats.lastStudyDate = today;
    }
}

// Update quiz section
function updateQuizSection() {
    if (flashcards.length === 0) {
        quizQuestion.innerHTML = '<p>Add some flashcards to start the quiz!</p>';
        quizAnswer.disabled = true;
        submitAnswerBtn.disabled = true;
        return;
    }
    
    // Select a random card for quiz
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    currentQuizCard = flashcards[randomIndex];
    
    quizQuestion.innerHTML = `<p>What is the English word for: <strong>${currentQuizCard.meaning}</strong>?</p>`;
    quizAnswer.disabled = false;
    submitAnswerBtn.disabled = false;
    quizAnswer.value = '';
    quizAnswer.blur(); // Remove focus to clear any highlighting
    quizFeedback.textContent = '';
    quizFeedback.className = 'quiz-feedback';
}

// Submit quiz answer
function submitQuizAnswer() {
    if (!currentQuizCard) return;
    
    const userAnswer = quizAnswer.value.trim().toLowerCase();
    const correctAnswer = currentQuizCard.word.toLowerCase();
    
    quizScore.attempts++;
    
    if (userAnswer === correctAnswer) {
        quizScore.correct++;
        showQuizFeedback('Correct! 🎉', 'correct');
    } else {
        showQuizFeedback(`Wrong! The correct answer is: <strong>${currentQuizCard.word}</strong>`, 'incorrect');
    }
    
    saveData();
    updateScoreDisplay();
    updateStatistics();
    
    // Disable inputs temporarily
    quizAnswer.disabled = true;
    submitAnswerBtn.disabled = true;
    
    // Generate new question after 2 seconds
    setTimeout(() => {
        updateQuizSection();
    }, 2000);
}

// Show quiz feedback
function showQuizFeedback(message, type) {
    quizFeedback.innerHTML = message;
    quizFeedback.className = `quiz-feedback ${type}`;
}

// Reset score
function resetScore() {
    if (confirm('Are you sure you want to reset your quiz score?')) {
        quizScore = { correct: 0, attempts: 0 };
        saveData();
        updateScoreDisplay();
        updateStatistics();
        showFeedback('Score reset successfully!', 'success');
    }
}

// Export flashcards
function exportFlashcards() {
    if (flashcards.length === 0) {
        showFeedback('No flashcards to export!', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(flashcards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `flashcards_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showFeedback('Flashcards exported successfully!', 'success');
}

// Import flashcards
function importFlashcards(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedCards = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedCards)) {
                throw new Error('Invalid file format');
            }
            
            // Add imported cards with new IDs
            importedCards.forEach(card => {
                card.id = Date.now() + Math.random();
                flashcards.push(card);
            });
            
            saveData();
            updateUI();
            showFeedback(`${importedCards.length} flashcards imported successfully!`, 'success');
            
        } catch (error) {
            showFeedback('Error importing flashcards. Please check the file format.', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
        flashcards = [];
        quizScore = { correct: 0, attempts: 0 };
        studyStats = { cardsStudied: 0, lastStudyDate: null, studyStreak: 0 };
        practiceScores = {
            typing: { correct: 0, attempts: 0 },
            multipleChoice: { correct: 0, attempts: 0 },
            fillBlank: { correct: 0, attempts: 0 },
            scramble: { correct: 0, attempts: 0 },
            listening: { correct: 0, attempts: 0 }
        };
        currentCardIndex = 0;
        isShuffleMode = false;
        shuffledCards = [];
        currentPracticeMode = 'typing';
        currentPracticeCard = null;
        scrambledWord = '';
        isProcessingMCQuestion = false;
        
        localStorage.clear();
        updateUI();
        showFeedback('All data cleared successfully!', 'success');
    }
}

// Show general feedback
function showFeedback(message, type) {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        feedback.style.background = '#28a745';
    } else if (type === 'error') {
        feedback.style.background = '#dc3545';
    } else if (type === 'warning') {
        feedback.style.background = '#ffc107';
        feedback.style.color = '#333';
    } else {
        feedback.style.background = '#17a2b8';
    }
    
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
        feedback.remove();
    }, 3000);
}

// Add CSS animation for feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Practice Mode Functions

// Switch between practice modes
function switchPracticeMode(mode) {
    currentPracticeMode = mode;
    
    // Update active button
    modeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    
    // Hide all practice modes
    practiceModes.forEach(practiceMode => {
        practiceMode.style.display = 'none';
    });
    
    // Show selected mode
    const selectedMode = document.getElementById(`${mode}-mode`);
    if (selectedMode) {
        selectedMode.style.display = 'block';
    }
    
    // Initialize the selected mode
    initializePracticeMode(mode);
}

// Initialize practice mode
function initializePracticeMode(mode) {
    if (flashcards.length === 0) {
        showEmptyPracticeState(mode);
        return;
    }
    
    switch (mode) {
        case 'typing':
            updateQuizSection();
            break;
        case 'multiple-choice':
            updateMultipleChoiceSection();
            break;
        case 'fill-blank':
            updateFillBlankSection();
            break;
        case 'scramble':
            updateScrambleSection();
            break;
        case 'listening':
            updateListeningSection();
            break;
    }
}

// Show empty state for practice modes
function showEmptyPracticeState(mode) {
    const questionElements = {
        'typing': quizQuestion,
        'multiple-choice': mcQuestion,
        'fill-blank': fbQuestion,
        'scramble': scrambleQuestion,
        'listening': listeningQuestion
    };
    
    const element = questionElements[mode];
    if (element) {
        element.innerHTML = '<p>Add some flashcards to start practicing!</p>';
    }
    
    // Disable inputs for the current mode
    disablePracticeInputs(mode);
}

// Disable practice inputs
function disablePracticeInputs(mode) {
    const inputs = {
        'typing': [quizAnswer, submitAnswerBtn],
        'fill-blank': [fbAnswer, submitFBAnswerBtn],
        'scramble': [scrambleAnswer, submitScrambleAnswerBtn],
        'listening': [listeningAnswer, submitListeningAnswerBtn, playWordBtn]
    };
    
    const modeInputs = inputs[mode];
    if (modeInputs) {
        modeInputs.forEach(input => {
            if (input) input.disabled = true;
        });
    }
}

// Enable practice inputs
function enablePracticeInputs(mode) {
    const inputs = {
        'typing': [quizAnswer, submitAnswerBtn],
        'fill-blank': [fbAnswer, submitFBAnswerBtn],
        'scramble': [scrambleAnswer, submitScrambleAnswerBtn],
        'listening': [listeningAnswer, submitListeningAnswerBtn, playWordBtn]
    };
    
    const modeInputs = inputs[mode];
    if (modeInputs) {
        modeInputs.forEach(input => {
            if (input) input.disabled = false;
        });
    }
}

// Multiple Choice Practice
function updateMultipleChoiceSection() {
    if (flashcards.length === 0) {
        showEmptyPracticeState('multiple-choice');
        return;
    }
    
    // Reset processing flag
    isProcessingMCQuestion = false;
    
    // Clear any existing feedback
    mcFeedback.textContent = '';
    mcFeedback.className = 'quiz-feedback';
    
    // Clear any existing option highlighting from previous questions
    const existingOptions = document.querySelectorAll('.mc-option');
    existingOptions.forEach(option => {
        option.classList.remove('correct', 'incorrect');
        option.style.pointerEvents = 'auto';
    });
    
    // Select a random card
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    currentPracticeCard = flashcards[randomIndex];
    
    mcQuestion.innerHTML = `<p>What is the English word for: <strong>${currentPracticeCard.meaning}</strong>?</p>`;
    
    // Generate 4 options (1 correct + 3 wrong)
    const options = generateMultipleChoiceOptions(currentPracticeCard);
    
    // Clear previous options
    mcOptions.innerHTML = '';
    
    // Create option buttons
    options.forEach((option, index) => {
        const optionBtn = document.createElement('div');
        optionBtn.className = 'mc-option';
        optionBtn.textContent = option;
        optionBtn.dataset.option = option;
        optionBtn.addEventListener('click', () => selectMultipleChoiceOption(option));
        mcOptions.appendChild(optionBtn);
    });
    
    // Move focus to body to prevent any visual highlighting
    document.body.focus();
}

// Generate multiple choice options
function generateMultipleChoiceOptions(correctCard) {
    const options = [correctCard.word];
    
    // Get 3 random wrong answers
    const otherCards = flashcards.filter(card => card.id !== correctCard.id);
    const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
        options.push(shuffledOthers[i].word);
    }
    
    // If we don't have enough cards, add some generic words
    while (options.length < 4) {
        const genericWords = ['hello', 'world', 'learn', 'study', 'practice', 'word', 'language'];
        const randomWord = genericWords[Math.floor(Math.random() * genericWords.length)];
        if (!options.includes(randomWord)) {
            options.push(randomWord);
        }
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
}

// Handle multiple choice selection
function selectMultipleChoiceOption(selectedOption) {
    if (!currentPracticeCard || isProcessingMCQuestion) return;
    
    // Set processing flag to prevent multiple clicks
    isProcessingMCQuestion = true;
    
    // Prevent multiple clicks
    const options = document.querySelectorAll('.mc-option');
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    practiceScores.multipleChoice.attempts++;
    
    const isCorrect = selectedOption.toLowerCase() === currentPracticeCard.word.toLowerCase();
    
    if (isCorrect) {
        practiceScores.multipleChoice.correct++;
        showPracticeFeedback('mcFeedback', 'Correct! 🎉', 'correct');
    } else {
        showPracticeFeedback('mcFeedback', `Wrong! The correct answer is: <strong>${currentPracticeCard.word}</strong>`, 'incorrect');
    }
    
    // Highlight options
    options.forEach(option => {
        if (option.dataset.option === selectedOption) {
            option.classList.add(isCorrect ? 'correct' : 'incorrect');
        } else if (option.dataset.option === currentPracticeCard.word) {
            option.classList.add('correct');
        }
    });
    
    saveData();
    updateAllPracticeScores();
    
    // Clear the current practice card to prevent issues
    currentPracticeCard = null;
    
    // Generate new question after 2 seconds
    setTimeout(() => {
        updateMultipleChoiceSection();
    }, 2000);
}

// Fill in the Blank Practice
function updateFillBlankSection() {
    if (flashcards.length === 0) {
        showEmptyPracticeState('fill-blank');
        return;
    }
    
    // Select a random card
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    currentPracticeCard = flashcards[randomIndex];
    
    // Create a sentence with a blank
    const sentence = currentPracticeCard.example.replace(
        new RegExp(currentPracticeCard.word, 'gi'),
        '_____'
    );
    
    fbQuestion.innerHTML = `<p>Complete the sentence: <strong>${sentence}</strong></p>`;
    fbAnswer.value = '';
    fbAnswer.blur(); // Remove focus to clear any highlighting
    fbFeedback.textContent = '';
    fbFeedback.className = 'quiz-feedback';
    
    enablePracticeInputs('fill-blank');
}

// Submit fill in blank answer
function submitFillBlankAnswer() {
    if (!currentPracticeCard) return;
    
    const userAnswer = fbAnswer.value.trim().toLowerCase();
    const correctAnswer = currentPracticeCard.word.toLowerCase();
    
    practiceScores.fillBlank.attempts++;
    
    if (userAnswer === correctAnswer) {
        practiceScores.fillBlank.correct++;
        showPracticeFeedback('fbFeedback', 'Correct! 🎉', 'correct');
    } else {
        showPracticeFeedback('fbFeedback', `Wrong! The correct answer is: <strong>${currentPracticeCard.word}</strong>`, 'incorrect');
    }
    
    saveData();
    updateAllPracticeScores();
    
    // Disable inputs temporarily
    disablePracticeInputs('fill-blank');
    
    // Generate new question after 2 seconds
    setTimeout(() => {
        updateFillBlankSection();
    }, 2000);
}

// Word Scramble Practice
function updateScrambleSection() {
    if (flashcards.length === 0) {
        showEmptyPracticeState('scramble');
        return;
    }
    
    // Select a random card
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    currentPracticeCard = flashcards[randomIndex];
    
    // Scramble the word
    scrambledWord = scrambleWord(currentPracticeCard.word);
    
    scrambleQuestion.innerHTML = `<p>Unscramble the word for: <strong>${currentPracticeCard.meaning}</strong></p>`;
    scrambledWordEl.textContent = scrambledWord;
    scrambleAnswer.value = '';
    scrambleAnswer.blur(); // Remove focus to clear any highlighting
    scrambleFeedback.textContent = '';
    scrambleFeedback.className = 'quiz-feedback';
    
    enablePracticeInputs('scramble');
}

// Scramble a word
function scrambleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('').toUpperCase();
}

// Submit scramble answer
function submitScrambleAnswer() {
    if (!currentPracticeCard) return;
    
    const userAnswer = scrambleAnswer.value.trim().toLowerCase();
    const correctAnswer = currentPracticeCard.word.toLowerCase();
    
    practiceScores.scramble.attempts++;
    
    if (userAnswer === correctAnswer) {
        practiceScores.scramble.correct++;
        showPracticeFeedback('scrambleFeedback', 'Correct! 🎉', 'correct');
    } else {
        showPracticeFeedback('scrambleFeedback', `Wrong! The correct answer is: <strong>${currentPracticeCard.word}</strong>`, 'incorrect');
    }
    
    saveData();
    updateAllPracticeScores();
    
    // Disable inputs temporarily
    disablePracticeInputs('scramble');
    
    // Generate new question after 2 seconds
    setTimeout(() => {
        updateScrambleSection();
    }, 2000);
}

// Listening Practice
function updateListeningSection() {
    console.log('updateListeningSection called');
    
    if (flashcards.length === 0) {
        showEmptyPracticeState('listening');
        return;
    }
    
    // Select a random card
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    currentPracticeCard = flashcards[randomIndex];
    
    console.log('Selected card for listening:', currentPracticeCard);
    
    listeningQuestion.innerHTML = `<p>Listen and type the word for: <strong>${currentPracticeCard.meaning}</strong></p>`;
    listeningAnswer.value = '';
    listeningAnswer.blur(); // Remove focus to clear any highlighting
    listeningFeedback.textContent = '';
    listeningFeedback.className = 'quiz-feedback';
    
    // Reset play button
    if (playWordBtn) {
        playWordBtn.textContent = '🔊 Play Word';
        playWordBtn.disabled = false;
    }
    
    // Clear any potential mobile input styling
    setTimeout(() => {
        listeningAnswer.style.outline = 'none';
        listeningAnswer.style.borderColor = '';
        listeningAnswer.style.boxShadow = '';
    }, 10);
    
    enablePracticeInputs('listening');
}



// Play text using ResponsiveVoice
function playText(text) {
    console.log('playText called with:', text);
    
    if (!text || text.trim() === '') {
        showFeedback('No text to play', 'error');
        return;
    }
    
    if ('speechSynthesis' in window) {
        // Detect if text contains Arabic characters
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        const isArabic = arabicRegex.test(text);
        
        if (isArabic) {
            // For Arabic text, show a message that it's not supported
            showFeedback('Arabic text cannot be pronounced. Try "Play Word" for English words.', 'error');
            return;
        }
        
        try {
            // Stop any current speech
            speechSynthesis.cancel();
            
            // Create speech utterance
            const utterance = new SpeechSynthesisUtterance(text.trim());
            
            // Try to find an American English voice
            const americanVoice = availableVoices.find(voice => 
                voice.lang.includes('en-US') || 
                voice.name.includes('American') ||
                voice.name.includes('US')
            );
            if (americanVoice) {
                utterance.voice = americanVoice;
            }
            
            // Set speech parameters
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Speak the text
            speechSynthesis.speak(utterance);
            
            console.log('Speech synthesis initiated for:', text);
        } catch (error) {
            console.error('Error initiating speech synthesis:', error);
            showFeedback('Unable to play audio. Please try again.', 'error');
        }
    } else {
        console.error('Speech synthesis not supported');
        showFeedback('Speech synthesis not supported in this browser', 'error');
    }
}

// Submit listening answer
function submitListeningAnswer() {
    if (!currentPracticeCard) return;
    
    const userAnswer = listeningAnswer.value.trim().toLowerCase();
    const correctAnswer = currentPracticeCard.word.toLowerCase();
    
    practiceScores.listening.attempts++;
    
    if (userAnswer === correctAnswer) {
        practiceScores.listening.correct++;
        showPracticeFeedback('listeningFeedback', 'Correct! 🎉', 'correct');
    } else {
        showPracticeFeedback('listeningFeedback', `Wrong! The correct answer is: <strong>${currentPracticeCard.word}</strong>`, 'incorrect');
    }
    
    saveData();
    updateAllPracticeScores();
    
    // Disable inputs temporarily
    disablePracticeInputs('listening');
    
    // Generate new question after 2 seconds
    setTimeout(() => {
        updateListeningSection();
    }, 2000);
}



// Show practice feedback
function showPracticeFeedback(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = message;
        element.className = `quiz-feedback ${type}`;
    }
}

// Reset practice score
function resetPracticeScore(mode) {
    if (confirm(`Are you sure you want to reset your ${mode} score?`)) {
        practiceScores[mode] = { correct: 0, attempts: 0 };
        saveData();
        updateAllPracticeScores();
        showFeedback(`${mode} score reset successfully!`, 'success');
    }
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('.icon');
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(icon, savedTheme);
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(icon, newTheme);
        
        // Add animation class
        themeToggle.classList.add('theme-changed');
        setTimeout(() => {
            themeToggle.classList.remove('theme-changed');
        }, 300);
    });
}

function updateThemeIcon(icon, theme) {
    if (theme === 'dark') {
        icon.textContent = '☀️';
        icon.setAttribute('aria-label', 'Switch to light mode');
    } else {
        icon.textContent = '🌙';
        icon.setAttribute('aria-label', 'Switch to dark mode');
    }
}

// Chart.js for progress visualization
let performanceChart = null;
let activityChart = null;
let scoreChart = null;

// Progress tracking data
let progressData = {
    dailyActivity: {},
    studyTime: 0,
    sessionStart: null
};

// Initialize charts
function initCharts() {
    // Destroy existing charts if they exist
    if (performanceChart) {
        performanceChart.destroy();
        performanceChart = null;
    }
    if (activityChart) {
        activityChart.destroy();
        activityChart = null;
    }
    if (scoreChart) {
        scoreChart.destroy();
        scoreChart = null;
    }
    
    const performanceCtx = document.getElementById('performanceChart');
    const activityCtx = document.getElementById('activityChart');
    const scoreCtx = document.getElementById('scoreChart');
    
    if (performanceCtx && activityCtx && scoreCtx && typeof Chart !== 'undefined') {
        try {
            // Performance Chart
            performanceChart = new Chart(performanceCtx, {
                type: 'radar',
                data: {
                    labels: ['Typing', 'Multiple Choice', 'Fill Blank', 'Scramble', 'Listening'],
                    datasets: [{
                        label: 'Accuracy %',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(108, 92, 231, 0.2)',
                        borderColor: 'rgba(108, 92, 231, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(108, 92, 231, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(108, 92, 231, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                });
            
            // Score Chart
            scoreChart = new Chart(scoreCtx, {
                type: 'bar',
                data: {
                    labels: getLast7Days(),
                    datasets: [{
                        label: 'Score',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
            
            // Activity Chart
            activityChart = new Chart(activityCtx, {
                type: 'line',
                data: {
                    labels: getLast7Days(),
                    datasets: [{
                        label: 'Cards Studied',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }
}

// Get last 7 days for activity chart
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
}

// Update performance chart
function updatePerformanceChart() {
    if (!performanceChart) return;
    
    const data = [
        getAccuracyPercentage('typing'),
        getAccuracyPercentage('multipleChoice'),
        getAccuracyPercentage('fillBlank'),
        getAccuracyPercentage('scramble'),
        getAccuracyPercentage('listening')
    ];
    
    performanceChart.data.datasets[0].data = data;
    performanceChart.update();
}

// Get accuracy percentage for a practice mode
function getAccuracyPercentage(mode) {
    const score = practiceScores[mode];
    if (score.attempts === 0) return 0;
    return Math.round((score.correct / score.attempts) * 100);
}

// Update activity chart
function updateActivityChart() {
    if (!activityChart) return;
    
    const data = getLast7Days().map(day => {
        return progressData.dailyActivity[day] || 0;
    });
    
    activityChart.data.datasets[0].data = data;
    activityChart.update();
}

// Update score chart
function updateScoreChart() {
    if (!scoreChart) return;
    
    const data = getLast7Days().map(day => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - day));
        const dateString = date.toISOString().split('T')[0];
        const scores = JSON.parse(localStorage.getItem(dateString)) || { quizScore: { correct: 0, attempts: 0 } };
        return Math.round((scores.quizScore.correct / scores.quizScore.attempts) * 100) || 0;
    });
    
    scoreChart.data.datasets[0].data = data;
    scoreChart.update();
}

// Update progress insights
function updateProgressInsights() {
    // Find best performing mode
    const modes = ['typing', 'multipleChoice', 'fillBlank', 'scramble', 'listening'];
    const modeNames = ['Typing Quiz', 'Multiple Choice', 'Fill in Blank', 'Word Scramble', 'Listening'];
    
    let bestMode = 'No data yet';
    let bestScore = 0;
    
    modes.forEach((mode, index) => {
        const accuracy = getAccuracyPercentage(mode);
        if (accuracy > bestScore) {
            bestScore = accuracy;
            bestMode = modeNames[index];
        }
    });
    
    // Safely update DOM elements
    const bestModeEl = document.getElementById('bestMode');
    const improvementEl = document.getElementById('improvement');
    const studyTimeEl = document.getElementById('studyTime');
    
    if (bestModeEl) {
        bestModeEl.textContent = bestMode;
    }
    
    // Calculate improvement (simplified)
    const totalAccuracy = modes.reduce((sum, mode) => sum + getAccuracyPercentage(mode), 0) / modes.length;
    if (improvementEl) {
        improvementEl.textContent = `${totalAccuracy}% average`;
    }
    
    // Study time
    const minutes = Math.floor(progressData.studyTime / 60);
    if (studyTimeEl) {
        studyTimeEl.textContent = `${minutes} minutes`;
    }
}

// Track study session
function startStudySession() {
    progressData.sessionStart = Date.now();
}

function endStudySession() {
    if (progressData.sessionStart) {
        const sessionTime = Date.now() - progressData.sessionStart;
        progressData.studyTime += sessionTime;
        progressData.sessionStart = null;
        
        // Update daily activity
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        progressData.dailyActivity[today] = (progressData.dailyActivity[today] || 0) + 1;
        
        saveData();
        if (activityChart) {
            updateActivityChart();
        }
        updateProgressInsights();
    }
}

// Enhanced save data function
function saveData() {
    const data = {
        flashcards,
        quizScore,
        studyStats,
        practiceScores,
        progressData,
        currentCardIndex
    };
    localStorage.setItem('flashcardData', JSON.stringify(data));
}

// Enhanced load data function
function loadData() {
    const savedData = localStorage.getItem('flashcardData');
    if (savedData) {
        const data = JSON.parse(savedData);
        flashcards = data.flashcards || [];
        quizScore = data.quizScore || { correct: 0, attempts: 0 };
        studyStats = data.studyStats || { cardsStudied: 0, lastStudyDate: null, studyStreak: 0 };
        practiceScores = data.practiceScores || {
            typing: { correct: 0, attempts: 0 },
            multipleChoice: { correct: 0, attempts: 0 },
            fillBlank: { correct: 0, attempts: 0 },
            scramble: { correct: 0, attempts: 0 },
            listening: { correct: 0, attempts: 0 }
        };
        progressData = data.progressData || { dailyActivity: {}, studyTime: 0, sessionStart: null };
        currentCardIndex = data.currentCardIndex || 0;
        
        // Ensure currentCardIndex is within valid range
        if (currentCardIndex >= flashcards.length) {
            currentCardIndex = 0;
        }
    }
}

// Audio pronunciation functionality using Web Speech API
let speechSynthesis = window.speechSynthesis;
let availableVoices = [];

// Initialize Speech Synthesis
function initSpeechSynthesis() {
    // Initialize availableVoices
    function loadVoices() {
        availableVoices = speechSynthesis.getVoices();
        console.log('Voices loaded:', availableVoices.map(v => `${v.name} (${v.lang})`));
    }

    loadVoices();

    if (availableVoices.length === 0) {
        // Wait for voiceschanged event if voices not loaded
        speechSynthesis.addEventListener('voiceschanged', () => {
            loadVoices();
        });
    }
}

// Preload voices for better performance
function preloadVoices() {
    if ('speechSynthesis' in window) {
        availableVoices = speechSynthesis.getVoices();
        console.log('Voices ready:', availableVoices.length);
        
        // Log all available voices for debugging
        console.log('=== AVAILABLE VOICES ===');
        availableVoices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} (${voice.lang}) - Local: ${voice.localService}`);
        });
        
        // Specifically look for Google voices
        const googleVoices = availableVoices.filter(voice => voice.name.includes('Google'));
        if (googleVoices.length > 0) {
            console.log('=== GOOGLE VOICES FOUND ===');
            googleVoices.forEach(voice => {
                console.log(`🎯 ${voice.name} (${voice.lang}) - Local: ${voice.localService}`);
            });
        } else {
            console.log('⚠️ No Google voices found');
        }
        
        // Test online voice access after voices are loaded
        setTimeout(() => {
            testOnlineVoiceAccess();
        }, 1000); // Give voices time to fully load
    } else {
        console.warn('Speech synthesis not available');
    }
}

// Speak text using Web Speech API
function speakText(text, language = 'en-US') {
    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        return;
    }
    
    if (!text || text.trim() === '') {
        console.warn('No text to speak');
        showFeedback('No text to pronounce', 'error');
        return;
    }
    
    try {
        // Stop any current speech
        speechSynthesis.cancel();
        
        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(text.trim());
        
        console.log(`🎤 Speaking "${text}" with language: ${language} (${isOnline ? 'ONLINE' : 'OFFLINE'})`);
        
        // Configure voice based on language and online status
        if (language === 'en-GB') {
            let britishVoice = null;
            
            if (isOnline && canAccessOnlineVoices) {
                // Try to find Google UK Female voice first
                britishVoice = availableVoices.find(voice => 
                    !voice.localService && 
                    voice.name.includes('Google') && 
                    voice.name.includes('UK') && 
                    voice.name.includes('Female')
                );
                
                // If no Google UK Female, try any Google UK voice
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        !voice.localService && 
                        voice.name.includes('Google') && 
                        voice.name.includes('UK')
                    );
                }
                
                // If no Google UK voice, try any online British voice
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        !voice.localService && (
                            voice.lang.includes('en-GB') || 
                            voice.name.includes('British') ||
                            voice.name.includes('UK') ||
                            voice.name.includes('England') ||
                            voice.name.includes('London')
                        )
                    );
                }
                
                // If no online British voice, try any online English voice (not American)
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        !voice.localService && 
                        voice.lang.includes('en-') && 
                        !voice.lang.includes('en-US') &&
                        !voice.name.includes('American') &&
                        !voice.name.includes('US')
                    );
                }
                
                // If no online voice, fallback to local voices
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.localService && (
                            voice.lang.includes('en-GB') || 
                            voice.name.includes('British') ||
                            voice.name.includes('UK') ||
                            voice.name.includes('England') ||
                            voice.name.includes('London')
                        )
                    );
                }
                
                // Last resort: any local English voice
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.localService && 
                        voice.lang.includes('en-')
                    );
                }
                
                // If still no voice, use ANY available voice (even if not local)
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.lang.includes('en-')
                    );
                }
                
                // Final fallback: use the first available voice
                if (!britishVoice && availableVoices.length > 0) {
                    britishVoice = availableVoices[0];
                    console.warn('⚠️ Using first available voice as final fallback for British accent');
                }
            } else {
                // OFFLINE MODE: Only use local voices
                britishVoice = availableVoices.find(voice => 
                    voice.localService && (
                        voice.lang.includes('en-GB') || 
                        voice.name.includes('British') ||
                        voice.name.includes('UK') ||
                        voice.name.includes('England') ||
                        voice.name.includes('London')
                    )
                );
                
                // If no local British voice, try any local English voice (not American)
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.localService && 
                        voice.lang.includes('en-') && 
                        !voice.lang.includes('en-US') &&
                        !voice.name.includes('American') &&
                        !voice.name.includes('US')
                    );
                }
                
                // Last resort: any local English voice
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.localService && 
                        voice.lang.includes('en-')
                    );
                }
                
                // If still no voice, use ANY available voice (even if not local)
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.lang.includes('en-')
                    );
                }
                
                // Final fallback: use the first available voice
                if (!britishVoice && availableVoices.length > 0) {
                    britishVoice = availableVoices[0];
                    console.warn('⚠️ Using first available voice as final fallback for British accent');
                }
            }
            
            // Set the selected voice
            if (britishVoice) {
                utterance.voice = britishVoice;
                console.log(`🇬🇧 Selected British voice: ${britishVoice.name} (Local: ${britishVoice.localService})`);
            } else {
                console.error('❌ No British voice found!');
                return;
            }
        } else {
            let americanVoice = null;
            
            if (isOnline && canAccessOnlineVoices) {
                // Try to find Google US Female voice first
                americanVoice = availableVoices.find(voice => 
                    !voice.localService && 
                    voice.name.includes('Google') && 
                    voice.name.includes('US') && 
                    voice.name.includes('Female')
                );
                
                // If no Google US Female, try any Google US voice
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        !voice.localService && 
                        voice.name.includes('Google') && 
                        voice.name.includes('US')
                    );
                }
                
                // If no Google US voice, try any online American voice
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        !voice.localService && (
                            voice.lang.includes('en-US') || 
                            voice.name.includes('American') ||
                            voice.name.includes('US')
                        )
                    );
                }
                
                // If no online American voice, try any online English voice
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        !voice.localService && 
                        voice.lang.includes('en-')
                    );
                }
                
                // If no online voice, fallback to local voices
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        voice.localService && (
                            voice.lang.includes('en-US') || 
                            voice.name.includes('American') ||
                            voice.name.includes('US')
                        )
                    );
                }
                
                // Last resort: any local English voice
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        voice.localService && 
                        voice.lang.includes('en-')
                    );
                }
            } else {
                // OFFLINE MODE: Only use local voices
                americanVoice = availableVoices.find(voice => 
                    voice.localService && (
                        voice.lang.includes('en-US') || 
                        voice.name.includes('American') ||
                        voice.name.includes('US')
                    )
                );
                
                // If no local American voice, try any local English voice
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        voice.localService && 
                        voice.lang.includes('en-')
                    );
                }
                
                // If still no voice, use ANY available voice (even if not local)
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        voice.lang.includes('en-')
                    );
                }
                
                // Final fallback: use the first available voice
                if (!americanVoice && availableVoices.length > 0) {
                    americanVoice = availableVoices[0];
                    console.warn('⚠️ Using first available voice as final fallback for American accent');
                }
            }
            
            // Set the selected voice
            if (americanVoice) {
                utterance.voice = americanVoice;
                console.log('🇺🇸 Selected American voice:', americanVoice.name, 'Lang:', americanVoice.lang, 'Local:', americanVoice.localService);
            } else {
                console.error('❌ No American voice found!');
                return;
            }
        }
        
        // Speak the text
        speechSynthesis.speak(utterance);
        
        console.log('Speech started for:', text, 'with language:', language, 'voice:', utterance.voice ? utterance.voice.name : 'default');
        
        // Add error handling for when online voices fail
        utterance.onerror = (event) => {
            console.warn(`❌ Voice error: ${event.error} - Falling back to local voice`);
            
            // Try to find a local voice as fallback
            let fallbackVoice = null;
            if (accent === 'british') {
                fallbackVoice = availableVoices.find(voice => 
                    voice.localService && (
                        voice.lang.includes('en-GB') || 
                        voice.name.includes('British') ||
                        voice.name.includes('UK')
                    )
                );
            } else {
                fallbackVoice = availableVoices.find(voice => 
                    voice.localService && (
                        voice.lang.includes('en-US') || 
                        voice.name.includes('American') ||
                        voice.name.includes('US')
                    )
                );
            }
            
            if (fallbackVoice) {
                console.log(`🔄 Using fallback local voice: ${fallbackVoice.name}`);
                utterance.voice = fallbackVoice;
                speechSynthesis.speak(utterance);
            } else {
                console.error('❌ No fallback voice available');
            }
        };
        
    } catch (error) {
        console.error('Error starting speech synthesis:', error);
        showFeedback('Unable to pronounce text. Please try again.', 'error');
    }
}



// Play success sound for successful operations
function playSuccessSound() {
    try {
        // Check if audio context is supported
        if (!window.AudioContext && !window.webkitAudioContext) {
            console.warn('Web Audio API not supported');
            return;
        }
        
        // Create audio context (resume if suspended for mobile)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Resume audio context if suspended (required for mobile)
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                playSimpleSuccessSound(audioContext);
            }).catch(error => {
                console.warn('Could not resume audio context:', error);
                playFallbackSound();
            });
        } else {
            playSimpleSuccessSound(audioContext);
        }
        
    } catch (error) {
        console.warn('Could not create audio context:', error);
        playFallbackSound();
    }
}

// Simple success sound that works better on mobile
function playSimpleSuccessSound(audioContext) {
    try {
        // Create a simple oscillator for a clean success sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Higher frequency for success
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        
        // Configure volume envelope
        const startTime = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        // Start and stop oscillator
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
        
        console.log('Simple success sound played');
    } catch (error) {
        console.warn('Could not play simple success sound:', error);
        playFallbackSound();
    }
}

// Fallback sound using Web Speech API
function playFallbackSound() {
    try {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('Success');
            utterance.rate = 1.2;
            utterance.pitch = 1.1;
            utterance.volume = 0.3;
            speechSynthesis.speak(utterance);
            console.log('Fallback success sound played');
        }
    } catch (error) {
        console.warn('Fallback success sound also failed:', error);
    }
}

// Add audio buttons to flashcard


// Enhanced updateDisplay function
function updateDisplay() {
    if (flashcards.length === 0) {
        cardWord.textContent = 'No cards yet';
        cardMeaning.textContent = 'Add some flashcards first!';
        cardExample.textContent = '';
        cardCounter.textContent = '0 / 0';
        updatePronunciationButtons(); // Update pronunciation buttons
        return;
    }
    
    const currentCard = isShuffleMode ? shuffledCards[currentCardIndex] : flashcards[currentCardIndex];
    
    cardWord.textContent = currentCard.word;
    cardMeaning.textContent = currentCard.meaning;
    cardExample.textContent = currentCard.example;
    
    cardCounter.textContent = `${currentCardIndex + 1} / ${flashcards.length}`;
    
    // Update statistics
    document.getElementById('totalCards').textContent = flashcards.length;
    
    const percentage = quizScore.attempts > 0 ? Math.round((quizScore.correct / quizScore.attempts) * 100) : 0;
    document.getElementById('quizPercentage').textContent = `${percentage}%`;
    
    document.getElementById('cardsStudied').textContent = studyStats.cardsStudied;
    document.getElementById('studyStreak').textContent = `${studyStats.studyStreak} days`;
    
    // Update pronunciation buttons
    updatePronunciationButtons();
}

// Handle image import and Gemini API processing
async function handleImageImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showFeedback('Please select a valid image file', 'error');
        event.target.value = '';
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showFeedback('File size must be less than 10MB', 'error');
        event.target.value = '';
        return;
    }
    
    // Show loading state
    importImageBtn.disabled = true;
    importImageBtn.textContent = '🔄 Processing...';
    
    try {
        // Convert image to base64
        const base64Image = await imageToBase64(file);
        
        // Prepare prompt for Gemini
        const prompt = `Please extract all the words from the image (English/Arabic) and convert them into a JSON file with the following structure:

[
  {
    "id": auto_generated_number,
    "word": "English word",
    "meaning": "Arabic translation",
    "example": "A realistic English sentence using the word"
  }
]

⚠ Notes:
- Each word must have a realistic example sentence that matches its meaning.
- The "id" should be a unique number (you can use a timestamp).
- Only return the JSON array, no additional text or explanations.
- If you cannot extract words clearly, return an empty array [].`;

        // Call Gemini API with the provided key
        const apiKey = 'AIzaSyAZhjYJQuC3SmS5x8D6hZ87t3wH5VxEHoo';
        
        const response = await callGeminiAPI(apiKey, prompt, base64Image, file.type);
        
        // Parse response and import cards
        const words = parseGeminiResponse(response);
        
        if (words.length > 0) {
            // Add words to flashcards
            words.forEach(word => {
                const newCard = {
                    id: word.id || Date.now() + Math.random(),
                    word: word.word,
                    meaning: word.meaning,
                    example: word.example
                };
                flashcards.push(newCard);
            });
            
            saveData();
            updateUI();
            showFeedback(`${words.length} words imported successfully!`, 'success');
            
            // Play success sound
            playSuccessSound();
        } else {
            showFeedback('No words could be extracted from the image. Please try a clearer image.', 'error');
        }
        
    } catch (error) {
        console.error('Error processing image:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Provide more specific error messages
        if (error.message.includes('API request failed')) {
            if (error.message.includes('400')) {
                showFeedback('Invalid request to Gemini API. Please check the image format.', 'error');
            } else if (error.message.includes('401') || error.message.includes('403')) {
                showFeedback('API key error. Please check your Gemini API key.', 'error');
            } else if (error.message.includes('429')) {
                showFeedback('API rate limit exceeded. Please try again later.', 'error');
            } else {
                showFeedback(`API Error: ${error.message}`, 'error');
            }
        } else if (error.message.includes('fetch')) {
            showFeedback('Network error. Please check your internet connection.', 'error');
        } else {
            showFeedback('Error processing image. Please try again.', 'error');
        }
    } finally {
        // Reset button state
        importImageBtn.disabled = false;
        importImageBtn.textContent = '🖼️ Import Image';
        event.target.value = ''; // Reset file input
    }
}

// Convert image to base64
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Call Gemini API
async function callGeminiAPI(apiKey, prompt, base64Image, mimeType) {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: mimeType,
                        data: base64Image
                    }
                }
            ]
        }]
    };
    
    console.log('Making API request to Gemini...');
    console.log('URL:', url);
    console.log('MIME type:', mimeType);
    console.log('Image data length:', base64Image.length);
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
   
    }
    
    const data = await response.json();
    console.log('Gemini API response:', data);
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;
        console.log('Extracted response text:', responseText);
        return responseText;
    } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from Gemini API');
    }
}

// Parse Gemini response
function parseGeminiResponse(response) {
    try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const jsonString = jsonMatch[0];
            const words = JSON.parse(jsonString);
            
            // Validate structure
            if (Array.isArray(words)) {
                return words.filter(word => 
                    word.id && 
                    word.word && 
                    word.meaning && 
                    word.example
                );
            }
        }
        
        // If no valid JSON found, try to parse the entire response
        const words = JSON.parse(response);
        if (Array.isArray(words)) {
            return words.filter(word => 
                word.id && 
                word.word && 
                word.meaning && 
                word.example
            );
        }
        
        return [];
    } catch (error) {
        console.error('Error parsing Gemini response:', error);
        return [];
    }
}

// Speak word with specific accent using Web Speech API
function speakWord(word, accent) {
    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not available');
        return;
    }
    
    if (!word || word.trim() === '') {
        return;
    }
    
    try {
        // Stop any current speech
        speechSynthesis.cancel();
        
        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(word.trim());
        
        console.log(`🎤 Speaking "${word}" with ${accent} accent (${isOnline ? 'ONLINE' : 'OFFLINE'})`);
        
        // Find different voices for different accents based on online status
        if (accent === 'british') {
            let britishVoice = null;
            
            if (isOnline && canAccessOnlineVoices) {
                // Try to find Google UK Female voice first
                britishVoice = availableVoices.find(voice => 
                    !voice.localService && 
                    voice.name.includes('Google') && 
                    voice.name.includes('UK') && 
                    voice.name.includes('Female')
                );
                
                // If no Google UK Female, try any Google UK voice
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        !voice.localService && 
                        voice.name.includes('Google') && 
                        voice.name.includes('UK')
                    );
                }
                
                // If no Google UK voice, try any online British voice
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        !voice.localService && (
                            voice.lang.includes('en-GB') || 
                            voice.name.includes('British') ||
                            voice.name.includes('UK') ||
                            voice.name.includes('England') ||
                            voice.name.includes('London')
                        )
                    );
                }
                
                // If no online British voice, try any online English voice (not American)
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        !voice.localService && 
                        voice.lang.includes('en-') && 
                        !voice.lang.includes('en-US') &&
                        !voice.name.includes('American') &&
                        !voice.name.includes('US')
                    );
                }
                
                // If no online voice, fallback to local voices
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.localService && (
                            voice.lang.includes('en-GB') || 
                            voice.name.includes('British') ||
                            voice.name.includes('UK') ||
                            voice.name.includes('England') ||
                            voice.name.includes('London')
                        )
                    );
                }
                
                // Last resort: any local English voice
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.localService && 
                        voice.lang.includes('en-')
                    );
                }
                
                // If still no voice, use ANY available voice (even if not local)
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.lang.includes('en-')
                    );
                }
                
                // Final fallback: use the first available voice
                if (!britishVoice && availableVoices.length > 0) {
                    britishVoice = availableVoices[0];
                    console.warn('⚠️ Using first available voice as final fallback for British accent');
                }
            } else {
                // OFFLINE MODE: Only use local voices
                britishVoice = availableVoices.find(voice => 
                    voice.localService && (
                        voice.lang.includes('en-GB') || 
                        voice.name.includes('British') ||
                        voice.name.includes('UK') ||
                        voice.name.includes('England') ||
                        voice.name.includes('London')
                    )
                );
                
                // If no local British voice, try any local English voice (not American)
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.localService && 
                        voice.lang.includes('en-') && 
                        !voice.lang.includes('en-US') &&
                        !voice.name.includes('American') &&
                        !voice.name.includes('US')
                    );
                }
                
                // Last resort: any local English voice
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.localService && 
                        voice.lang.includes('en-')
                    );
                }
                
                // If still no voice, use ANY available voice (even if not local)
                if (!britishVoice) {
                    britishVoice = availableVoices.find(voice => 
                        voice.lang.includes('en-')
                    );
                }
                
                // Final fallback: use the first available voice
                if (!britishVoice && availableVoices.length > 0) {
                    britishVoice = availableVoices[0];
                    console.warn('⚠️ Using first available voice as final fallback for British accent');
                }
            }
            
            // Set the selected voice
            if (britishVoice) {
                utterance.voice = britishVoice;
                console.log(`🇬🇧 Selected British voice: ${britishVoice.name} (Local: ${britishVoice.localService})`);
            } else {
                console.error('❌ No British voice found!');
                return;
            }
        } else {
            let americanVoice = null;
            
            if (isOnline && canAccessOnlineVoices) {
                // Try to find Google US Female voice first
                americanVoice = availableVoices.find(voice => 
                    !voice.localService && 
                    voice.name.includes('Google') && 
                    voice.name.includes('US') && 
                    voice.name.includes('Female')
                );
                
                // If no Google US Female, try any Google US voice
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        !voice.localService && 
                        voice.name.includes('Google') && 
                        voice.name.includes('US')
                    );
                }
                
                // If no Google US voice, try any online American voice
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        !voice.localService && (
                            voice.lang.includes('en-US') || 
                            voice.name.includes('American') ||
                            voice.name.includes('US')
                        )
                    );
                }
                
                // If no online American voice, try any online English voice
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        !voice.localService && 
                        voice.lang.includes('en-')
                    );
                }
                
                // If no online voice, fallback to local voices
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        voice.localService && (
                            voice.lang.includes('en-US') || 
                            voice.name.includes('American') ||
                            voice.name.includes('US')
                        )
                    );
                }
                
                // Last resort: any local English voice
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        voice.localService && 
                        voice.lang.includes('en-')
                    );
                }
            } else {
                // OFFLINE MODE: Only use local voices
                americanVoice = availableVoices.find(voice => 
                    voice.localService && (
                        voice.lang.includes('en-US') || 
                        voice.name.includes('American') ||
                        voice.name.includes('US')
                    )
                );
                
                // If no local American voice, try any local English voice
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        voice.localService && 
                        voice.lang.includes('en-')
                    );
                }
                
                // If still no voice, use ANY available voice (even if not local)
                if (!americanVoice) {
                    americanVoice = availableVoices.find(voice => 
                        voice.lang.includes('en-')
                    );
                }
                
                // Final fallback: use the first available voice
                if (!americanVoice && availableVoices.length > 0) {
                    americanVoice = availableVoices[0];
                    console.warn('⚠️ Using first available voice as final fallback for American accent');
                }
            }
            
            // Set the selected voice
            if (americanVoice) {
                utterance.voice = americanVoice;
                console.log('🇺🇸 Selected American voice:', americanVoice.name, 'Lang:', americanVoice.lang, 'Local:', americanVoice.localService);
            } else {
                console.error('❌ No American voice found!');
                return;
            }
        }
        
        // Speak the word
        speechSynthesis.speak(utterance);
        
        console.log('Started speaking:', word, 'with accent:', accent);
        
    } catch (error) {
        console.error('Error in speakWord:', error);
    }
}

// Event handlers for pronunciation buttons
function setupPronunciationButtons() {
    const speakAmericanBtn = document.getElementById('speakAmerican');
    const speakBritishBtn = document.getElementById('speakBritish');
    
    if (speakAmericanBtn) {
        speakAmericanBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card flip
            const currentCard = getCurrentCard();
            if (currentCard && currentCard.word) {
                console.log('🇺🇸 American pronunciation requested for:', currentCard.word);
                console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
                speakWord(currentCard.word, 'american');
            }
        });
    }
    
    if (speakBritishBtn) {
        speakBritishBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card flip
            const currentCard = getCurrentCard();
            if (currentCard && currentCard.word) {
                console.log('🇬🇧 British pronunciation requested for:', currentCard.word);
                console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
                speakWord(currentCard.word, 'british');
            }
        });
    }
}

// Update pronunciation button states
function updatePronunciationButtons() {
    const speakAmericanBtn = document.getElementById('speakAmerican');
    const speakBritishBtn = document.getElementById('speakBritish');
    
    const hasCards = flashcards.length > 0;
    
    if (speakAmericanBtn) {
        speakAmericanBtn.disabled = !hasCards;
    }
    
    if (speakBritishBtn) {
        speakBritishBtn.disabled = !hasCards;
    }
}

// Initialize online/offline detection
function initOnlineDetection() {
    // Set initial online status
    isOnline = navigator.onLine;
    console.log('Initial online status:', isOnline ? 'ONLINE' : 'OFFLINE');
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
        isOnline = true;
        console.log('🟢 Connection restored - ONLINE mode');
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        canAccessOnlineVoices = false;
        console.log('🔴 Connection lost - OFFLINE mode');
    });
}

// Test if we can actually access online voices
function testOnlineVoiceAccess() {
    const browserInfo = detectBrowser();
    const speechSupport = checkSpeechSupport();
    
    console.log('🌐 BROWSER COMPATIBILITY CHECK:');
    console.log(`Browser: ${browserInfo.browser} ${browserInfo.version}`);
    console.log('Speech API Support:', speechSupport);
    
    if (!isOnline) {
        canAccessOnlineVoices = false;
        console.log('📱 OFFLINE - Cannot access online voices');
        console.log('💡 Will use local voices only');
        return;
    }
    
    // Check if we have any non-local voices available
    const onlineVoices = availableVoices.filter(voice => !voice.localService);
    const localVoices = availableVoices.filter(voice => voice.localService);
    
    canAccessOnlineVoices = onlineVoices.length > 0;
    
    console.log(`🌐 ONLINE VOICE TEST: ${canAccessOnlineVoices ? 'CAN ACCESS' : 'CANNOT ACCESS'} online voices`);
    console.log(`Found ${onlineVoices.length} online voices out of ${availableVoices.length} total voices`);
    console.log(`Local voices: ${localVoices.length}, Online voices: ${onlineVoices.length}`);
    
    // Browser-specific recommendations
    console.log('📋 BROWSER-SPECIFIC NOTES:');
    switch (browserInfo.browser) {
        case 'Chrome':
            console.log('✅ Chrome typically has good online voice support');
            console.log('💡 Chrome may require user interaction to load online voices');
            break;
        case 'Firefox':
            console.log('⚠️ Firefox may have limited online voice support');
            console.log('💡 Firefox often relies more on local voices');
            break;
        case 'Safari':
            console.log('⚠️ Safari may have restricted online voice access');
            console.log('💡 Safari often requires HTTPS for online voices');
            break;
        case 'Edge':
            console.log('✅ Edge typically has good online voice support');
            console.log('💡 Edge behavior is similar to Chrome');
            break;
        default:
            console.log('❓ Unknown browser - voice support may vary');
    }
    
    if (onlineVoices.length > 0) {
        console.log('✅ Available online voices:');
        onlineVoices.forEach(voice => {
            console.log(`  - ${voice.name} (${voice.lang}) - Local: ${voice.localService}`);
        });
    } else {
        console.log('❌ No online voices available');
        console.log('💡 This browser may only support local voices');
        canAccessOnlineVoices = false;
    }
    
    // Log local voices for reference
    if (localVoices.length > 0) {
        console.log('📱 Available local voices:');
        localVoices.forEach(voice => {
            console.log(`  - ${voice.name} (${voice.lang})`);
        });
    } else {
        console.log('⚠️ WARNING: No local voices found! This may cause issues in offline mode.');
    }
}

// Browser detection and compatibility
function detectBrowser() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
        version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
        version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
        version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
        version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Opera')) {
        browser = 'Opera';
        version = userAgent.match(/Opera\/(\d+)/)?.[1] || 'Unknown';
    }
    
    return { browser, version };
}

// Check Web Speech API support
function checkSpeechSupport() {
    const support = {
        speechSynthesis: 'speechSynthesis' in window,
        speechSynthesisUtterance: 'SpeechSynthesisUtterance' in window,
        getVoices: 'getVoices' in speechSynthesis,
        onvoiceschanged: 'onvoiceschanged' in speechSynthesis
    };
    
    return support;
}

// Manual voice status check function
function checkVoiceStatus() {
    const browserInfo = detectBrowser();
    const speechSupport = checkSpeechSupport();
    
    console.log('🔍 MANUAL VOICE STATUS CHECK');
    console.log('============================');
    console.log(`Browser: ${browserInfo.browser} ${browserInfo.version}`);
    console.log('Online Status:', isOnline ? '🟢 ONLINE' : '🔴 OFFLINE');
    console.log('Can Access Online Voices:', canAccessOnlineVoices ? '✅ YES' : '❌ NO');
    console.log('Speech API Support:', speechSupport);
    console.log('Total Available Voices:', availableVoices.length);
    
    const onlineVoices = availableVoices.filter(voice => !voice.localService);
    const localVoices = availableVoices.filter(voice => voice.localService);
    
    console.log(`Online Voices: ${onlineVoices.length}`);
    console.log(`Local Voices: ${localVoices.length}`);
    
    if (onlineVoices.length > 0) {
        console.log('🌐 Online Voices:');
        onlineVoices.forEach((voice, index) => {
            console.log(`  ${index + 1}. ${voice.name} (${voice.lang})`);
        });
    }
    
    if (localVoices.length > 0) {
        console.log('📱 Local Voices:');
        localVoices.forEach((voice, index) => {
            console.log(`  ${index + 1}. ${voice.name} (${voice.lang})`);
        });
    }
    
    // Test voice selection
    console.log('\n🎤 VOICE SELECTION TEST:');
    
    // Test British voice selection
    let britishVoice = null;
    if (isOnline && canAccessOnlineVoices) {
        britishVoice = availableVoices.find(voice => 
            !voice.localService && 
            voice.name.includes('Google') && 
            voice.name.includes('UK') && 
            voice.name.includes('Female')
        );
    }
    
    if (!britishVoice) {
        britishVoice = availableVoices.find(voice => 
            voice.localService && (
                voice.lang.includes('en-GB') || 
                voice.name.includes('British') ||
                voice.name.includes('UK')
            )
        );
    }
    
    console.log(`British Voice Selected: ${britishVoice ? britishVoice.name : 'None found'}`);
    
    // Test American voice selection
    let americanVoice = null;
    if (isOnline && canAccessOnlineVoices) {
        americanVoice = availableVoices.find(voice => 
            !voice.localService && 
            voice.name.includes('Google') && 
            voice.name.includes('US') && 
            voice.name.includes('Female')
        );
    }
    
    if (!americanVoice) {
        americanVoice = availableVoices.find(voice => 
            voice.localService && (
                voice.lang.includes('en-US') || 
                voice.name.includes('American') ||
                voice.name.includes('US')
            )
        );
    }
    
    console.log(`American Voice Selected: ${americanVoice ? americanVoice.name : 'None found'}`);
    
    console.log('============================');
}

// Make checkVoiceStatus available globally for debugging
window.checkVoiceStatus = checkVoiceStatus;

// Force reload voices and test them
function forceReloadVoices() {
    console.log('🔄 Force reloading voices...');
    
    // Cancel any current speech
    speechSynthesis.cancel();
    
    // Clear current voices
    availableVoices.length = 0;
    
    // Reload voices
    if (speechSynthesis.onvoiceschanged !== null) {
        speechSynthesis.onvoiceschanged();
    }
    
    // Wait a bit and then test
    setTimeout(() => {
        console.log('✅ Voices reloaded. Testing...');
        testOnlineVoiceAccess();
        checkVoiceStatus();
    }, 1000);
}

// Make forceReloadVoices available globally for debugging
window.forceReloadVoices = forceReloadVoices;

// Test if speech synthesis is working at all
function testSpeechSynthesis() {
    console.log('🎤 Testing basic speech synthesis...');
    
    if (!speechSynthesis) {
        console.error('❌ Speech synthesis not supported');
        return false;
    }
    
    const testUtterance = new SpeechSynthesisUtterance('Test');
    testUtterance.volume = 0.5;
    testUtterance.rate = 0.8;
    
    testUtterance.onstart = () => {
        console.log('✅ Speech synthesis started');
    };
    
    testUtterance.onend = () => {
        console.log('✅ Speech synthesis completed');
    };
    
    testUtterance.onerror = (event) => {
        console.error('❌ Speech synthesis error:', event.error);
    };
    
    speechSynthesis.speak(testUtterance);
    return true;
}

// Make testSpeechSynthesis available globally for debugging
window.testSpeechSynthesis = testSpeechSynthesis;


