
// Brand logos use official Simple Icons endpoints with a jsDelivr package fallback.
for (const logo of document.querySelectorAll('.tool img[data-fallback], .social-link img[data-fallback]')) {
  logo.addEventListener('error', () => {
    const fallback = logo.dataset.fallback;
    if (fallback && logo.src !== fallback) { logo.src = fallback; return; }
    logo.hidden = true;
  }, { once: false });
}
const CONTACT_API_ORIGIN = location.hostname === 'mr-kura.github.io' ? 'https://mr-kura.pages.dev' : '';
const forms = document.querySelectorAll('[data-form]');
for (const form of forms) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form).entries());
    status.textContent = 'Sending…'; button.disabled = true;
    try {
      const endpoint = form.dataset.form === 'hire' ? '/api/hire' : '/api/contact';
      const response = await fetch(`${CONTACT_API_ORIGIN}${endpoint}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send your message.');
      status.textContent = 'Thank you. Your message has been sent.'; form.reset();
      form.querySelectorAll('[data-autogrow]').forEach(el=>{el.style.height='auto';});
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  });
}
for (const textarea of document.querySelectorAll('textarea[data-autogrow]')) {
  const grow=()=>{textarea.style.height='auto';textarea.style.height=`${textarea.scrollHeight}px`;};
  textarea.addEventListener('input',grow); grow();
}
const preview = document.querySelector('#observatory-preview-list');
if (preview && Array.isArray(window.OBSERVATORY_ENTRIES)) {
  if (window.OBSERVATORY_ENTRIES.length === 0) {
    const note = document.createElement('p');
    note.className = 'observatory-empty';
    note.textContent = 'Notes and interesting finds will appear here.';
    preview.replaceChildren(note);
  }
  const dateText = value => new Date(`${value}T12:00:00`).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
  preview.replaceChildren();
  for (const entry of [...window.OBSERVATORY_ENTRIES].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3)) {
    const card=document.createElement('article');card.className='preview-item';
    const meta=document.createElement('div');meta.className='entry-meta';
    const category=document.createElement('span');category.className='entry-category';category.textContent=entry.category;
    const date=document.createElement('time');date.textContent=dateText(entry.date);date.dateTime=entry.date;meta.append(category,date);
    const link=document.createElement('a');link.href=`/observatory/?entry=${encodeURIComponent(entry.slug)}`;
    const title=document.createElement('h3');title.textContent=entry.title;
    const description=document.createElement('p');description.textContent=entry.description;
    link.append(title,description);card.append(meta,link);preview.append(card);
  }
}
