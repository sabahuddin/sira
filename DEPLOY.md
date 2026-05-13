# Sira — Život Poslanika s.a.v.s.

Statički sajt sa interaktivnim kvizovima i flashcardima o životu Allahovog Poslanika, sallallahu alejhi ve sellem. Dvojezično: bosanski i njemački.

Deployan na: **https://sira.mekteb.net**

## Struktura

- `index.html`, `login.html`, `quiz.html`, `flashcards.html`, `results.html` — stranice
- `css/`, `js/` — stilovi i logika (vanilla JS, bez build koraka)
- `data/kvizovi/kviz1-10.json` — pitanja za 10 kvizova
- `data/flashcards-data.json` — sadržaj flashcardova
- `images/` — slike i logo

Auth: čisto frontend (localStorage) — nema backenda.

## Lokalno pokretanje

Bilo koji statički server iz root foldera:

```bash
python3 -m http.server 8080
# pa otvori http://localhost:8080
```

## Coolify deploy

1. Coolify → New Resource → **Application** → Public/Private repo
2. Repository: `sabahuddin/sira`, branch `main`
3. Build pack: **Dockerfile** (auto-detect)
4. Port: **80**
5. Domain: `sira.mekteb.net` (Coolify će automatski generisati Let's Encrypt sertifikat)
6. Deploy

Nakon prvog deploya, svaki push na `main` automatski rebuilduje sajt.

## Dodavanje novog kviza

1. Kreiraj `data/kvizovi/kvizN.json` po istom formatu kao postojeći
2. Dodaj karticu u `index.html` (kopiraj postojeću `<div class="quiz-card" data-quiz="kvizN">`)
3. Push — deploy ide automatski
