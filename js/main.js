/* ════════════════════════════════════════
   THEME TOGGLE
════════════════════════════════════════ */
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

/* ════════════════════════════════════════
   GLOBAL TOOLTIP
   Rendered at body level — never clipped.
   Attach to any element with:
     data-tip="your text"
════════════════════════════════════════ */
(function () {
  const tip      = document.getElementById('gTooltip');
  const tipText  = document.getElementById('gTooltipText');
  const tipArrow = document.getElementById('gTooltipArrow');
  if (!tip) return;

  let current = null;

  function show(el) {
    const text = el.dataset.tip;
    if (!text) return;
    tipText.textContent = text;
    tip.classList.add('visible');
    position(el);
    current = el;
  }

  function hide() {
    tip.classList.remove('visible');
    current = null;
  }

  function position(el) {
    const rect = el.getBoundingClientRect();
    const tw   = tip.offsetWidth  || 240;
    const th   = tip.offsetHeight || 80;
    const gap  = 10;

    // prefer above, fall back to below
    let top  = rect.top - th - gap + window.scrollY;
    let left = rect.left + rect.width / 2 - tw / 2 + window.scrollX;

    // if too high, show below
    const showBelow = rect.top - th - gap < 0;
    if (showBelow) {
      top = rect.bottom + gap + window.scrollY;
      tipArrow.style.transform = 'rotate(180deg)';
    } else {
      tipArrow.style.transform = '';
    }

    // clamp horizontally
    const pad = 8;
    left = Math.max(pad, Math.min(left, window.innerWidth - tw - pad));

    tip.style.left = left + 'px';
    tip.style.top  = top  + 'px';
  }

  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tip]');
    if (el && el !== current) show(el);
  });
  document.addEventListener('mouseout', e => {
    const el = e.target.closest('[data-tip]');
    if (el) hide();
  });
  window.addEventListener('scroll', () => { if (current) position(current); }, { passive: true });
})();

