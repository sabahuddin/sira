// Quiz Engine with Instant Feedback

let quizState = {
    quizId: null,
    quizData: null,
    questions: [],
    currentQuestion: 0,
    answers: [],
    results: [], // Store if each answer was correct
    startTime: null,
    timeLimit: 300, // 5 minutes
    timerInterval: null,
    answered: false // Track if current question is answered
};

// Initialize quiz
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    if (!checkAuth()) return;
    
    // Get quiz ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz');
    
    if (!quizId) {
        alert('Greška: Kviz nije pronađen!');
        window.location.href = 'index.html';
        return;
    }
    
    // Load quiz
    await loadQuiz(quizId);
});

// Load quiz data
async function loadQuiz(quizId) {
    try {
        const response = await fetch(`data/kvizovi/${quizId}.json`);
        const data = await response.json();
        
        quizState.quizId = quizId;
        
        // Handle both array and object formats
        const questions = Array.isArray(data) ? data : (data.questions || []);
        quizState.quizData = { questions: questions };
        
        // Select 20 random questions
        quizState.questions = selectRandomQuestions(questions, 20);
        quizState.answers = new Array(20).fill(null);
        quizState.results = new Array(20).fill(null);
        quizState.startTime = Date.now();
        
        // Update UI
        const quizTitle = data.title || `Kviz ${quizId.replace('kviz', '')}`;
        document.getElementById('quizTitle').textContent = quizTitle;
        
        // Start timer
        startTimer();
        
        // Show first question
        showQuestion(0);
        
        // Setup navigation
        setupNavigation();
        
    } catch (error) {
        console.error('Error loading quiz:', error);
        alert('Greška pri učitavanju kviza!');
        window.location.href = 'index.html';
    }
}

// Select random questions
function selectRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, questions.length));
}

// Show question
function showQuestion(index) {
    const question = quizState.questions[index];
    quizState.currentQuestion = index;
    quizState.answered = quizState.answers[index] !== null;
    
    // Get user language
    const userLang = getUserLanguage();
    
    // Get question text in user's language
    const questionText = question.question[userLang] || question.question.bs || question.question;
    
    // Update counter
    const questionLabel = userLang === 'de' ? 'Frage' : 'Pitanje';
    document.getElementById('questionCounter').textContent = `${questionLabel} ${index + 1}/20`;
    
    // Update progress
    const progress = ((index + 1) / 20) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    
    // Update question text
    document.getElementById('questionText').textContent = questionText;
    
    // Hide feedback initially
    hideFeedback();
    
    // Update options based on question type
    const optionsContainer = document.getElementById('questionOptions');
    optionsContainer.innerHTML = '';
    
    // Handle different question type formats
    const questionType = question.type || question.question_type;
    
    if (questionType === 'true_false') {
        renderTrueFalse(optionsContainer, question, index, userLang);
    } else if (questionType === 'single_choice' || questionType === 'multiple_choice') {
        renderMultipleChoice(optionsContainer, question, index, userLang);
    } else if (questionType === 'fill_blank') {
        renderFillBlank(optionsContainer, question, index, userLang);
    } else if (questionType === 'ordering' || questionType === 'order') {
        // Check if we have options
        const options = question.options && question.options[userLang];
        if (!options || options.length < 2) {
            optionsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Ovo pitanje ima grešku u strukturi. Prelazite na sljedece pitanje.</p>';
            setTimeout(() => {
                if (index < 19) {
                    showQuestion(index + 1);
                }
            }, 2000);
        } else {
            renderOrderQuestion(optionsContainer, question, index, userLang);
        }
    } else if (questionType === 'match_pairs') {
        renderMatchPairs(optionsContainer, question, index, userLang);
    } else {
        optionsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Nepoznat tip pitanja. Prelazite na sljedece pitanje.</p>';
        setTimeout(() => {
            if (index < 19) {
                showQuestion(index + 1);
            }
        }, 2000);
    }
    
    // Update navigation buttons
    const prevBtnEl = document.getElementById('prevBtn');
    if (prevBtnEl) {
        // Set previous button label based on language
        const prevText = userLang === 'de' ? '← Zurück' : '← Prethodno';
        prevBtnEl.textContent = prevText;
        prevBtnEl.disabled = index === 0;
    }
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        const nextText = userLang === 'de' ? 'Weiter →' : 'Sljedeće →';
        const finishText = userLang === 'de' ? 'Quiz beenden →' : 'Završi kviz →';
        nextBtn.textContent = index === 19 ? finishText : nextText;
    }
    
    // Show or hide the next button based on whether the question is answered.
    // On unanswered questions the button is hidden entirely instead of simply
    // disabled. This prevents confusing labels such as “Završi kviz” from
    // appearing before the user has made a selection, especially on mobile.
    if (quizState.answered) {
        nextBtn.style.display = 'flex';
        nextBtn.disabled = false;
        // Show feedback only when answered
        showFeedback(question, index);
    } else {
        nextBtn.style.display = 'none';
        nextBtn.disabled = true;
        // Ensure feedback panel is hidden if navigating back to unanswered questions
        hideFeedback();
    }
}

