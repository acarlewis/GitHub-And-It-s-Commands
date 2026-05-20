# 📄 DevDocs — Multi-language Documentation Site

A clean, fast, and fully static documentation website built with vanilla JavaScript, Bootstrap 5, and Highlight.js. Content is driven by JSON files, making it easy to add new sections or languages without touching any HTML or JS.

---

## ✨ Features

- **JSON-driven content** — all sections and text live in `content/*.json`; no HTML edits needed to update docs
- **Multi-language support** — switch languages instantly via a segmented pill control in the navbar; preference is saved to `localStorage`
- **Responsive layout** — desktop sidebar + Bootstrap Offcanvas mobile drawer, both kept in sync automatically
- **Syntax highlighting** — powered by Highlight.js; any `<pre><code>` block is highlighted automatically
- **Copy button** — appears on hover over any code block; turns green with a checkmark on success
- **Active section tracking** — `IntersectionObserver` highlights the current section in the sidebar as you scroll
- **Section anchors** — every `<h2>` gets a `#` permalink that appears on hover
- **Back-to-top button** — fades in after scrolling 400px with a smooth lift-on-hover effect
- **Responsive tables** — all tables are automatically wrapped in `table-responsive` divs

---

## 📁 Project Structure

```
├── index.html          # App shell — navbar, sidebar, offcanvas, main content area
├── css/
│   └── styles.css      # All custom styles — 20+ CSS variables for easy re-theming
├── js/
│   └── app.js          # Fetches JSON, builds nav + content, drives all interactive features
└── content/
    ├── en.json         # English content
    └── fr.json         # French content (add more as needed)
```

---

## 🚀 Getting Started

### Prerequisites

You need a local HTTP server to run the app — `fetch()` won't work over `file://` due to browser CORS rules.

**Python:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx serve .
```

**VS Code:** Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, then right-click `index.html` → **Open with Live Server**.

Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🌍 Deploying to GitHub Pages

1. Push your project to a public GitHub repository
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → main → / (root)**
4. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

No build step required — it works out of the box.

---

## 🛠️ Extending the Site

### Add a new section

Open any `content/*.json` file and add an object to the `sections` array:

```json
{
  "id": "my-new-section",
  "title": "My New Section",
  "content": "<p>Your HTML content here.</p>"
}
```

The sidebar and main content will update automatically.

### Add a new language

1. Create `content/de.json` (copy an existing file as a template)
2. Register it in `app.js`:
```js
const LANGUAGES = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch'   // add this
};
```
3. Add a button in `index.html`:
```html
<button data-lang="de">DE</button>
```

### Re-theme the site

All colours, fonts, spacing, and radii are CSS custom properties at the top of `styles.css`:

```css
:root {
  --accent: #0ea5e9;
  --surface: #ffffff;
  --font-sans: 'Inter', sans-serif;
  --radius-m: 8px;
  /* ... */
}
```

Change these values to re-theme the entire site instantly.

---

## 🧰 Built With

| Tool | Purpose |
|---|---|
| [Bootstrap 5](https://getbootstrap.com/) | Layout, grid, offcanvas, utilities |
| [Highlight.js](https://highlightjs.org/) | Syntax highlighting for code blocks |
| [Inter](https://fonts.google.com/specimen/Inter) | UI font |
| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Monospace / code font |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