/* ════════════════════════════════════════
   MODAL — project "Read more"
   Project cards carry all data via attributes:
     data-title, data-desc, data-badge,
     data-tools (comma-separated), data-source (url)
════════════════════════════════════════ */
(function () {
  const overlay  = document.getElementById('descModal');
  const titleEl  = document.getElementById('modalTitle');
  const bodyEl   = document.getElementById('modalBody');
  const badgeEl  = document.getElementById('modalBadge');
  const metaEl   = document.getElementById('modalMeta');
  const linkEl   = document.getElementById('modalLink');
  const closeBtn = document.getElementById('modalClose');
  if (!overlay) return;

  // Tool icon SVGs keyed by label (lowercase)
  const TOOL_ICONS = {
    sql: `<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="6" rx="8" ry="3" stroke="#4169e1" stroke-width="1.5"/><path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="#4169e1" stroke-width="1.5" fill="none"/><path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" stroke="#4169e1" stroke-width="1.5" fill="none"/></svg>`,
    python: `<svg viewBox="0 0 24 24"><path d="M11.914 2C9.076 2 7.4 3.18 7.4 4.914V6.8h4.8v.6H5.486C3.75 7.4 2 8.73 2 11.6c0 2.87 1.75 4.2 3.486 4.2h1.114v-2.014c0-2.1 1.55-3.386 3.514-3.386h4.772c1.65 0 2.914-1.35 2.914-2.914V4.914C17.8 3.18 16.124 2 13.286 2h-1.372zM10.4 4.2c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z" fill="#3776ab"/><path d="M12.086 22c2.838 0 4.514-1.18 4.514-2.914V17.2h-4.8v-.6h6.714C20.25 16.6 22 15.27 22 12.4c0-2.87-1.75-4.2-3.486-4.2h-1.114v2.014c0 2.1-1.55 3.386-3.514 3.386H9.114C7.464 13.6 6.2 14.95 6.2 16.514v4.572C6.2 22.82 7.876 22 10.714 22h1.372zM13.6 19.8c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1z" fill="#ffd43b"/></svg>`,
    tableau: `<svg viewBox="0 0 24 24"><rect x="11" y="2" width="2" height="6" fill="#e97627"/><rect x="11" y="16" width="2" height="6" fill="#e97627"/><rect x="2" y="11" width="6" height="2" fill="#e97627"/><rect x="16" y="11" width="6" height="2" fill="#e97627"/><rect x="6.5" y="4.5" width="1.5" height="4.5" fill="#e97627" opacity=".7"/><rect x="16" y="15" width="1.5" height="4.5" fill="#e97627" opacity=".7"/><rect x="4.5" y="16" width="4.5" height="1.5" fill="#e97627" opacity=".7"/><rect x="15" y="6.5" width="4.5" height="1.5" fill="#e97627" opacity=".7"/><rect x="10.25" y="10.25" width="3.5" height="3.5" fill="#e97627"/></svg>`,
    excel: `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" fill="#217346"/><path d="M8 7l2.5 4L8 15h2l1.5-2.5L13 15h2l-2.5-4L15 7h-2l-1.5 2.5L10 7H8z" fill="white"/></svg>`,
    jupyter: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#f37626" stroke-width="1.5"/><circle cx="7" cy="17" r="1.5" fill="#979797"/><circle cx="17" cy="17" r="1.5" fill="#979797"/><circle cx="12" cy="6.5" r="1.5" fill="#979797"/><path d="M9 12.5c0-1.66 1.34-3 3-3s3 1.34 3 3" stroke="#f37626" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
    git: `<svg viewBox="0 0 24 24"><path d="M22.27 10.73l-9-9a1.49 1.49 0 00-2.12 0l-1.87 1.87 2.37 2.37a1.77 1.77 0 012.24 2.24l2.29 2.29a1.77 1.77 0 11-1.06 1.06l-2.14-2.14v5.62a1.77 1.77 0 11-1.45 0V9.26a1.77 1.77 0 01-.96-2.32L8.2 4.56l-6.47 6.47a1.49 1.49 0 000 2.12l9 9a1.49 1.49 0 002.12 0l9-9a1.49 1.49 0 00-.58-2.42z" fill="#f05032"/></svg>`,
  };

  function getIcon(label) {
    return TOOL_ICONS[label.toLowerCase()] || '';
  }

  function open(card) {
    const title  = card.dataset.title  || '';
    const desc   = card.dataset.desc   || '';
    const badge  = card.dataset.badge  || '';
    const tools  = (card.dataset.tools || '').split(',').map(s => s.trim()).filter(Boolean);
    const source = card.dataset.source || '';

    titleEl.textContent = title;
    bodyEl.textContent  = desc;

    // badge
    badgeEl.textContent  = badge === 'ready' ? 'Available' : 'Work in Progress';
    badgeEl.className    = 'modal-badge ' + badge;

    // tools
    metaEl.innerHTML = tools.map(t =>
      `<span class="modal-tool">${getIcon(t)}<span>${t}</span></span>`
    ).join('');

    // link
    if (source) {
      linkEl.href = source;
      linkEl.style.display = 'flex';
    } else {
      linkEl.style.display = 'none';
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Wire up read-more buttons — find parent card
  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      if (card) open(card);
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ════════════════════════════════════════
   PROJECT SLIDER (horizontal)
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  (function initProjectSlider() {
    const track   = document.querySelector('.projects-track');
    const cards   = Array.from(document.querySelectorAll('.project-card'));
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsEl  = document.getElementById('sliderDots');
    if (!track || !cards.length) return;

    let current = 0;
    const visible = () => window.innerWidth <= 720 ? 1 : 2;
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
      const gap   = 12; // matches .75rem gap
      const cardW = cards[0].offsetWidth + gap;
      track.style.transform = `translateX(-${current * visible() * cardW}px)`;
      syncUI();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { buildDots(); goTo(0); }, 100);
    });

    buildDots();
    goTo(0);
  })();

  /* ════════════════════════════════════════
     CERT SLIDER (vertical, scroll-aware)
  ════════════════════════════════════════ */
  (function initCertSlider() {
    const wrap    = document.getElementById('certWrap');
    const track   = document.getElementById('certTrack');
    const items   = Array.from(document.querySelectorAll('.cert-item'));
    const prevBtn = document.getElementById('certPrev');
    const nextBtn = document.getElementById('certNext');
    const pipsEl  = document.getElementById('certPips');
    if (!track || !items.length) return;

    let current = 0;
    const total = items.length;

    function buildPips() {
      pipsEl.innerHTML = '';
      items.forEach((_, i) => {
        const p = document.createElement('div');
        p.className = 'cert-pip' + (i === current ? ' active' : '');
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
      // measure the actual rendered height of one item
      const itemH = items[0].offsetHeight;
      track.style.transform = `translateY(-${current * itemH}px)`;
      syncUI();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // scroll wheel on the cert section
    let cooldown = false;
    wrap.addEventListener('wheel', e => {
      e.preventDefault();
      if (cooldown) return;
      cooldown = true;
      goTo(e.deltaY > 0 ? current + 1 : current - 1);
      setTimeout(() => { cooldown = false; }, 500);
    }, { passive: false });

    // touch swipe (vertical)
    let touchStartY = 0;
    wrap.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 30) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });

    buildPips();
    goTo(0);
  })();

});