// Render True/False question
function renderTrueFalse(container, question, index, userLang) {
    const savedAnswer = quizState.answers[index];
    const isAnswered = savedAnswer !== null;
    
    const trueText = userLang === 'de' ? 'Richtig' : 'Tačno';
    const falseText = userLang === 'de' ? 'Falsch' : 'Netačno';
    
    container.className = 'true-false-options';
    container.innerHTML = `
        <button class="option-btn tf-option ${savedAnswer === 'true' || savedAnswer === true ? 'selected' : ''}" 
                data-value="true" ${isAnswered ? 'disabled' : ''}>
            <span class="option-letter">✓</span>
            <span class="option-text">${trueText}</span>
        </button>
        <button class="option-btn tf-option ${savedAnswer === 'false' || savedAnswer === false ? 'selected' : ''}" 
                data-value="false" ${isAnswered ? 'disabled' : ''}>
            <span class="option-letter">✗</span>
            <span class="option-text">${falseText}</span>
        </button>
    `;
    
    if (!isAnswered) {
        const btns = container.querySelectorAll('.option-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => handleAnswer(btn.getAttribute('data-value'), question, index));
        });
    }
}

// Render Multiple Choice question
function renderMultipleChoice(container, question, index, userLang) {
    const savedAnswer = quizState.answers[index];
    const isAnswered = savedAnswer !== null;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    container.className = 'multiple-choice-options';
    
    // Get options in user's language
    const options = question.options[userLang] || question.options.bs || [];
    
    options.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn mc-option';
        if (savedAnswer == i) btn.classList.add('selected');
        btn.setAttribute('data-value', i);
        
        // Create letter circle and text
        btn.innerHTML = `
            <span class="option-letter">${letters[i]}</span>
            <span class="option-text">${option}</span>
        `;
        
        btn.disabled = isAnswered;
        
        if (!isAnswered) {
            btn.addEventListener('click', () => handleAnswer(i, question, index));
        }
        
        container.appendChild(btn);
    });
}

// Render Fill Blank question
function renderFillBlank(container, question, index) {
    const savedAnswer = quizState.answers[index];
    const isAnswered = savedAnswer !== null;
    
    container.innerHTML = `
        <div class="fill-blank-container">
            <input type="text" class="fill-input" id="fillInput" 
                   placeholder="Unesite odgovor..." 
                   value="${savedAnswer || ''}"
                   ${isAnswered ? 'disabled' : ''}>
            <button class="btn-submit" id="submitFillBtn" ${isAnswered ? 'disabled' : ''}>
                Potvrdi
            </button>
        </div>
        <p class="fill-hint">Napomena: Velika i mala slova se ne razlikuju</p>
    `;
    
    if (!isAnswered) {
        document.getElementById('submitFillBtn').addEventListener('click', () => {
            const input = document.getElementById('fillInput');
            const answer = input.value.trim();
            if (answer) {
                handleAnswer(answer, question, index);
            } else {
                alert('Molimo unesite odgovor!');
            }
        });
        
        // Allow Enter key
        document.getElementById('fillInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('submitFillBtn').click();
            }
        });
    }
}

