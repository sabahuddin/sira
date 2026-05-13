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
            return { success: false, message: 'Korisničko ime već postoji!' };
        }
        
        const users = this.getAllUsers();
        const newUser = {
            username: username,
            password: password, // In production, this should be hashed!
            language: language,
            registeredAt: new Date().toISOString(),
            totalPoints: 0,
            quizzesTaken: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            quizHistory: []
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        return { success: true, message: 'Registracija uspješna!' };
    },
    
    // Login user
    login(username, password) {
        const users = this.getAllUsers();
        const user = users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password
        );
        
        if (user) {
            // Save current user to session
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                language: user.language || 'bs',
                loginTime: new Date().toISOString()
            }));
            return { success: true, user: user };
        }
        
        return { success: false, message: 'Pogrešno korisničko ime ili šifra!' };
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
        
        if (!username || !password) {
            showError('loginError', 'Molimo unesite korisničko ime i šifru!');
            return;
        }
        
        const result = UserManager.login(username, password);
        
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
            showError('registerError', 'Molimo popunite sva polja!');
            return;
        }
        
        if (username.length < 3) {
            showError('registerError', 'Korisničko ime mora imati minimum 3 karaktera!');
            return;
        }
        
        if (password.length < 4) {
            showError('registerError', 'Šifra mora imati minimum 4 karaktera!');
            return;
        }
        
        if (password !== passwordConfirm) {
            showError('registerError', 'Šifre se ne poklapaju!');
            return;
        }
        
        const result = UserManager.register(username, password, language);
        
        if (result.success) {
            // Auto login after registration
            UserManager.login(username, password);
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
