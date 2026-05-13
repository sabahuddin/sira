# Poslanikova sira - Interactive Bilingual Quiz Application

## Overview

**Poslanikova sira** is an interactive, bilingual (Bosnian/German) educational quiz application focused on the life of Prophet Muhammad (ﷺ). The application is designed to provide an engaging learning experience through various quiz types, flashcards, and progress tracking. It is built using pure HTML, CSS, and JavaScript, ensuring a lightweight and responsive user experience.

## Features

- **Bilingual Support:** Fully localized in Bosnian (bs) and German (de).
- **User Authentication:** Secure login and registration system with language preference selection.
- **Multiple Quiz Types:**
  - True/False
  - Single Choice
  - Multiple Choice
  - Ordering
- **Instant Feedback:** Immediate feedback after each answer with detailed explanations in both languages.
- **Progress Tracking:** Tracks user scores, completed quizzes, and overall progress.
- **Flashcards:** Auto-generated flashcards from quiz questions for enhanced learning.
- **Responsive Design:** Optimized for various screen sizes, including mobile devices.
- **Comprehensive Content:** Based on the textbook "Zapečaćeni dženetski napitak", featuring 4 quizzes with over 400 questions.

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Data Storage:** LocalStorage for user data and progress, JSON files for quiz content.
- **Styling:** Custom CSS with a modern, clean design (Teal: #2a7c6f, Gold: #d4a574).
- **Fonts:** Poppins, Inter, Amiri (for Arabic text).

## File Structure

```
poslanikova-sira/
├── index.html                 # Main landing page with quiz selection
├── quiz.html                  # Quiz interface page
├── login.html                 # User authentication (login/registration)
├── css/
│   ├── style.css             # Main application styling
│   ├── login.css             # Styling for login/registration pages
│   └── quiz.css              # Styling for the quiz interface
├── js/
│   ├── app.js                # Main application logic and navigation
│   ├── quiz-engine.js        # Core quiz logic, question handling, and scoring
│   ├── auth.js               # User authentication and session management
│   └── translations.js       # Language translation utilities
├── data/
│   └── kvizovi/
│       ├── kviz1.json        # Quiz 1: Predislamska Arabija
│       ├── kviz2.json        # Quiz 2: Mladost i moral
│       ├── kviz3.json        # Quiz 3: Objava i poziv
│       └── kviz4.json        # Quiz 4: Ashabi
├── QUIZ_TEMPLATE.json         # Template for creating new quizzes
├── UPUTSTVO_ZA_KVIZOVE.md     # Instructions for quiz creation
└── README.md                  # Project documentation (this file)
```

## Installation and Deployment

To deploy the **Poslanikova sira** application:

1.  **Extract the ZIP file:** Unzip the provided `poslanikova-sira-FINAL.zip` package.
2.  **Upload to Web Server:** Upload the entire `poslanikova-sira` directory and its contents to your web server.
3.  **CORS Configuration:** Ensure your web server is configured to allow Cross-Origin Resource Sharing (CORS) for JSON files, as the quiz data is loaded dynamically.
4.  **Access the Application:** Navigate to the application's URL in your browser (e.g., `https://yourdomain.com/poslanikova-sira/`).

Users will be redirected to the `login.html` page upon their first visit to register or log in.

## How to Add New Quizzes

New quizzes (e.g., Kviz 5-10) can be easily added by following these steps:

1.  **Refer to `QUIZ_TEMPLATE.json`:** This file provides the exact structure required for new quiz JSON files.
2.  **Consult `UPUTSTVO_ZA_KVIZOVE.md`:** This document contains detailed instructions and best practices for creating new quiz content, ensuring compatibility and proper functionality.
3.  **Create New JSON File:** Create a new JSON file (e.g., `kviz5.json`) in the `data/kvizovi/` directory, adhering to the specified format.
4.  **Update `index.html`:** Add a new quiz card entry in `index.html` for the newly created quiz, ensuring the `data-quiz` attribute matches the new JSON file name (e.g., `data-quiz="kviz5"`).

## Support

For any issues or further assistance, please refer to the `TEST_REPORT.md` for detailed testing results and troubleshooting information.

**Author:** Manus AI
**Version:** 1.0
**Date:** February 2, 2026
