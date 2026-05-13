// Poslanikova sira - Main App JavaScript

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('App.js loaded');
    
    // Initialize app
    initializeApp();
});

function initializeApp() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    
    const authNav = document.getElementById('authNav');
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.querySelector('.logout-btn');
    const statsBtn = document.getElementById('statsBtn');
    const flashcardsBtn = document.getElementById('flashcardsBtn');
    
    if (!currentUser) {
        // Show login/register buttons if not logged in
        if (authNav) authNav.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (statsBtn) statsBtn.style.display = 'none';
        if (flashcardsBtn) flashcardsBtn.style.display = 'none';
        
        // Setup quiz card click handlers to redirect to login
        setupGuestHandlers();
        return;
    }
    
    // Show user info and logout if logged in
    if (authNav) authNav.style.display = 'none';
    if (userInfo) userInfo.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'flex';
    if (statsBtn) statsBtn.style.display = 'flex';
    if (flashcardsBtn) flashcardsBtn.style.display = 'flex';
    
    // Update user info in header
    updateUserInfo();
    
    // Show admin button if user is admin
    const session = JSON.parse(localStorage.getItem('currentUser'));
    if (session && session.role === 'admin') {
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) adminBtn.style.display = 'flex';
    }
    
    // Setup quiz card click handlers
    setupQuizHandlers();
    
    // Setup navigation buttons
    setupNavigation();
    
    // Update statistics
    updateStatistics();
}

function updateUserInfo() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[currentUser];
    
    if (userData) {
        // Update username display
        const usernameElement = document.querySelector('.user-name');
        if (usernameElement) {
            usernameElement.textContent = currentUser;
        }
        
        // Update points display
        const pointsElement = document.querySelector('.user-points');
        if (pointsElement) {
            const totalPoints = userData.totalPoints || 0;
            pointsElement.textContent = `${totalPoints} bodova`;
        }
    }
}

function setupQuizHandlers() {
    // Get all "Započni kviz" buttons
    const quizButtons = document.querySelectorAll('.start-quiz-btn');
    
    quizButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const quizId = this.getAttribute('data-quiz-id');
            if (quizId) {
                console.log('Starting quiz:', quizId);
                startQuiz(quizId);
            }
        });
    });
    
    // Also handle clicks on quiz cards themselves
    const quizCards = document.querySelectorAll('.quiz-card');
    
    quizCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on the button directly
            if (e.target.classList.contains('start-quiz-btn')) {
                return;
            }
            
            const quizId = this.getAttribute('data-quiz');
            if (quizId) {
                console.log('Starting quiz from card:', quizId);
                startQuiz(quizId);
            }
        });
    });
}

function startQuiz(quizId) {
    // Navigate to quiz page with quiz ID
    window.location.href = `quiz.html?quiz=${quizId}`;
}

function setupGuestHandlers() {
    const quizButtons = document.querySelectorAll('.start-quiz-btn');
    quizButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    });
    
    const quizCards = document.querySelectorAll('.quiz-card');
    quizCards.forEach(card => {
        card.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    });
}

function setupNavigation() {
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Da li ste sigurni da želite da se odjavite?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }
    
    // Statistics button
    const statsBtn = document.querySelector('.nav-btn[data-page="stats"]');
    if (statsBtn) {
        statsBtn.addEventListener('click', function() {
            // Show statistics modal or navigate to stats page
            showStatistics();
        });
    }
    
    // Flashcards button
    const flashcardsBtn = document.querySelector('.nav-btn[data-page="flashcards"]');
    if (flashcardsBtn) {
        flashcardsBtn.addEventListener('click', function() {
            window.location.href = 'flashcards.html';
        });
    }
    
    // Admin button
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            showAdminPanel();
        });
    }
    
    // Feedback button
    const feedbackBtn = document.querySelector('.nav-btn[data-page="feedback"]');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', function() {
            window.open('https://help.manus.im', '_blank');
        });
    }
}

function updateStatistics() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[currentUser];
    
    if (userData && userData.quizResults) {
        // Count completed quizzes
        const completedQuizzes = Object.keys(userData.quizResults).length;
        
        const completedElement = document.getElementById('completedQuizzes');
        if (completedElement) {
            completedElement.textContent = completedQuizzes;
        }
    }
}

