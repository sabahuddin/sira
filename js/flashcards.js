// Flashcards System - Bilingual

// State
const flashcardsState = {
    data: null,
    currentQuiz: null,
    currentCardIndex: 0,
    cards: [],
    knownCards: [],
    unknownCards: [],
    isFlipped: false
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    if (!checkAuth()) return;

    await loadFlashcardsData();
    displayQuizCategories();
});

// Load flashcards data
async function loadFlashcardsData() {
    try {
        const response = await fetch('data/flashcards-data.json');
        flashcardsState.data = await response.json();
    } catch (error) {
        console.error('Error loading flashcards:', error);
        alert('Greška pri učitavanju kartica.');
    }
}

// Display quiz categories
function displayQuizCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';

    // Get user language
    const userLang = getUserLanguage();

    // Group flashcards by quiz
    const quizGroups = {};
    flashcardsState.data.flashcards.forEach(card => {
        if (!quizGroups[card.quiz_id]) {
            quizGroups[card.quiz_id] = {
                quiz_id: card.quiz_id,
                title: card.quiz_title,
                cards: []
            };
        }
        quizGroups[card.quiz_id].cards.push(card);
    });

    // Display each quiz as category
    Object.values(quizGroups)
        .sort((a, b) => a.quiz_id - b.quiz_id)
        .forEach(quiz => {
            const card = document.createElement('div');
            card.className = 'category-card';

            const title = quiz.title[userLang] || quiz.title.bs;
            const icons = ['📕', '📘', '📒', '📕', '📓', '📙', '📘', '📒', '📕', '📙'];
            const icon = icons[quiz.quiz_id - 1] || '📚';

            const quizLabel = userLang === 'de' ? 'Quiz' : 'Kviz';
            const cardsLabel = userLang === 'de' ? 'Karten' : 'kartica';

            card.innerHTML = `
                <span class="category-icon">${icon}</span>
                <h3 class="category-name">${quizLabel} ${quiz.quiz_id}: ${title}</h3>
                <p class="category-count">${quiz.cards.length} ${cardsLabel}</p>
            `;

            card.addEventListener('click', () => {
                selectQuiz(quiz);
            });

            grid.appendChild(card);
        });
}

// Helper: quiz display name (title at the top of flashcards view)
function getQuizDisplayName(quiz) {
    const userLang = getUserLanguage();
    const title = quiz.title[userLang] || quiz.title.bs;
    const quizLabel = userLang === 'de' ? 'Quiz' : 'Kviz';
    return `${quizLabel} ${quiz.quiz_id}: ${title}`;
}

// Select quiz
function selectQuiz(quiz) {
    flashcardsState.currentQuiz = quiz;
    flashcardsState.cards = [...quiz.cards].sort(() => Math.random() - 0.5);
    flashcardsState.currentCardIndex = 0;
    flashcardsState.knownCards = [];
    flashcardsState.unknownCards = [];
    flashcardsState.isFlipped = false;

    // Show flashcards view
    document.getElementById('categoriesView').style.display = 'none';
    document.getElementById('flashcardsView').style.display = 'block';

    // Set header title
    const quizNameEl = document.getElementById('currentQuizName');
    if (quizNameEl) {
        quizNameEl.textContent = getQuizDisplayName(quiz);
    }

    // Reset counts display
    updateCounts();

    // Ensure the card area is visible (in case we were in results view)
    document.getElementById('flashcard').style.display = 'block';
    document.getElementById('flashcardActions').style.display = 'flex';
    document.getElementById('flashcardResults').style.display = 'none';

    showCard();
}

// Show current card
function showCard() {
    if (flashcardsState.currentCardIndex >= flashcardsState.cards.length) {
        showResults();
        return;
    }

    const card = flashcardsState.cards[flashcardsState.currentCardIndex];
    const userLang = getUserLanguage();

    // Update progress (text and bar)
    const progress = ((flashcardsState.currentCardIndex + 1) / flashcardsState.cards.length) * 100;
    const progressEl = document.getElementById('flashcardProgress');
    if (progressEl) {
        progressEl.textContent = `${flashcardsState.currentCardIndex + 1} / ${flashcardsState.cards.length}`;
    }
    const barEl = document.getElementById('flashcardProgressBar');
    if (barEl) {
        barEl.style.width = `${progress}%`;
    }

    // Update counts on every card render (in case user navigates)
    updateCounts();

    // Get question and explanation in user's language
    const question = card.question[userLang] || card.question.bs;
    const explanation = card.explanation[userLang] || card.explanation.bs;

    // Display card
    const cardEl = document.getElementById('flashcard');
    cardEl.className = 'flashcard';
    flashcardsState.isFlipped = false;

    cardEl.innerHTML = `
        <div class="flashcard-front">
            <div class="flashcard-label">${userLang === 'de' ? 'Frage' : 'Pitanje'}</div>
            <div class="flashcard-content">${question}</div>
            <div class="flashcard-hint">${userLang === 'de' ? 'Klicken Sie, um die Antwort zu sehen' : 'Kliknite da vidite objašnjenje'}</div>
        </div>
        <div class="flashcard-back">
            <div class="flashcard-label">${userLang === 'de' ? 'Erklärung' : 'Objašnjenje'}</div>
            <div class="flashcard-content">${explanation}</div>
        </div>
    `;

    // Add flip event (replace old listener by rebuilding HTML)
    cardEl.addEventListener('click', flipCard);

    // Update buttons
    updateButtons();
}

