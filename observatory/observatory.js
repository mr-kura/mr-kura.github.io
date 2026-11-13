
(() => {
  const results = document.querySelector('#observatory-results');
  const detail = document.querySelector('#observatory-entry');
  const filters = document.querySelector('#category-filters');
  const controls = document.querySelector('.observatory-controls');

  const params = new URLSearchParams(location.search);
  const slug = params.get('entry');

  let entries = [];
  let category = 'All';

  const dateText = value => {
    if (!value) return '';

    const date = new Date(`${value.slice(0, 10)}T12:00:00`);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const safeUrl = value => {
    try {
      const url = new URL(value);

      return ['https:', 'http:'].includes(url.protocol)
        ? url.href
        : null;
    } catch {
      return null;
    }
  };

  const node = (tag, cls, value) => {
    const el = document.createElement(tag);

    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value;

    return el;
  };

  const makeEntry = entry => {
    const link = node('a', 'entry-link');

    link.href = `/observatory/?entry=${encodeURIComponent(entry.slug)}`;

    const meta = node('div', 'entry-meta');

    meta.append(
      node('span', 'entry-category', entry.category || 'Ideas'),
      node('time', '', dateText(entry.date))
    );

    link.append(
      meta,
      node('h2', '', entry.title),
      node('p', 'entry-lede', entry.description || '')
    );

    return link;
  };

  const renderList = () => {
    results.replaceChildren();

    const filtered = entries.filter(entry =>
      category === 'All' || entry.category === category
    );

    if (!filtered.length) {
      results.append(
        node('p', 'muted', 'No published notes in this category yet.')
      );
      return;
    }

    for (const entry of filtered) {
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
      node('p', 'eyebrow', (entry.category || 'Ideas').toUpperCase()),
      node('h1', '', entry.title)
    );

    const metaText = [
      dateText(entry.date),
      entry.readingTime ? `${entry.readingTime} min read` : ''
    ].filter(Boolean).join(' · ');

    detail.append(
      node('p', 'entry-detail-meta', metaText),
      node('p', 'entry-lede', entry.description || '')
    );

    const paragraphs = Array.isArray(entry.content)
      ? entry.content
      : [];

    for (const paragraph of paragraphs) {
      if (typeof paragraph === 'string' && paragraph.trim()) {
        detail.append(node('p', 'entry-paragraph', paragraph));
      }
    }

    const references = Array.isArray(entry.references)
      ? entry.references
      : [];

    const validReferences = references
      .map(ref => ({
        label: String(ref.label || 'Reference'),
        url: safeUrl(ref.url)
      }))
      .filter(ref => ref.url);

    if (validReferences.length) {
      const section = node('section', 'entry-references');

      section.append(node('h2', '', 'References'));

      for (const ref of validReferences) {
        const link = node('a', '', ref.label);

        link.href = ref.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        section.append(link);
      }

      detail.append(section);
    }
  };

  const showNotFound = () => {
    detail.replaceChildren();

    const back = node('a', 'back-link', 'Back to the Observatory');
    back.href = '/observatory/';

    detail.append(
      node('p', 'eyebrow', 'ENTRY NOT FOUND'),
      node('h1', '', 'This note is unavailable.'),
      back
    );
  };

  const loadEntries = async () => {
    results.replaceChildren(
      node('p', 'muted', 'Loading Observatory entries...')
    );

    try {
      const response = await fetch('https://mr-kura.pages.dev/api/observatory', {
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
    } catch (error) {
      console.error('Observatory loading error:', error);

      entries = Array.isArray(window.OBSERVATORY_ENTRIES)
        ? window.OBSERVATORY_ENTRIES
        : [];

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

    renderList();
  };

  if (filters) {
    filters.addEventListener('click', event => {
      const button = event.target.closest('button[data-category]');

      if (!button) return;

      category = button.dataset.category;

      filters.querySelectorAll('button').forEach(el => {
        el.classList.toggle('active', el === button);
      });

      renderList();
    });
  }

  loadEntries();
})();