// Render Order question (drag & drop)
function renderOrderQuestion(container, question, index, userLang) {
    const savedAnswer = quizState.answers[index];
    const isAnswered = savedAnswer !== null;
    
    // Get items in user's language
    const sourceItems = question.options[userLang] || question.options.bs || [];
    let items = savedAnswer ? savedAnswer : [...sourceItems].sort(() => Math.random() - 0.5);
    
    container.innerHTML = `
        <div class="order-container" id="orderContainer">
            <p class="order-instruction">Prevucite stavke ili koristite strelice da ih poredate:</p>
            <div class="order-items" id="orderItems"></div>
            <button class="btn-submit" id="submitOrderBtn" ${isAnswered ? 'disabled' : ''}>
                Potvrdi redoslijed
            </button>
        </div>
    `;
    
    const itemsContainer = document.getElementById('orderItems');
    items.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'order-item';
        // For ordering questions, allow drag on desktop but provide arrow controls for mobile
        div.draggable = !isAnswered;
        div.dataset.item = item;
        div.dataset.index = i + 1;
        // Build inner HTML with text and arrow controls
        div.innerHTML = `
            <span class="order-text">${item}</span>
            <span class="order-arrows">
                <button type="button" class="order-up" aria-label="Move up">↑</button>
                <button type="button" class="order-down" aria-label="Move down">↓</button>
            </span>
        `;

        if (!isAnswered) {
            // Drag and drop handlers for desktop
            div.addEventListener('dragstart', handleDragStart);
            div.addEventListener('dragover', handleDragOver);
            div.addEventListener('drop', handleDrop);
            div.addEventListener('dragend', handleDragEnd);
            // Click handlers for arrow buttons for both desktop and mobile
            const upBtn = div.querySelector('.order-up');
            const downBtn = div.querySelector('.order-down');
            upBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                moveOrderItemUp(div);
            });
            downBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                moveOrderItemDown(div);
            });
        } else {
            div.style.opacity = '0.6';
            div.style.pointerEvents = 'none';
        }

        itemsContainer.appendChild(div);
    });
    
    if (!isAnswered) {
        document.getElementById('submitOrderBtn').addEventListener('click', () => {
            const orderedItems = Array.from(document.querySelectorAll('.order-item'))
                .map(el => el.dataset.item);
            handleAnswer(orderedItems, question, index);
        });
    }
}

// Render Match Pairs question
function renderMatchPairs(container, question, index) {
    const savedAnswer = quizState.answers[index];
    const isAnswered = savedAnswer !== null;
    
    // Shuffle right column for display
    const leftItems = question.pairs.map(pair => pair[0]);
    const rightItems = [...question.pairs.map(pair => pair[1])].sort(() => Math.random() - 0.5);
    
    let html = '<div class="match-pairs-container">';
    html += '<p class="match-instruction">Spojite nadimke sa njihovim značenjem:</p>';
    html += '<div class="match-grid">';
    
    // Left column (terms)
    html += '<div class="match-column match-left">';
    leftItems.forEach((item, i) => {
        html += `<div class="match-item" data-index="${i}">${item}</div>`;
    });
    html += '</div>';
    
    // Right column (definitions with select)
    html += '<div class="match-column match-right">';
    leftItems.forEach((_, i) => {
        const savedValue = savedAnswer ? savedAnswer[i] : '';
        html += '<select class="match-select" data-index="' + i + '" ' + (isAnswered ? 'disabled' : '') + '>';
        html += '<option value="">Izaberite...</option>';
        rightItems.forEach(item => {
            html += '<option value="' + item + '" ' + (savedValue === item ? 'selected' : '') + '>' + item + '</option>';
        });
        html += '</select>';
    });
    html += '</div>';
    
    html += '</div>'; // match-grid
    html += '<button class="btn-submit" id="submitMatchBtn" ' + (isAnswered ? 'disabled' : '') + '>Potvrdi</button>';
    html += '</div>'; // match-pairs-container
    
    container.innerHTML = html;
    
    if (!isAnswered) {
        document.getElementById('submitMatchBtn').addEventListener('click', () => {
            const selects = document.querySelectorAll('.match-select');
            const userAnswer = Array.from(selects).map(select => select.value);
            handleAnswer(userAnswer, question, index);
        });
    }
}

