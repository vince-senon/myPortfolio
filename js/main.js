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
document.addEventListener('DOMContentLoaded', () => {
  const track    = document.querySelector('.projects-track');
  const cards    = document.querySelectorAll('.project-card');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');
  const dotsWrap = document.getElementById('sliderDots');

  if (!track || cards.length === 0) return;

  // How many cards visible at once
  const visibleCount = () => window.innerWidth <= 640 ? 1 : 2;

  let current = 0;

  // Build dots
  const totalSlides = () => Math.ceil(cards.length / visibleCount());

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const dot = document.createElement('div');
      dot.className = 'slider-dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    const total = totalSlides();
    current = Math.max(0, Math.min(index, total - 1));
    const cardWidth = cards[0].offsetWidth + 12; // gap = 0.75rem ≈ 12px
    track.style.transform = `translateX(-${current * visibleCount() * cardWidth}px)`;
    updateDots();
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= total - 1;
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  window.addEventListener('resize', () => {
    buildDots();
    goTo(0);
  });

  buildDots();
  goTo(0);
});