function showStatistics() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[currentUser];
    
    if (!userData) return;
    
    // Create statistics modal
    const modal = document.createElement('div');
    modal.className = 'stats-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    let statsHTML = `
        <h2 style="margin-bottom: 1.5rem; color: #2a7c6f;">📊 Vaša statistika</h2>
        <div style="margin-bottom: 1rem;">
            <strong>Ukupno bodova:</strong> ${userData.totalPoints || 0}
        </div>
        <div style="margin-bottom: 1.5rem;">
            <strong>Završeno kvizova:</strong> ${Object.keys(userData.quizResults || {}).length}
        </div>
    `;
    
    if (userData.quizResults && Object.keys(userData.quizResults).length > 0) {
        statsHTML += '<h3 style="margin-bottom: 1rem;">Rezultati kvizova:</h3>';
        statsHTML += '<div style="display: grid; gap: 1rem;">';
        
        for (const [quizId, results] of Object.entries(userData.quizResults)) {
            const lastResult = results[results.length - 1];
            const percentage = Math.round((lastResult.score / lastResult.total) * 100);
            
            statsHTML += `
                <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">${quizId}</div>
                    <div style="color: #6c757d;">
                        Rezultat: ${lastResult.score}/${lastResult.total} (${percentage}%)
                    </div>
                    <div style="color: #6c757d; font-size: 0.875rem;">
                        Pokušaja: ${results.length}
                    </div>
                </div>
            `;
        }
        
        statsHTML += '</div>';
    }
    
    statsHTML += `
        <button onclick="this.closest('.stats-modal').remove()" 
                style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #2a7c6f; color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%;">
            Zatvori
        </button>
    `;
    
    modalContent.innerHTML = statsHTML;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

/*
 * Custom overrides for Sira improvements
 * These overrides unify user management with UserManager and provide a richer statistics view.
 */
(function() {
    // Override updateUserInfo to use UserManager
    window.updateUserInfo = function() {
        const session = JSON.parse(localStorage.getItem('currentUser'));
        if (!session) return;
        if (typeof UserManager !== 'undefined' && UserManager.getCurrentUser) {
            const userData = UserManager.getCurrentUser();
            if (userData) {
                const usernameElement = document.querySelector('.user-name');
                if (usernameElement) {
                    usernameElement.textContent = userData.username;
                }
                const pointsElement = document.querySelector('.user-points');
                if (pointsElement) {
                    const totalPoints = userData.totalPoints || 0;
                    const lang = typeof getUserLanguage === 'function' ? getUserLanguage() : 'bs';
                    const pointsLabel = lang === 'de' ? 'punkte' : 'bodova';
                    pointsElement.textContent = `${totalPoints} ${pointsLabel}`;
                }
            }
        }
    };

    // Override updateStatistics to count completed quizzes via UserManager
    window.updateStatistics = function() {
        const session = JSON.parse(localStorage.getItem('currentUser'));
        if (!session) return;
        if (typeof UserManager !== 'undefined' && UserManager.getCurrentUser) {
            const userData = UserManager.getCurrentUser();
            if (userData) {
                const completedQuizzes = Array.isArray(userData.quizHistory) ? userData.quizHistory.length : (userData.quizzesTaken || 0);
                const completedElement = document.getElementById('completedQuizzes');
                if (completedElement) {
                    completedElement.textContent = completedQuizzes;
                }
            }
        }
    };

    // Override showStatistics to generate a dynamic modal with aggregated data
    window.showStatistics = function() {
        if (typeof UserManager === 'undefined' || !UserManager.getCurrentUser) return;
        const userData = UserManager.getCurrentUser();
        if (!userData) return;
        const lang = typeof getUserLanguage === 'function' ? getUserLanguage() : 'bs';
        const labels = {
            title: lang === 'de' ? 'Ihre Statistik' : 'Vaša statistika',
            totalPoints: lang === 'de' ? 'Gesamtpunkte' : 'Ukupno bodova',
            totalCorrect: lang === 'de' ? 'Korrekte Antworten' : 'Tačnih odgovora',
            totalWrong: lang === 'de' ? 'Falsche Antworten' : 'Netačnih odgovora',
            quizzesTaken: lang === 'de' ? 'Beendete kvizovi' : 'Završenih kvizova',
            historyTitle: lang === 'de' ? 'Quizverlauf' : 'Istorija kvizova',
            time: lang === 'de' ? 'Zeit' : 'Vrijeme',
            close: lang === 'de' ? 'Schliessen' : 'Zatvori'
        };
        // Create overlay
        const modal = document.createElement('div');
        modal.className = 'stats-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000;';
        const content = document.createElement('div');
        content.style.cssText = 'background:white; padding:2rem; border-radius:12px; max-width:600px; width:90%; max-height:80vh; overflow-y:auto;';
        let html = '';
        html += `<h2 style="margin-bottom: 1.5rem; color: #2a7c6f;">📊 ${labels.title}</h2>`;
        html += `<div style="margin-bottom: 1rem;"><strong>${labels.totalPoints}:</strong> ${userData.totalPoints || 0}</div>`;
        html += `<div style="margin-bottom: 1rem;"><strong>${labels.quizzesTaken}:</strong> ${Array.isArray(userData.quizHistory) ? userData.quizHistory.length : (userData.quizzesTaken || 0)}</div>`;
        html += `<div style="margin-bottom: 1rem;"><strong>${labels.totalCorrect}:</strong> ${userData.correctAnswers || 0}</div>`;
        html += `<div style="margin-bottom: 1.5rem;"><strong>${labels.totalWrong}:</strong> ${userData.wrongAnswers || 0}</div>`;
        if (userData.quizHistory && userData.quizHistory.length > 0) {
            html += `<h3 style="margin-bottom: 1rem;">${labels.historyTitle}:</h3>`;
            html += '<div style="display: grid; gap: 1rem;">';
            userData.quizHistory.forEach(entry => {
                const percentage = entry.score;
                html += '<div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">';
                html += `<div style="font-weight: 600; margin-bottom: 0.5rem;">${entry.quizTitle || entry.quizId}</div>`;
                html += `<div style="color: #6c757d;">Rezultat: ${percentage}% (${entry.points} bodova)</div>`;
                html += `<div style="color: #6c757d; font-size: 0.875rem;">${labels.time}: ${entry.time}s</div>`;
                html += '</div>';
            });
            html += '</div>';
        }
        html += `<button onclick="this.closest('.stats-modal').remove()" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #2a7c6f; color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%;">${labels.close}</button>`;
        content.innerHTML = html;
        modal.appendChild(content);
        document.body.appendChild(modal);
        // Close on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };

    // Attach statistics button event on DOMContentLoaded to ensure it works even if not bound earlier
    document.addEventListener('DOMContentLoaded', function() {
        let statsBtn = document.querySelector('.nav-btn[data-page="stats"]');
        if (!statsBtn) {
            statsBtn = document.getElementById('statsBtn');
        }
        if (statsBtn) {
            statsBtn.addEventListener('click', function() {
                showStatistics();
            });
        }
    });
})();