// Drag and drop handlers
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    
    if (draggedElement !== this) {
        const allItems = Array.from(this.parentNode.children);
        const draggedIndex = allItems.indexOf(draggedElement);
        const targetIndex = allItems.indexOf(this);
        
        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedElement, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedElement, this);
        }
        
        // Update numbers
        Array.from(this.parentNode.children).forEach((item, i) => {
            const text = item.dataset.item;
            item.textContent = `${i + 1}. ${text}`;
        });
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.order-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

// Handle answer submission
function handleAnswer(userAnswer, questionData, index) {
    // Save answer
    quizState.answers[index] = userAnswer;
    quizState.answered = true;
    
    // Get original question object from state
    const originalQuestion = quizState.questions[index];
    
    // Check if correct
    const isCorrect = checkAnswer(userAnswer, originalQuestion, questionData);
    quizState.results[index] = isCorrect;
    
    // Disable all inputs
    disableCurrentQuestion();
    
    // Show feedback
    showFeedback(originalQuestion, index);

    // Highlight selected and correct options
    highlightOptions(originalQuestion, userAnswer);
    
    // Show next button
    document.getElementById('nextBtn').style.display = 'flex';
}

// Check if answer is correct
function checkAnswer(userAnswer, question, questionData) {
    // Get user language
    const userLang = getUserLanguage();
    
    // Get question type
    const questionType = question.type || question.question_type;
    
    if (questionType === 'true_false') {
        const correctAnswer = question.correct;
        return (userAnswer === 'true' && correctAnswer === true) ||
               (userAnswer === 'false' && correctAnswer === false) ||
               (userAnswer === true && correctAnswer === true) ||
               (userAnswer === false && correctAnswer === false);
    } else if (questionType === 'single_choice' || questionType === 'multiple_choice') {
        // Get correct answers in user's language
        const correctAnswers = question.correct[userLang] || question.correct.bs;
        const options = question.options[userLang] || question.options.bs;
        
        if (Array.isArray(correctAnswers)) {
            // Multiple choice: check if user selected option text matches correct answer text
            const selectedOption = options[parseInt(userAnswer)];
            return correctAnswers.includes(selectedOption);
        } else {
            // Single choice: check if selected option matches correct answer
            const selectedOption = options[parseInt(userAnswer)];
            return selectedOption === correctAnswers;
        }
    } else if (questionType === 'fill_blank') {
        const correctAnswers = question.correct[userLang] || question.correct.bs;
        if (Array.isArray(correctAnswers)) {
            return correctAnswers.some(ans => 
                userAnswer.toLowerCase().trim() === ans.toLowerCase().trim()
            );
        }
        return userAnswer.toLowerCase().trim() === correctAnswers.toLowerCase().trim();
    } else if (questionType === 'ordering' || questionType === 'order') {
        const correctOrder = question.correct[userLang] || question.correct.bs;
        return JSON.stringify(userAnswer) === JSON.stringify(correctOrder);
    } else if (questionType === 'match_pairs') {
        const correctAnswers = question.pairs.map(pair => pair[1]);
        return JSON.stringify(userAnswer) === JSON.stringify(correctAnswers);
    }
    return false;
}

// Disable current question inputs
function disableCurrentQuestion() {
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(btn => btn.disabled = true);
    
    const fillInput = document.getElementById('fillInput');
    if (fillInput) fillInput.disabled = true;
    
    const submitBtns = document.querySelectorAll('.btn-submit');
    submitBtns.forEach(btn => btn.disabled = true);
    
    const orderItems = document.querySelectorAll('.order-item');
    orderItems.forEach(item => item.draggable = false);
    
    const matchSelects = document.querySelectorAll('.match-select');
    matchSelects.forEach(select => select.disabled = true);
}

