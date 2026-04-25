/* ── THEME TOGGLE ── */
const toggle = document.getElementById('themeToggle');
const html   = document.documentElement;

const saved = localStorage.getItem('theme');
if (saved) html.setAttribute('data-theme', saved);

toggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ── PROJECT SLIDER ── */
function initSlider({ trackSel, cardSel, prevId, nextId, dotsId, visibleFn }) {
  const track    = document.querySelector(trackSel);
  const cards    = document.querySelectorAll(cardSel);
  const prevBtn  = document.getElementById(prevId);
  const nextBtn  = document.getElementById(nextId);
  const dotsWrap = document.getElementById(dotsId);

  if (!track || cards.length === 0) return;

  let current = 0;
  const visibleCount = visibleFn || (() => 1);
  const totalSlides  = () => Math.ceil(cards.length / visibleCount());

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const dot = document.createElement('div');
      dot.className = 'slider-dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));
  }

  function updateCounter() {
    const el = document.getElementById(dotsId + 'Counter');
    if (el) el.textContent = `${current + 1} / ${totalSlides()}`;
  }

  function goTo(index) {
    const total = totalSlides();
    current = Math.max(0, Math.min(index, total - 1));
    const gap = 12; // 0.75rem
    const cardWidth = cards[0].offsetWidth + gap;
    track.style.transform = `translateX(-${current * visibleCount() * cardWidth}px)`;
    updateDots();
    updateCounter();
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= total - 1;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  window.addEventListener('resize', () => { buildDots(); goTo(0); });

  buildDots();
  goTo(0);
}

document.addEventListener('DOMContentLoaded', () => {
  // Project slider — 2 visible on desktop
  initSlider({
    trackSel:  '.projects-track',
    cardSel:   '.project-card',
    prevId:    'sliderPrev',
    nextId:    'sliderNext',
    dotsId:    'sliderDots',
    visibleFn: () => window.innerWidth <= 640 ? 1 : 2,
  });

  // Cert slider — 3 visible (1 per step)
  initSlider({
    trackSel:  '.cert-track',
    cardSel:   '.cert-item',
    prevId:    'certPrev',
    nextId:    'certNext',
    dotsId:    'certDots',
    visibleFn: () => 1,
  });
});
