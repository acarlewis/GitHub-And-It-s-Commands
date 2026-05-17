/* ══════════════════════════════════════════════════════════
   Config
   ══════════════════════════════════════════════════════════ */
const LANGUAGES = {
  en: { label: 'English',  file: 'content/en.json' },
  fr: { label: 'Français', file: 'content/fr.json' },
  tr: { label: 'Türkçe',   file: 'content/tr.json' },
  es: { label: 'Español',  file: 'content/es.json' }
};

let currentLang = 'en';
const cache     = {};
let spyObserver = null;

/* ══════════════════════════════════════════════════════════
   Icons (inline SVG)
   ══════════════════════════════════════════════════════════ */
const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

/* ══════════════════════════════════════════════════════════
   Data fetching
   ══════════════════════════════════════════════════════════ */
async function fetchLang(lang) {
  if (cache[lang]) return cache[lang];
  const res = await fetch(LANGUAGES[lang].file);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  cache[lang] = await res.json();
  return cache[lang];
}

/* ══════════════════════════════════════════════════════════
   Sidebar — updates both desktop + mobile navs
   ══════════════════════════════════════════════════════════ */
function buildSidebar(sections) {
  const html = sections.map(s =>
    `<li><a class="nav-link" href="#${s.id}">${s.title}</a></li>`
  ).join('');

  const desktop = document.getElementById('sidebar-nav');
  const mobile  = document.getElementById('offcanvas-nav');
  if (desktop) desktop.innerHTML = html;
  if (mobile)  mobile.innerHTML  = html;

  /* Immediately highlight the first section */
  if (sections.length) setActiveSection(sections[0].id);
}

function setActiveSection(id) {
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link =>
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
  );
}

/* ══════════════════════════════════════════════════════════
   Copy-to-clipboard buttons
   ══════════════════════════════════════════════════════════ */
function addCopyButtons(area) {
  area.querySelectorAll('pre').forEach(pre => {
    /* Wrap in .code-block for relative positioning */
    const wrap = document.createElement('div');
    wrap.className = 'code-block';
    pre.replaceWith(wrap);
    wrap.appendChild(pre);

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy code');
    btn.innerHTML = `${ICON_COPY} Copy`;
    wrap.appendChild(btn);

    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code') ?? pre;
      const text = code.textContent ?? '';

      try {
        await navigator.clipboard.writeText(text);
        btn.innerHTML = `${ICON_CHECK} Copied!`;
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = `${ICON_COPY} Copy`;
          btn.classList.remove('copied');
        }, 2000);
      } catch {
        /* Graceful fallback: select the text */
        try {
          const range = document.createRange();
          range.selectNode(pre);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        } catch { /* nothing more we can do */ }
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   Section anchor links (# on hover)
   ══════════════════════════════════════════════════════════ */
function addSectionAnchors(area) {
  area.querySelectorAll('.section-block').forEach(section => {
    const h2 = section.querySelector('h2');
    if (!h2 || !section.id) return;

    const anchor = document.createElement('a');
    anchor.href      = `#${section.id}`;
    anchor.className = 'section-anchor';
    anchor.setAttribute('aria-label', `Link to ${h2.textContent.trim()} section`);
    anchor.textContent = '#';
    h2.appendChild(anchor);
  });
}

/* ══════════════════════════════════════════════════════════
   Content builder
   ══════════════════════════════════════════════════════════ */
function buildContent(data) {
  const area = document.getElementById('content-area');

  document.getElementById('page-title').textContent    = data.title;
  document.getElementById('page-subtitle').textContent = data.subtitle || '';

  area.innerHTML = data.sections.map(s =>
    `<section class="section-block" id="${s.id}">
      <h2>${s.title}</h2>
      ${s.content}
    </section>`
  ).join('');

  /* Wrap every <table> for horizontal scroll on small screens */
  area.querySelectorAll('table').forEach(t => {
    const wrap = document.createElement('div');
    wrap.className = 'table-responsive';
    t.replaceWith(wrap);
    wrap.appendChild(t);
  });

  /* Copy buttons on code blocks */
  addCopyButtons(area);

  /* # anchor on section headings */
  addSectionAnchors(area);

  /* Syntax-highlight all <pre><code> elements */
  area.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));

  /* Activate scroll spy */
  setupScrollSpy(data.sections);
}

/* ══════════════════════════════════════════════════════════
   Scroll spy — highlights sidebar as user scrolls
   ══════════════════════════════════════════════════════════ */
function setupScrollSpy(sections) {
  if (spyObserver) spyObserver.disconnect();

  spyObserver = new IntersectionObserver(entries => {
    /* Keep only the topmost visible section */
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visible.length) setActiveSection(visible[0].target.id);
  }, { rootMargin: '-10% 0px -78% 0px', threshold: 0 });

  sections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) spyObserver.observe(el);
  });
}

/* ══════════════════════════════════════════════════════════
   Language switch
   ══════════════════════════════════════════════════════════ */
async function switchLanguage(lang) {
  if (!LANGUAGES[lang]) return;

  /* Mark the active lang button */
  document.querySelectorAll('.lang-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.lang === lang)
  );

  /* Show loading indicator */
  document.getElementById('content-area').innerHTML =
    `<div class="loading-state">
      <svg class="spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <span>Loading&hellip;</span>
    </div>`;

  try {
    const data = await fetchLang(lang);
    currentLang = lang;
    document.documentElement.lang = lang;
    buildSidebar(data.sections);
    buildContent(data);
    localStorage.setItem('preferred-lang', lang);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch {
    document.getElementById('content-area').innerHTML =
      `<div class="error-state">
        <span class="error-icon">&#9888;</span>
        <div>
          <p><strong>Could not load content</strong></p>
          <p>Failed to fetch <code>content/${lang}.json</code>.</p>
          <p>This site requires an HTTP server. Open a terminal in this folder and run:</p>
          <pre><code>python -m http.server 8000\n# or\nnpx serve .</code></pre>
        </div>
      </div>`;
  }
}

/* ══════════════════════════════════════════════════════════
   Sidebar link clicks (both desktop + mobile)
   ══════════════════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const link = e.target.closest('.sidebar-nav .nav-link');
  if (!link) return;
  e.preventDefault();

  const target = document.querySelector(link.getAttribute('href'));
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* Immediate active feedback */
  const id = link.getAttribute('href').slice(1);
  setActiveSection(id);

  /* Close mobile offcanvas if it's open */
  const offcanvasEl = document.getElementById('mobileSidebar');
  const instance = offcanvasEl ? bootstrap.Offcanvas.getInstance(offcanvasEl) : null;
  if (instance) instance.hide();
});

/* ══════════════════════════════════════════════════════════
   Back-to-top button
   ══════════════════════════════════════════════════════════ */
const btt = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  btt?.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
btt?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ══════════════════════════════════════════════════════════
   Boot
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn =>
    btn.addEventListener('click', () => switchLanguage(btn.dataset.lang))
  );

  /* Restore preferred language (falls back to English) */
  switchLanguage(localStorage.getItem('preferred-lang') || 'en');
});