// Show feedback
function showFeedback(question, index) {
    // Determine correctness
    const isCorrect = quizState.results[index];
    // Get references to modal elements
    const modal = document.getElementById('feedbackModal');
    const modalContent = document.getElementById('feedbackModalContent');
    const feedbackBody = document.getElementById('feedbackBody');
    const prevBtn = document.getElementById('feedbackPrevBtn');
    const nextBtn = document.getElementById('feedbackNextBtn');
    const closeBtn = document.getElementById('feedbackCloseBtn');

    // Guard: ensure modal elements exist
    if (!modal || !modalContent || !feedbackBody || !prevBtn || !nextBtn || !closeBtn) {
        return;
    }

    // Clear previous classes
    modalContent.classList.remove('correct', 'wrong');

    // Get user language
    const userLang = getUserLanguage();

    // Determine question type
    const questionType = question.type || question.question_type;

    // Get explanation in user's language
    const explanation = (question.explanation && (question.explanation[userLang] || question.explanation.bs)) || '';

    // Translation strings
    const correctText = userLang === 'de' ? 'Richtige Antwort!' : 'Tačan odgovor!';
    const incorrectText = userLang === 'de' ? 'Falsche Antwort!' : 'Netačan odgovor!';
    const correctAnswerLabel = userLang === 'de' ? 'Richtige Antwort:' : 'Tačan odgovor:';
    const excellentText = userLang === 'de' ? 'Ausgezeichnet! Weiter so.' : 'Odlično! Nastavite tako.';

    let bodyHTML = '';

    if (isCorrect) {
        modalContent.classList.add('correct');
        bodyHTML = `
            <div class="feedback-icon">✓</div>
            <div class="feedback-text">
                <h3>${correctText}</h3>
                <p>${explanation || excellentText}</p>
            </div>
        `;
    } else {
        modalContent.classList.add('wrong');
        let correctAnswerText = '';
        if (questionType === 'true_false') {
            const trueText = userLang === 'de' ? 'Richtig' : 'Tačno';
            const falseText = userLang === 'de' ? 'Falsch' : 'Netačno';
            correctAnswerText = question.correct ? trueText : falseText;
        } else if (questionType === 'single_choice' || questionType === 'multiple_choice') {
            const correctAnswers = question.correct[userLang] || question.correct.bs;
            if (Array.isArray(correctAnswers)) {
                correctAnswerText = correctAnswers.join(', ');
            } else {
                correctAnswerText = correctAnswers;
            }
        } else if (questionType === 'fill_blank') {
            const correctAnswers = question.correct[userLang] || question.correct.bs;
            correctAnswerText = Array.isArray(correctAnswers) ? correctAnswers.join(', ') : correctAnswers;
        } else if (questionType === 'ordering' || questionType === 'order') {
            const correctOrder = question.correct[userLang] || question.correct.bs;
            correctAnswerText = correctOrder.map((item, i) => `${i + 1}. ${item}`).join('<br>');
        } else if (questionType === 'match_pairs') {
            correctAnswerText = question.pairs.map(pair => `${pair[0]} - ${pair[1]}`).join('<br>');
        }
        bodyHTML = `
            <div class="feedback-icon">✗</div>
            <div class="feedback-text">
                <h3>${incorrectText}</h3>
                <p><strong>${correctAnswerLabel}</strong> ${correctAnswerText}</p>
                <p>${explanation || ''}</p>
            </div>
        `;
    }
    // Insert body HTML
    feedbackBody.innerHTML = bodyHTML;

    // Set navigation button labels based on language and question index
    const prevLabel = userLang === 'de' ? '← Zurück' : '← Prethodno';
    const nextLabel = userLang === 'de' ? 'Weiter →' : 'Sljedeće →';
    const finishLabel = userLang === 'de' ? 'Quiz beenden →' : 'Završi kviz →';

    prevBtn.textContent = prevLabel;
    nextBtn.textContent = (index >= quizState.questions.length - 1) ? finishLabel : nextLabel;

    // Disable prev button if at the first question
    prevBtn.disabled = (index === 0);

    // Remove previous listeners to avoid stacking
    prevBtn.onclick = null;
    nextBtn.onclick = null;
    closeBtn.onclick = null;

    // Prev button handler
    prevBtn.onclick = () => {
        modal.classList.remove('show');
        if (quizState.currentQuestion > 0) {
            showQuestion(quizState.currentQuestion - 1);
        }
    };

    // Next button handler
    nextBtn.onclick = () => {
        modal.classList.remove('show');
        if (quizState.currentQuestion < quizState.questions.length - 1) {
            showQuestion(quizState.currentQuestion + 1);
        } else {
            finishQuiz();
        }
    };

    // Close button handler (X)
    closeBtn.onclick = () => {
        modal.classList.remove('show');
    };

    // Finally show modal
    modal.classList.add('show');
}

