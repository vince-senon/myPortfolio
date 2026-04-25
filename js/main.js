/* ─────────────────────────────────────────
   THEME TOGGLE
───────────────────────────────────────── */
(function () {
  const html   = document.documentElement;
  const btn    = document.getElementById('themeToggle');
  const tip    = document.getElementById('toggleTip');

  // Restore saved preference
  const saved = localStorage.getItem('theme');
  if (saved) html.setAttribute('data-theme', saved);

  function updateTip() {
    if (!tip) return;
    tip.textContent = html.getAttribute('data-theme') === 'dark'
      ? 'Switch to light mode'
      : 'Switch to dark mode';
  }

  updateTip();

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateTip();
  });
})();

/* ─────────────────────────────────────────
   GENERIC SLIDER
   Works for both projects (horizontal) and
   certifications (vertical).
───────────────────────────────────────── */
function createSlider({
  trackSel,
  itemSel,
  prevId,
  nextId,
  dotsId,
  counterId,
  direction = 'horizontal',
  visibleFn = () => 1,
}) {
  const track    = document.querySelector(trackSel);
  const items    = document.querySelectorAll(itemSel);
  const prevBtn  = document.getElementById(prevId);
  const nextBtn  = document.getElementById(nextId);
  const dotsWrap = document.getElementById(dotsId);
  const counter  = document.getElementById(counterId);

  if (!track || !items.length) return;

  let current = 0;
  const total = () => Math.ceil(items.length / visibleFn());

  /* dots */
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total(); i++) {
      const d = document.createElement('div');
      d.className = 'slider-dot' + (i === current ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function syncUI() {
    /* dots */
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) =>
        d.classList.toggle('active', i === current));
    }
    /* counter */
    if (counter) counter.textContent = `${current + 1} / ${items.length}`;
    /* buttons */
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= total() - 1;
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, total() - 1));

    if (direction === 'vertical') {
      /* cert slider: shift by item height + gap */
      const itemH = items[0].offsetHeight;
      track.style.transform = `translateY(-${current * itemH}px)`;
    } else {
      /* project slider: shift by card width + gap (12px) */
      const cardW = items[0].offsetWidth + 12;
      track.style.transform = `translateX(-${current * visibleFn() * cardW}px)`;
    }

    syncUI();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  window.addEventListener('resize', () => { buildDots(); goTo(0); });

  buildDots();
  goTo(0);
}

/* ─────────────────────────────────────────
   MODAL (project descriptions)
───────────────────────────────────────── */
function initModal() {
  const overlay = document.getElementById('descModal');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl  = document.getElementById('modalBody');
  const closeBtn = document.getElementById('modalClose');

  if (!overlay) return;

  function open(title, desc) {
    titleEl.textContent = title;
    bodyEl.textContent  = desc;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* wire up every "Read more" button */
  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      open(btn.dataset.title, btn.dataset.desc);
    });
  });

  closeBtn.addEventListener('click', close);

  /* close on backdrop click */
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  /* close on Escape */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* project slider — 2 visible on desktop, 1 on mobile */
  createSlider({
    trackSel:  '.projects-track',
    itemSel:   '.project-card',
    prevId:    'sliderPrev',
    nextId:    'sliderNext',
    dotsId:    'sliderDots',
    direction: 'horizontal',
    visibleFn: () => window.innerWidth <= 640 ? 1 : 2,
  });

  /* certification slider — 1 visible at a time, scrolls vertically */
  createSlider({
    trackSel:  '.cert-track',
    itemSel:   '.cert-item',
    prevId:    'certPrev',
    nextId:    'certNext',
    dotsId:    'certDots',
    counterId: 'certCounter',
    direction: 'vertical',
    visibleFn: () => 1,
  });

  initModal();
});
