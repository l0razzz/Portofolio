# Lorentso Aligia — Bilingual Portfolio & CV (EL / EN)

Πλήρες δίγλωσσο (Ελληνικά & Αγγλικά) προσωπικό portfolio & βιογραφικό σε καθαρή HTML5, CSS3 και Vanilla JavaScript — χωρίς εξωτερικές εξαρτήσεις ή build steps.

## Δομή φακέλων / Folder Structure

```
portfolio/
├── index.html          # Κύρια σελίδα (semantic HTML5, SEO meta tags)
├── css/
│   └── styles.css      # Design system, light/dark theme, responsive & print CV styles
├── js/
│   ├── translations.js # Όλα τα κείμενα σε Ελληνικά (el) & Αγγλικά (en) + projects
│   └── main.js         # Εναλλαγή γλώσσας, theme, φίλτρα, modal, φόρμα, print CV
└── assets/img/         # Βελτιστοποιημένες εικόνες (hero, web, video, social)
```

## Τι περιλαμβάνει / Features

- **Άμεση εναλλαγή γλώσσας (`EL / EN`)** με αποθήκευση επιλογής (`localStorage`) και υποστήριξη `?lang=en` / `?lang=el`.
- **Light & Dark Theme** με σεβασμό στις ρυθμίσεις συστήματος.
- **Εκτύπωση / Αποθήκευση PDF CV** στη γλώσσα που έχει επιλέξει ο επισκέπτης (`@media print`).
- **Φίλτρα Projects & Modal Λεπτομερειών** για Websites, Video Editing & Social Media.
- **Πλήρες Βιογραφικό**: IntelliSolutions (Live Video Verification & Document Verification ανά κλάδο), ΣΑΕΚ Εφαρμογές Πληροφορικής & Απολυτήριο Λυκείου 18/20.

## Γρήγορες αλλαγές / Easy Customization

1. **Κείμενα & Projects**: Άλλαξε οτιδήποτε στο `js/translations.js` (και για τις 2 γλώσσες).
2. **Εικόνες**: Αντικατάστησε τα αρχεία μέσα στο `assets/img/` με δικές σου φωτογραφίες ή screenshots.
3. **Φόρμα επικοινωνίας (`lorentsoaligia@gmail.com`)**:
   - Η φόρμα είναι ήδη συνδεδεμένη με **FormSubmit** προς το `lorentsoaligia@gmail.com`.
   - Μόλις ανεβάσεις το site online (π.χ. GitHub Pages / Netlify) και στείλεις ένα 1ο δοκιμαστικό μήνυμα, θα λάβεις ένα email επιβεβαίωσης από το FormSubmit («Activate Form»). Μόλις πατήσεις επιβεβαίωση μία φορά, κάθε επόμενο μήνυμα έρχεται κατευθείαν στο Gmail σου.
   - Όταν το ανοίγεις τοπικά από αρχείο (`file://`), ανοίγει αυτόματα το email app με έτοιμο το μήνυμα. (Αν θέλεις να στέλνει απευθείας χωρίς email app ακόμα και από `file://`, μπορείς να βάλεις ένα δωρεάν κλειδί από το [web3forms.com](https://web3forms.com) στο `web3formsKey` μέσα στο `js/main.js`.)
4. **Δωρεάν δημοσίευση (Hosting)**: Ανέβασε τον φάκελο `portfolio/` στο **GitHub Pages**, **Netlify Drop** ή **Cloudflare Pages** — λειτουργεί αμέσως χωρίς build.
