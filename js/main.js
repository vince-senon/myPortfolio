/* ─────────────────────────────────────────
   THEME TOGGLE
───────────────────────────────────────── */
(function () {
  const html = document.documentElement;
  const btn  = document.getElementById('themeToggle');
  const tip  = document.getElementById('toggleTip');

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
   PROJECT SLIDER (horizontal)
───────────────────────────────────────── */
function initProjectSlider() {
  const track   = document.querySelector('.projects-track');
  const cards   = Array.from(document.querySelectorAll('.project-card'));
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const dotsEl  = document.getElementById('sliderDots');

  if (!track || !cards.length) return;

  let current = 0;
  const visible = () => window.innerWidth <= 640 ? 1 : 2;
  const total   = () => Math.ceil(cards.length / visible());

  function buildDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < total(); i++) {
      const d = document.createElement('div');
      d.className = 'slider-dot' + (i === current ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    }
  }

  function syncUI() {
    dotsEl.querySelectorAll('.slider-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= total() - 1;
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, total() - 1));
    const gap = 12;
    const cardW = cards[0].offsetWidth + gap;
    track.style.transform = `translateX(-${current * visible() * cardW}px)`;
    syncUI();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  window.addEventListener('resize', () => { buildDots(); goTo(0); });

  buildDots();
  goTo(0);
}

/* ─────────────────────────────────────────
   CERT SLIDER (vertical, scroll-aware)
───────────────────────────────────────── */
function initCertSlider() {
  const wrap    = document.querySelector('.cert-slider-wrap');
  const track   = document.querySelector('.cert-track');
  const items   = Array.from(document.querySelectorAll('.cert-item'));
  const prevBtn = document.getElementById('certPrev');
  const nextBtn = document.getElementById('certNext');
  const pipsEl  = document.getElementById('certDots');

  if (!track || !items.length) return;

  let current = 0;
  const total = items.length;

  /* build indicator pips */
  function buildPips() {
    pipsEl.innerHTML = '';
    items.forEach((_, i) => {
      const p = document.createElement('div');
      p.className = 'cert-pip' + (i === current ? ' active' : '');
      p.setAttribute('aria-label', `Cert ${i + 1}`);
      p.addEventListener('click', () => goTo(i));
      pipsEl.appendChild(p);
    });
  }

  function syncUI() {
    pipsEl.querySelectorAll('.cert-pip').forEach((p, i) =>
      p.classList.toggle('active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= total - 1;
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, total - 1));
    const itemH = items[0].offsetHeight;
    track.style.transform = `translateY(-${current * itemH}px)`;
    syncUI();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* scroll interaction on the wrapper */
  let scrollCooldown = false;
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (scrollCooldown) return;
    scrollCooldown = true;
    goTo(e.deltaY > 0 ? current + 1 : current - 1);
    setTimeout(() => { scrollCooldown = false; }, 500);
  }, { passive: false });

  buildPips();
  goTo(0);
}

/* ─────────────────────────────────────────
   MODAL (Read more)
───────────────────────────────────────── */
function initModal() {
  const overlay  = document.getElementById('descModal');
  const titleEl  = document.getElementById('modalTitle');
  const bodyEl   = document.getElementById('modalBody');
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

  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', () => open(btn.dataset.title, btn.dataset.desc));
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initProjectSlider();
  initCertSlider();
  initModal();
});
