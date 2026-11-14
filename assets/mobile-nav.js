
document.addEventListener('click', (event) => {
  const link = event.target.closest('.mobile-menu nav a');

  if (link) {
    const menu = link.closest('.mobile-menu');
    if (menu) menu.open = false;
    return;
  }

  document.querySelectorAll('.mobile-menu[open]').forEach(menu => {
    if (!menu.contains(event.target)) {
      menu.open = false;
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.mobile-menu[open]').forEach(menu => {
      menu.open = false;
    });
  }
});