function showAdminPanel() {
    const session = JSON.parse(localStorage.getItem('currentUser'));
    if (!session || session.role !== 'admin') return;
    
    if (typeof UserManager === 'undefined' || !UserManager.getAllUsers) return;
    const allUsers = UserManager.getAllUsers();
    
    // Create admin modal
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:white; padding:2rem; border-radius:12px; max-width:900px; width:95%; max-height:90vh; overflow-y:auto;';
    
    let html = '<h2 style="margin-bottom: 1.5rem; color: #2a7c6f; display: flex; justify-content: space-between; align-items: center;">';
    html += '<span>⚙️ Admin Panel - Analitika Korisnika</span>';
    html += `<button onclick="this.closest('.admin-modal').remove()" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>`;
    html += '</h2>';
    
    // Summary Stats
    const totalUsers = allUsers.length;
    const totalPoints = allUsers.reduce((sum, u) => sum + (u.totalPoints || 0), 0);
    const totalQuizzes = allUsers.reduce((sum, u) => sum + (u.quizzesTaken || 0), 0);
    
    html += `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.875rem; color: #2e7d32;">Ukupno korisnika</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #1b5e20;">${totalUsers}</div>
            </div>
            <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.875rem; color: #1976d2;">Ukupno bodova</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #0d47a1;">${totalPoints}</div>
            </div>
            <div style="background: #fff3e0; padding: 1rem; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.875rem; color: #f57c00;">Ukupno urađenih kvizova</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #e65100;">${totalQuizzes}</div>
            </div>
        </div>
    `;
    
    // Users Table
    html += '<h3 style="margin-bottom: 1rem;">Lista korisnika</h3>';
    html += '<div style="overflow-x: auto;">';
    html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">';
    html += '<thead style="background: #f5f5f5; text-align: left;">';
    html += '<tr>';
    html += '<th style="padding: 0.75rem; border-bottom: 2px solid #ddd;">Korisnik</th>';
    html += '<th style="padding: 0.75rem; border-bottom: 2px solid #ddd;">Uloga</th>';
    html += '<th style="padding: 0.75rem; border-bottom: 2px solid #ddd;">Bodovi</th>';
    html += '<th style="padding: 0.75rem; border-bottom: 2px solid #ddd;">Kvizovi</th>';
    html += '<th style="padding: 0.75rem; border-bottom: 2px solid #ddd;">Tačno/Netačno</th>';
    html += '<th style="padding: 0.75rem; border-bottom: 2px solid #ddd;">Registracija</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';
    
    // Sort users by points descending
    const sortedUsers = [...allUsers].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    
    sortedUsers.forEach(user => {
        const regDate = user.registeredAt ? new Date(user.registeredAt).toLocaleDateString('bs-BA') : '-';
        const roleBadge = user.role === 'admin' ? 
            '<span style="background:#2a7c6f; color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem;">ADMIN</span>' : 
            '<span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:0.75rem;">USER</span>';
            
        html += `
            <tr>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee; font-weight: 500;">${user.username}</td>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${roleBadge}</td>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${user.totalPoints || 0}</td>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${user.quizzesTaken || 0}</td>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">
                    <span style="color: #2e7d32;">${user.correctAnswers || 0}</span> / 
                    <span style="color: #c62828;">${user.wrongAnswers || 0}</span>
                </td>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee; font-size: 0.875rem; color: #666;">${regDate}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    
    html += `
        <button onclick="this.closest('.admin-modal').remove()" 
                style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #2a7c6f; color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600;">
            Zatvori Panel
        </button>
    `;
    
    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