// Hide feedback
function hideFeedback() {
    // Hide feedback modal
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.classList.remove('show');
    }
    // Also hide the inline feedback panel if present
    const panel = document.getElementById('feedbackPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

// Setup navigation
function setupNavigation() {
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (quizState.currentQuestion > 0) {
            showQuestion(quizState.currentQuestion - 1);
        }
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        if (quizState.currentQuestion < 19) {
            showQuestion(quizState.currentQuestion + 1);
        } else {
            finishQuiz();
        }
    });
}

// Start timer
function startTimer() {
    quizState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - quizState.startTime) / 1000);
        const remaining = Math.max(0, quizState.timeLimit - elapsed);
        
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        document.getElementById('timer').textContent = `⏱️ ${mins}:${secs.toString().padStart(2, '0')}`;
        
        if (remaining === 0) {
            clearInterval(quizState.timerInterval);
            finishQuiz();
        }
    }, 1000);
}

// Finish quiz
function finishQuiz() {
    clearInterval(quizState.timerInterval);
    
    // Calculate score
    const correct = quizState.results.filter(r => r === true).length;
    const wrong = quizState.results.filter(r => r === false).length;
    const unanswered = quizState.results.filter(r => r === null).length;
    
    const score = Math.round((correct / 20) * 100);
    const points = calculatePoints(score);
    
    // Update user stats
    UserManager.updateUserStats(points, correct, wrong + unanswered);
    UserManager.addQuizToHistory(
        quizState.quizId,
        quizState.quizData.title,
        score,
        points,
        Math.floor((Date.now() - quizState.startTime) / 1000)
    );
    
    // Show results
    showResults(score, correct, wrong + unanswered, points);

    // Save last quiz result to localStorage for results page
    const resultData = {
        quizId: quizState.quizId,
        title: quizState.quizData && quizState.quizData.title ? quizState.quizData.title : `Kviz ${quizState.quizId}`,
        score: score,
        correct: correct,
        wrong: wrong + unanswered,
        points: points,
        time: Math.floor((Date.now() - quizState.startTime) / 1000),
        completedAt: new Date().toISOString()
    };
    try {
        localStorage.setItem('lastQuizResult', JSON.stringify(resultData));
        // Open results page in a new tab. If pop-ups are blocked the user can still view via manual navigation.
        window.open('results.html', '_blank');
    } catch (e) {
        console.error('Error saving quiz result or opening results page:', e);
    }
}

// Calculate points
function calculatePoints(score) {
    return Math.round(score * 10); // 0-100% = 0-1000 points
}

