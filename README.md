# Loan Tracker - GitHub Pages + Firebase (email/password login)
Built from the "Use ACTUAL" sheet. Logic in src/calc.js; `npm test` checks it against the sheet.
See the step-by-step guide given in chat. Short version: copy .env.example to .env, fill Firebase keys, `npm install`, `npm run dev`.
Deploy: push to `main`; GitHub Actions publishes to GitHub Pages (Settings -> Pages -> Source: GitHub Actions).
Firestore rules: ADD the `match /loans/main` block from firestore.rules to your existing rules - do not replace the whole file if another app uses the project.
