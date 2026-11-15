const OBSERVATORY_API_ORIGIN = location.hostname === 'mr-kura.github.io' ? 'https://mr-kura.pages.dev' : '';

(() => {
  const results = document.querySelector('#observatory-results');
  const detail = document.querySelector('#observatory-entry');
  const controls = document.querySelector('.observatory-controls');

  const params = new URLSearchParams(location.search);
  const slug = params.get('entry');

  const CACHE_KEY = 'observatory-entries-v1';

  let entries = [];

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (Array.isArray(cached)) entries = cached;
  } catch {
    // Continue without browser cache.
  }

  const node = (tag, cls, value) => {
    const el = document.createElement(tag);

    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value;

    return el;
  };

  const makeEntry = entry => {
    const link = node('a', 'entry-link');

    link.href = `/observatory/?entry=${encodeURIComponent(entry.slug)}`;

    link.append(
      node('h2', '', entry.title || 'Untitled entry')
    );

    return link;
  };

  const renderList = () => {
    results.replaceChildren();

    if (!entries.length) {
      results.append(
        node('p', 'muted', 'No published entries yet.')
      );
      return;
    }

    for (const entry of entries) {
      const row = node('article', 'observatory-list-item');
      row.append(makeEntry(entry));
      results.append(row);
    }
  };

  const renderDetail = entry => {
    document.title = `${entry.title} — The Observatory`;

    detail.replaceChildren();

    const back = node('a', 'back-link', 'All entries');
    back.href = '/observatory/';

    detail.append(
      back,
      node('h1', '', entry.title || 'Untitled entry')
    );

    const paragraphs = Array.isArray(entry.content)
      ? entry.content
      : typeof entry.content === 'string'
        ? entry.content.split(/\n\s*\n/)
        : [];

    for (const paragraph of paragraphs) {
      if (typeof paragraph === 'string' && paragraph.trim()) {
        detail.append(
          node('p', 'entry-paragraph', paragraph.trim())
        );
      }
    }
  };

  const showNotFound = () => {
    detail.replaceChildren();

    const back = node('a', 'back-link', 'Back to the Observatory');
    back.href = '/observatory/';

    detail.append(
      node('h1', '', 'This entry is unavailable.'),
      back
    );
  };

  const loadEntries = async () => {
    // Display saved entries immediately while the API refreshes.
    if (entries.length && !slug) {
      results.hidden = false;
      detail.hidden = true;
      renderList();
    } else if (entries.length && slug) {
      const cachedEntry = entries.find(item => item.slug === slug);

      if (cachedEntry) {
        controls?.setAttribute('hidden', '');
        results.hidden = true;
        detail.hidden = false;
        renderDetail(cachedEntry);
      }
    }

    try {
      const response = await fetch(`${OBSERVATORY_API_ORIGIN}/api/observatory`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Could not load published entries.');
      }

      const data = await response.json();

      if (!Array.isArray(data.entries)) {
        throw new Error('Invalid Observatory response.');
      }

      entries = data.entries;

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
      } catch {
        // Continue if browser storage is unavailable.
      }

    } catch (error) {
      console.error('Observatory loading error:', error);

      if (!entries.length) {
        entries = Array.isArray(window.OBSERVATORY_ENTRIES)
          ? window.OBSERVATORY_ENTRIES
          : [];
      }

      if (!entries.length) {
        results.replaceChildren(
          node(
            'p',
            'muted',
            'The Observatory could not load right now. Please try again later.'
          )
        );
        return;
      }
    }

    if (slug) {
      controls?.setAttribute('hidden', '');
      results.hidden = true;
      detail.hidden = false;

      const entry = entries.find(item => item.slug === slug);

      if (entry) {
        renderDetail(entry);
      } else {
        showNotFound();
      }

      return;
    }

    results.hidden = false;
    detail.hidden = true;

    renderList();
  };

  loadEntries();
})();