// Flip card
function flipCard() {
    const cardEl = document.getElementById('flashcard');
    cardEl.classList.toggle('flipped');
    flashcardsState.isFlipped = !flashcardsState.isFlipped;
    updateButtons();
}

// Update buttons
function updateButtons() {
    const knownBtn = document.getElementById('knownBtn');
    const unknownBtn = document.getElementById('unknownBtn');
    const userLang = getUserLanguage();

    if (flashcardsState.isFlipped) {
        knownBtn.style.display = 'flex';
        unknownBtn.style.display = 'flex';
        knownBtn.textContent = userLang === 'de' ? '✓ Ich weiss es' : '✓ Znam';
        unknownBtn.textContent = userLang === 'de' ? '✗ Ich weiss es nicht' : '✗ Ne znam';
    } else {
        knownBtn.style.display = 'none';
        unknownBtn.style.display = 'none';
    }
}

// Update the known/unknown counts display (top header)
function updateCounts() {
    const userLang = getUserLanguage();
    const known = flashcardsState.knownCards.length;
    const unknown = flashcardsState.unknownCards.length;

    const countsEl = document.getElementById('knownUnknownCounts');
    if (!countsEl) return;

    if (userLang === 'de') {
        countsEl.innerHTML = `Bekannt: <strong>${known}</strong> • Unbekannt: <strong>${unknown}</strong>`;
    } else {
        countsEl.innerHTML = `Znam: <strong>${known}</strong> • Ne znam: <strong>${unknown}</strong>`;
    }
}

// Mark as known
function markKnown() {
    const card = flashcardsState.cards[flashcardsState.currentCardIndex];
    flashcardsState.knownCards.push(card);
    updateCounts();
    nextCard();
}

// Mark as unknown
function markUnknown() {
    const card = flashcardsState.cards[flashcardsState.currentCardIndex];
    flashcardsState.unknownCards.push(card);
    updateCounts();

    // Red "flash" on the card when user clicks "Ne znam"
    const cardEl = document.getElementById('flashcard');
    if (cardEl) {
        // Use a class name that your CSS can style (red border/background)
        // If you named it differently in CSS, tell me and I'll align it.
        cardEl.classList.add('unknown-flash');
        setTimeout(() => cardEl.classList.remove('unknown-flash'), 450);
    }

    nextCard();
}

// Next card
function nextCard() {
    flashcardsState.currentCardIndex++;
    showCard();
}

// Show results
function showResults() {
    const userLang = getUserLanguage();
    const resultsEl = document.getElementById('flashcardResults');

    const total = flashcardsState.cards.length;
    const known = flashcardsState.knownCards.length;
    const unknown = flashcardsState.unknownCards.length;
    const percentage = Math.round((known / total) * 100);

    resultsEl.innerHTML = `
        <div class="results-card">
            <h2>${userLang === 'de' ? 'Ergebnisse' : 'Rezultati'}</h2>
            <div class="results-stats">
                <div class="stat-item">
                    <span class="stat-icon">📊</span>
                    <span class="stat-value">${percentage}%</span>
                    <span class="stat-label">${userLang === 'de' ? 'Genauigkeit' : 'Tačnost'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">✓</span>
                    <span class="stat-value">${known}</span>
                    <span class="stat-label">${userLang === 'de' ? 'Bekannt' : 'Znam'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">✗</span>
                    <span class="stat-value">${unknown}</span>
                    <span class="stat-label">${userLang === 'de' ? 'Unbekannt' : 'Ne znam'}</span>
                </div>
            </div>
            <div class="results-actions">
                <button class="btn-primary" onclick="restartFlashcards()">
                    ${userLang === 'de' ? '🔄 Wiederholen' : '🔄 Ponovi'}
                </button>
                <button class="btn-secondary" onclick="backToCategories()">
                    ${userLang === 'de' ? '← Zurück' : '← Nazad'}
                </button>
            </div>
        </div>
    `;

    document.getElementById('flashcard').style.display = 'none';
    document.getElementById('flashcardActions').style.display = 'none';
    resultsEl.style.display = 'block';
}

// Restart flashcards
function restartFlashcards() {
    flashcardsState.cards = [...flashcardsState.currentQuiz.cards].sort(() => Math.random() - 0.5);
    flashcardsState.currentCardIndex = 0;
    flashcardsState.knownCards = [];
    flashcardsState.unknownCards = [];
    flashcardsState.isFlipped = false;

    // Reset counts display
    updateCounts();

    document.getElementById('flashcard').style.display = 'block';
    document.getElementById('flashcardActions').style.display = 'flex';
    document.getElementById('flashcardResults').style.display = 'none';

    showCard();
}

// Back to categories
function backToCategories() {
    document.getElementById('categoriesView').style.display = 'block';
    document.getElementById('flashcardsView').style.display = 'none';
    flashcardsState.currentQuiz = null;
}

// Get user language
function getUserLanguage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.language || 'bs';
}

// Check auth
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Event listeners
document.getElementById('knownBtn')?.addEventListener('click', markKnown);
document.getElementById('unknownBtn')?.addEventListener('click', markUnknown);
