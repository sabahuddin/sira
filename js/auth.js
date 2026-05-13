// ===== AUTHENTICATION SYSTEM =====

// User Management
const UserManager = {
    // Get all users from localStorage
    getAllUsers() {
        const users = localStorage.getItem('siretUsers');
        return users ? JSON.parse(users) : [];
    },
    
    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem('siretUsers', JSON.stringify(users));
    },
    
    // Check if username exists
    userExists(username) {
        const users = this.getAllUsers();
        return users.some(user => user.username.toLowerCase() === username.toLowerCase());
    },
    
    // Register new user
    register(username, password, language = 'bs') {
        if (this.userExists(username)) {
            const msg = (translations[language] && translations[language].usernameExists) || 'Korisničko ime već postoji!';
            return { success: false, message: msg };
        }
        
        const users = this.getAllUsers();
        const newUser = {
            username: username,
            password: password, // In production, this should be hashed!
            language: language,
            role: username.toLowerCase() === 'admin' ? 'admin' : 'user',
            registeredAt: new Date().toISOString(),
            totalPoints: 0,
            quizzesTaken: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            quizHistory: []
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        const msg = (translations[language] && translations[language].registrationSuccess) || 'Registracija uspješna!';
        return { success: true, message: msg };
    },
    
    // Login user
    login(username, password, preferredLanguage) {
        const users = this.getAllUsers();
        const user = users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password
        );
        
        if (user) {
            // Determine language: prefer explicit choice from login/register UI, else keep user's saved preference, else fallback 'bs'
            const lang = preferredLanguage || user.language || 'bs';

            // Persist language preference back to stored user record (so quizzes & UI stay consistent next time)
            user.language = lang;
            this.saveUsers(users);

            // Save current user session
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                role: user.role || (user.username.toLowerCase() === 'admin' ? 'admin' : 'user'),
                language: lang,
                loginTime: new Date().toISOString()
            }));

            // Also store for pre-login pages / first paint
            localStorage.setItem('selectedLanguage', lang);

            return { success: true, user: user };
        }
        
        const msg = (translations[lang] && translations[lang].invalidLogin) || 'Pogrešno korisničko ime ili šifra!';
        return { success: false, message: msg };
    },
    
    // Get current logged in user
    getCurrentUser() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return null;
        
        const session = JSON.parse(currentUser);
        const users = this.getAllUsers();
        return users.find(u => u.username === session.username);
    },
    
    // Logout
    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },
    
    // Update user stats
    updateUserStats(points, correct, wrong) {
        const session = JSON.parse(localStorage.getItem('currentUser'));
        if (!session) return;
        
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.username === session.username);
        
        if (userIndex !== -1) {
            users[userIndex].totalPoints += points;
            users[userIndex].quizzesTaken += 1;
            users[userIndex].correctAnswers += correct;
            users[userIndex].wrongAnswers += wrong;
            
            this.saveUsers(users);
        }
    },
    
    // Add quiz to history
    addQuizToHistory(quizId, quizTitle, score, points, time) {
        const session = JSON.parse(localStorage.getItem('currentUser'));
        if (!session) return;
        
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.username === session.username);
        
        if (userIndex !== -1) {
            users[userIndex].quizHistory.push({
                quizId,
                quizTitle,
                score,
                points,
                time,
                completedAt: new Date().toISOString()
            });
            
            this.saveUsers(users);
        }
    }
};

// Check if user is logged in (for protected pages)
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Login Page Logic
if (window.location.pathname.includes('login.html')) {
    // Check if already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'index.html';
    }
    
    // Check URL parameters for mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'register') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    } else {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    }
    
    // Toggle between login and register forms
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('registerError').style.display = 'none';
        // Reapply translations when switching forms to ensure language is updated
        if (typeof applyTranslations === 'function') {
            applyTranslations();
        }
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('loginError').style.display = 'none';
        // Reapply translations when switching forms to ensure language is updated
        if (typeof applyTranslations === 'function') {
            applyTranslations();
        }
    });
    
    // Login form submission
    document.getElementById('loginBtn').addEventListener('click', () => {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const language = (document.getElementById('loginLanguage') && document.getElementById('loginLanguage').value) || getUserLanguage();
        
        if (!username || !password) {
            const msg = (translations[language] && translations[language].enterCredentials) || 'Molimo unesite korisničko ime i šifru!';
            showError('loginError', msg);
            return;
        }
        
        const result = UserManager.login(username, password, language);
        
        if (result.success) {
            window.location.href = 'index.html';
        } else {
            showError('loginError', result.message);
        }
    });
    
    // Register form submission
    document.getElementById('registerBtn').addEventListener('click', () => {
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        const language = document.getElementById('registerLanguage').value;
        
        // Validation
        if (!username || !password || !passwordConfirm) {
            const msg = (translations[language] && translations[language].fillAllFields) || 'Molimo popunite sva polja!';
            showError('registerError', msg);
            return;
        }
        
        if (username.length < 3) {
            const msg = (translations[language] && translations[language].usernameMin3) || 'Korisničko ime mora imati minimum 3 karaktera!';
            showError('registerError', msg);
            return;
        }
        
        if (password.length < 4) {
            const msg = (translations[language] && translations[language].passwordMin4) || 'Šifra mora imati minimum 4 karaktera!';
            showError('registerError', msg);
            return;
        }
        
        if (password !== passwordConfirm) {
            const msg = (translations[language] && translations[language].passwordsDontMatch) || 'Šifre se ne poklapaju!';
            showError('registerError', msg);
            return;
        }
        
        const result = UserManager.register(username, password, language);
        
        if (result.success) {
            // Auto login after registration
            UserManager.login(username, password, language);
            window.location.href = 'index.html';
        } else {
            showError('registerError', result.message);
        }
    });
    
    // Enter key support
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn').click();
        }
    });
    
    document.getElementById('registerPasswordConfirm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('registerBtn').click();
        }
    });

    // Checkbox logic for enabling register button
    const acceptCheckbox = document.getElementById('acceptStorageTerms');
    const registerBtn = document.getElementById('registerBtn');
    if (acceptCheckbox && registerBtn) {
        acceptCheckbox.addEventListener('change', function() {
            if (this.checked) {
                registerBtn.disabled = false;
                registerBtn.style.opacity = '1';
                registerBtn.style.cursor = 'pointer';
            } else {
                registerBtn.disabled = true;
                registerBtn.style.opacity = '0.6';
                registerBtn.style.cursor = 'not-allowed';
            }
        });
    }
}

// Helper function to show errors
function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UserManager, checkAuth };
}


// ===== LANGUAGE INIT (Login/Register) =====
(function initAuthLanguage() {
    try {
        const lang = (typeof getUserLanguage === 'function') ? getUserLanguage() : (localStorage.getItem('selectedLanguage') || 'bs');
        const loginSel = document.getElementById('loginLanguage');
        const regSel = document.getElementById('registerLanguage');
        if (loginSel) loginSel.value = lang;
        if (regSel) regSel.value = lang;
        // Ensure translations are applied immediately on first paint
        if (typeof applyTranslations === 'function') applyTranslations();
    } catch (e) {
        console.warn('Language init failed:', e);
    }
})();