// Show results
function showResults(score, correct, wrong, points) {
    // Update score circle (percentage)
    const scoreValue = document.querySelector('.score-circle .score-value');
    const scoreLabel = document.querySelector('.score-circle .score-label');
    if (scoreValue) scoreValue.textContent = `${score}%`;
    if (scoreLabel) scoreLabel.textContent = '';
    
    // Update points circle
    const pointsValue = document.querySelector('.points-circle .score-value');
    const pointsLabel = document.querySelector('.points-circle .score-label');
    if (pointsValue) pointsValue.textContent = points;
    if (pointsLabel) {
        // Use translated label for points
        const lang = typeof getUserLanguage === 'function' ? getUserLanguage() : 'bs';
        const label = lang === 'de' ? 'Punkte' : 'Bodova';
        pointsLabel.textContent = label;
    }
    
    // Update details
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('wrongCount').textContent = wrong;
    // Translate labels for correct/incorrect counts
    const correctLabel = document.querySelector('#correctCount + .stat-label');
    const wrongLabel = document.querySelector('#wrongCount + .stat-label');
    const lang = typeof getUserLanguage === 'function' ? getUserLanguage() : 'bs';
    if (correctLabel) {
        correctLabel.textContent = lang === 'de' ? 'Richtig' : 'Tačno';
    }
    if (wrongLabel) {
        wrongLabel.textContent = lang === 'de' ? 'Falsch' : 'Netačno';
    }
    
    // Show results modal
    const modal = document.getElementById('resultsModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    
    // Confetti if score > 70%
    if (score >= 70) {
        // Trigger confetti animation
        setTimeout(() => {
            document.body.classList.add('confetti-active');
        }, 500);
    }
    
    // Setup retry button
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.onclick = () => {
            window.location.reload();
        };
    }

    // Re-apply translations for result modal
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
}

// Highlight selected and correct options with colored borders and backgrounds
function highlightOptions(question, userAnswer) {
    const userLang = getUserLanguage();
    const questionType = question.type || question.question_type;
    if (questionType === 'true_false') {
        // Determine which value is correct
        const correctVal = (question.correct === true || question.correct === 'true') ? 'true' : 'false';
        const buttons = document.querySelectorAll('.tf-option');
        buttons.forEach(btn => {
            const val = btn.getAttribute('data-value');
            if (val === correctVal) {
                btn.classList.add('option-correct');
            }
            if (String(val) === String(userAnswer) && val !== correctVal) {
                btn.classList.add('option-wrong');
            }
        });
    } else if (questionType === 'single_choice' || questionType === 'multiple_choice') {
        const options = question.options[userLang] || question.options.bs || [];
        let correctAnswers = question.correct[userLang] || question.correct.bs;
        if (!Array.isArray(correctAnswers)) {
            correctAnswers = [correctAnswers];
        }
        const buttons = document.querySelectorAll('.mc-option');
        buttons.forEach((btn, idx) => {
            const optionText = options[idx];
            if (correctAnswers.includes(optionText)) {
                btn.classList.add('option-correct');
            }
            if (String(idx) === String(userAnswer) && !correctAnswers.includes(optionText)) {
                btn.classList.add('option-wrong');
            }
        });
    }
}

/*
 * Override handleAnswer to ensure the "Next" button becomes enabled after answering.
 */

// === Mobile-friendly ordering helpers ===
// These functions enable reorder of list items via arrow buttons on both desktop and mobile.
// They are intentionally globally scoped for use within renderOrderQuestion.
function moveOrderItemUp(itemEl) {
    const prev = itemEl.previousElementSibling;
    if (prev) {
        itemEl.parentNode.insertBefore(itemEl, prev);
    }
}

function moveOrderItemDown(itemEl) {
    const next = itemEl.nextElementSibling;
    if (next) {
        itemEl.parentNode.insertBefore(next, itemEl);
    }
}
(function() {
    if (typeof handleAnswer === 'function') {
        const origHandleAnswer = handleAnswer;
        window.handleAnswer = function(userAnswer, questionData, index) {
            // Call original logic
            origHandleAnswer.apply(this, arguments);
            // Enable next button after answering
            const nextBtn = document.getElementById('nextBtn');
            if (nextBtn) {
                nextBtn.disabled = false;
            }
        };
    }
})();
