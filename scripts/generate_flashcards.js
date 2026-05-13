/*
 * Script to generate flashcards-data.json from the existing quiz JSON files.
 *
 * Each quiz file (kviz1.json ... kviz10.json) contains an array of question objects.
 * This script reads those files, extracts the question text and explanation in
 * both Bosnian (bs) and German (de), and attaches a quiz title per quiz.
 * The output is an object with a "flashcards" array that can be consumed by
 * flashcards.js on the frontend.
 */

const fs = require('fs');
const path = require('path');

// Map of quiz id to localized titles. These are used as the quiz title
// displayed in the flashcards category grid. If you update the titles on
// index.html, update this map accordingly.
const quizTitles = {
  1: {
    bs: "Predislamska Arabija i rodoslovlje Poslanika ﷺ",
    de: "Vorislamische Arabien und der Stammbaum des Propheten ﷺ"
  },
  2: {
    bs: "Rođenje i djetinjstvo Poslanika ﷺ",
    de: "Geburt und Kindheit des Propheten ﷺ"
  },
  3: {
    bs: "Mladost, ženidba s Hatidžom i period prije poslanstva",
    de: "Jugend, Ehe mit Hatidscha und die Zeit vor der Mission"
  },
  4: {
    bs: "Prva objava i tajni poziv u islam",
    de: "Die erste Offenbarung und die geheime Einladung zum Islam"
  },
  5: {
    bs: "Javni poziv i progoni u Mekki",
    de: "Die öffentliche Einladung und die Verfolgungen in Mekka"
  },
  6: {
    bs: "Hidžra u Medinu i uspostava islamske države",
    de: "Die Hidschra nach Medina und die Einrichtung des islamischen Staates"
  },
  7: {
    bs: "Bitke – Bedr, Uhud, Hendek",
    de: "Schlachten – Badr, Uhud, Graben"
  },
  8: {
    bs: "Period od Uhuda do Hudejbije",
    de: "Die Zeit von Uhud bis Hudaibiya"
  },
  9: {
    bs: "Delegacije, širenje islama i unutrašnje uređenje",
    de: "Delegationen, Ausbreitung des Islam und innere Ordnung"
  },
  10: {
    bs: "Oprosni hadž i preseljenje Poslanika ﷺ",
    de: "Die Abschiedspilgerfahrt und der Tod des Propheten ﷺ"
  }
};

// Directory containing quiz files
const quizzesDir = path.join(__dirname, '../data/kvizovi');

function generateFlashcards() {
  const flashcards = [];
  const files = fs.readdirSync(quizzesDir);
  files.forEach(file => {
    if (!file.endsWith('.json')) return;
    const filePath = path.join(quizzesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // Content can be either an array (old format) or an object with questions array
    const questions = Array.isArray(content) ? content : (content.questions || []);
    questions.forEach(q => {
      const quizId = q.quiz_id;
      const quizTitle = quizTitles[quizId];
      if (!quizTitle) return;
      const question = q.question || {};
      const explanation = q.explanation || {};
      flashcards.push({
        quiz_id: quizId,
        quiz_title: quizTitle,
        question,
        explanation
      });
    });
  });
  const outPath = path.join(__dirname, '../data/flashcards-data.json');
  fs.writeFileSync(outPath, JSON.stringify({ flashcards }, null, 2));
  console.log(`Generated ${flashcards.length} flashcards to ${outPath}`);
}

generateFlashcards();