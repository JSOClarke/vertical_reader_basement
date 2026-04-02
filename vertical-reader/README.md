# 📖 Vertical Reader

A Japanese language learning tool built as a **vertical text reader** — designed for reading Japanese novels, manga scripts, and EPUB files in the traditional top-to-bottom, right-to-left layout. Built to complement tools like **Anki** and browser-based furigana extensions.

---

## ✨ Features

- **Vertical text rendering** — native Japanese reading direction (縦書き)
- **EPUB file support** — load any standard `.epub` file and read it sentence-by-sentence
- **Sentence-level navigation** — step through text one sentence at a time for focused immersion reading
- **Action Menu per sentence** — click any sentence to access quick actions (copy, lookup, etc.)
- **Anki integration** — configure an Anki field to export sentences directly to your flashcard deck
- **Progress tracking** — bottom HUD shows chapter/book progress with a visual progress bar
- **Profile system** — export and import your reading position and settings as a `.json` file
- **Dark / Light theme** — toggle between themes; preference is saved to localStorage
- **Responsive layout** — works on both desktop and mobile with an adaptive hamburger menu
- **Furigana-safe** — compatible with browser furigana extensions (e.g. Yomitan); furigana tags are excluded from character-count calculations so bookmarks stay accurate

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Install & Run

```bash
# 1. Clone the repo (if you haven't already)
git clone <repo-url>
cd vertical_reader_basement/vertical-reader

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173** (or the next available port).

---

## 🛠 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server with hot-reload |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

---

## 📂 Loading Content

### Load an EPUB
1. Click the **☰ menu** (top-right corner)
2. Select **Load EPUB**
3. Choose any `.epub` file from your device
4. The reader will open at sentence 1

### Import a Profile
A **profile** is a `.json` snapshot of your reading session (sentences, current position, Anki settings). To resume a previous session:
1. Click **☰ → Import Profile**
2. Select your previously exported `.json` profile file

### Export a Profile
To save your current reading position:
1. Click **☰ → Export Profile**
2. A `.json` file will be downloaded — keep it safe and re-import it next time

---

## 🗂 Project Structure

```
src/
├── features/
│   ├── reader/        # Core reader UI (ReaderContainer, Sentence, ProgressBar, etc.)
│   ├── epub/          # EPUB parsing utilities
│   ├── anki/          # Anki settings modal and integration logic
│   ├── profile/       # Profile import/export
│   └── theme/         # Theme management
├── hooks/             # Reusable React hooks (e.g. useMediaQuery)
├── types/             # Shared TypeScript types
├── data/              # Sample/mock book data for development
└── App.tsx            # Root component — composes layout and features
```

---

## 🔗 Anki Integration

1. Open **☰ → Anki Settings**
2. Enter the name of the Anki field you want to populate (e.g. `Sentence`)
3. When reading, use the sentence **Action Menu** to send a sentence to Anki

> Requires [AnkiConnect](https://ankiconnect.readthedocs.io/) to be running locally.

---

## 🧩 Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite 8](https://vite.dev/) | Build tool & dev server |
| [JSZip](https://stuk.github.io/jszip/) | EPUB (zip) file parsing |
| Vanilla CSS | Styling — no CSS framework |
