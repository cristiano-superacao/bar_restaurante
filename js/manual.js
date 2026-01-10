document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('manual-search');
  const sectionFilter = document.getElementById('manual-section-filter');
  const manualList = document.getElementById('manual-list');
  const emptyEl = document.getElementById('manual-empty');
  const items = Array.from(manualList ? manualList.querySelectorAll('.manual-item') : []);

  function render() {
    if (!items.length) return;
    const q = (searchInput?.value || '').toLowerCase();
    const section = sectionFilter?.value || 'all';
    let visibleCount = 0;

    items.forEach(item => {
      const title = (item.querySelector('h3')?.textContent || '').toLowerCase();
      const body = (item.querySelector('p')?.textContent || '').toLowerCase();
      const matchesSearch = !q || title.includes(q) || body.includes(q);
      const matchesSection = section === 'all' || (item.dataset.section === section);
      const show = matchesSearch && matchesSection;
      item.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    if (emptyEl) emptyEl.style.display = visibleCount === 0 ? 'flex' : 'none';
  }

  if (searchInput) searchInput.addEventListener('input', render);
  if (sectionFilter) sectionFilter.addEventListener('change', render);

  render();
});
