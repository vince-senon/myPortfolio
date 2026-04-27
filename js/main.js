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
      ? 'Switch to light mode' : 'Switch to dark mode';
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
   Attaches to any [data-tip] element.
   Rendered at body level — never clipped.
════════════════════════════════════════ */
(function () {
  const box      = document.getElementById('gTooltip');
  const textEl   = document.getElementById('gTooltipText');
  const arrowEl  = document.getElementById('gTooltipArrow');
  if (!box) return;

  let active = null;
  let showTimer = null;

  function show(el) {
    clearTimeout(showTimer);
    const text = el.dataset.tip;
    if (!text) return;
    textEl.textContent = text;
    active = el;
    // short delay so it doesn't flicker on fast moves
    showTimer = setTimeout(() => {
      box.classList.add('visible');
      reposition();
    }, 120);
  }

  function hide() {
    clearTimeout(showTimer);
    box.classList.remove('visible');
    active = null;
  }

  function reposition() {
    if (!active) return;
    const rect = active.getBoundingClientRect();
    // force layout so offsetWidth/Height are accurate
    box.style.left = '0px';
    box.style.top  = '0px';
    const bw = box.offsetWidth;
    const bh = box.offsetHeight;
    const gap = 6;
    const pad = 6;

    let top, showBelow;
    if (rect.top - bh - gap >= 0) {
      top = rect.top - bh - gap;
      showBelow = false;
    } else {
      top = rect.bottom + gap;
      showBelow = true;
    }

    let left = rect.left + rect.width / 2 - bw / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - bw - pad));

    box.style.left = left + 'px';
    box.style.top  = top  + 'px';

    // arrow direction
    if (showBelow) {
      box.classList.add('arrow-below');
    } else {
      box.classList.remove('arrow-below');
    }
  }

  // Use delegation on document so it works for dynamically created elements too
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tip]');
    if (!el) return;
    if (el !== active) show(el);
  });

  document.addEventListener('mouseout', e => {
    const el = e.target.closest('[data-tip]');
    if (!el) return;
    // Only hide if we're actually leaving the element (not moving to a child)
    if (!el.contains(e.relatedTarget)) hide();
  });

  window.addEventListener('scroll', () => { if (active) reposition(); }, { passive: true });
  window.addEventListener('resize', () => { if (active) reposition(); });
})();

/* ════════════════════════════════════════
   MODAL — "Read more" on project cards
   All data is stored in data-* on the card.
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

  const ICONS = {
    sql:     `<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="6" rx="8" ry="3" stroke="#4169e1" stroke-width="1.5"/><path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="#4169e1" stroke-width="1.5" fill="none"/><path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" stroke="#4169e1" stroke-width="1.5" fill="none"/></svg>`,
    python:  `<svg viewBox="0 0 24 24"><path d="M11.914 2C9.076 2 7.4 3.18 7.4 4.914V6.8h4.8v.6H5.486C3.75 7.4 2 8.73 2 11.6c0 2.87 1.75 4.2 3.486 4.2h1.114v-2.014c0-2.1 1.55-3.386 3.514-3.386h4.772c1.65 0 2.914-1.35 2.914-2.914V4.914C17.8 3.18 16.124 2 13.286 2h-1.372zM10.4 4.2c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z" fill="#3776ab"/><path d="M12.086 22c2.838 0 4.514-1.18 4.514-2.914V17.2h-4.8v-.6h6.714C20.25 16.6 22 15.27 22 12.4c0-2.87-1.75-4.2-3.486-4.2h-1.114v2.014c0 2.1-1.55 3.386-3.514 3.386H9.114C7.464 13.6 6.2 14.95 6.2 16.514v4.572C6.2 22.82 7.876 22 10.714 22h1.372zM13.6 19.8c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1z" fill="#ffd43b"/></svg>`,
    tableau: `<svg viewBox="0 0 24 24"><rect x="11" y="2" width="2" height="6" fill="#e97627"/><rect x="11" y="16" width="2" height="6" fill="#e97627"/><rect x="2" y="11" width="6" height="2" fill="#e97627"/><rect x="16" y="11" width="6" height="2" fill="#e97627"/><rect x="6.5" y="4.5" width="1.5" height="4.5" fill="#e97627" opacity=".7"/><rect x="16" y="15" width="1.5" height="4.5" fill="#e97627" opacity=".7"/><rect x="4.5" y="16" width="4.5" height="1.5" fill="#e97627" opacity=".7"/><rect x="15" y="6.5" width="4.5" height="1.5" fill="#e97627" opacity=".7"/><rect x="10.25" y="10.25" width="3.5" height="3.5" fill="#e97627"/></svg>`,
    excel:   `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" fill="#217346"/><path d="M8 7l2.5 4L8 15h2l1.5-2.5L13 15h2l-2.5-4L15 7h-2l-1.5 2.5L10 7H8z" fill="white"/></svg>`,
    jupyter: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#f37626" stroke-width="1.5"/><circle cx="7" cy="17" r="1.5" fill="#979797"/><circle cx="17" cy="17" r="1.5" fill="#979797"/><circle cx="12" cy="6.5" r="1.5" fill="#979797"/><path d="M9 12.5c0-1.66 1.34-3 3-3s3 1.34 3 3" stroke="#f37626" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
    git:     `<svg viewBox="0 0 24 24"><path d="M22.27 10.73l-9-9a1.49 1.49 0 00-2.12 0l-1.87 1.87 2.37 2.37a1.77 1.77 0 012.24 2.24l2.29 2.29a1.77 1.77 0 11-1.06 1.06l-2.14-2.14v5.62a1.77 1.77 0 11-1.45 0V9.26a1.77 1.77 0 01-.96-2.32L8.2 4.56l-6.47 6.47a1.49 1.49 0 000 2.12l9 9a1.49 1.49 0 002.12 0l9-9a1.49 1.49 0 00-.58-2.42z" fill="#f05032"/></svg>`,
  };

  function icon(label) {
    return ICONS[label.toLowerCase()] || `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
  }

  function openModal(card) {
    const title  = card.dataset.title  || '';
    const desc   = card.dataset.desc   || '';
    const badge  = card.dataset.badge  || '';
    const tools  = (card.dataset.tools || '').split(',').map(s => s.trim()).filter(Boolean);
    const source = card.dataset.source || '';

    titleEl.textContent = title;
    bodyEl.textContent  = desc;
    badgeEl.textContent = badge === 'ready' ? 'Available' : 'Work in Progress';
    badgeEl.className   = 'modal-badge ' + badge;

    metaEl.innerHTML = tools.length
      ? tools.map(t => `<span class="modal-tool" data-tip="${t}">${icon(t)}</span>`).join('')
      : '';
    metaEl.style.display = tools.length ? '' : 'none';

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

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // hide any lingering tooltip
    const tt = document.getElementById('gTooltip');
    if (tt) tt.classList.remove('visible');
  }

  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      if (card) openModal(card);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

/* ════════════════════════════════════════
   SLIDERS — init after DOM + layout ready
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  /* ── Project slider (horizontal) ── */
  (function () {
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
      const cardW = cards[0].offsetWidth + 12; // 12 = 0.75rem gap
      track.style.transform = `translateX(-${current * visible() * cardW}px)`;
      syncUI();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { buildDots(); goTo(0); }, 100);
    });

    buildDots();
    goTo(0);
  })();

  /* ── Cert slider (vertical, max 3 visible, scroll+touch) ── */
  (function () {
    const wrap    = document.getElementById('certWrap');
    const track   = document.getElementById('certTrack');
    const items   = Array.from(document.querySelectorAll('.cert-item'));
    const prevBtn = document.getElementById('certPrev');
    const nextBtn = document.getElementById('certNext');
    const pipsEl  = document.getElementById('certPips');
    if (!track || !items.length) return;

    const VISIBLE = 3; // max shown at once
    let current = 0;
    const total = items.length;

    function measure() {
      // set wrapper height = exactly VISIBLE items
      const h = items[0].offsetHeight;
      wrap.style.height = (h * VISIBLE) + 'px';
      return h;
    }

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
      nextBtn.disabled = current >= total - VISIBLE;
    }

    function goTo(idx) {
      // clamp so we never scroll past the last item
      current = Math.max(0, Math.min(idx, Math.max(0, total - VISIBLE)));
      const h = items[0].offsetHeight;
      track.style.transform = `translateY(-${current * h}px)`;
      syncUI();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Scroll wheel
    let cooldown = false;
    wrap.addEventListener('wheel', e => {
      e.preventDefault();
      if (cooldown) return;
      cooldown = true;
      goTo(e.deltaY > 0 ? current + 1 : current - 1);
      setTimeout(() => { cooldown = false; }, 500);
    }, { passive: false });

    // Touch swipe
    let ty0 = 0;
    wrap.addEventListener('touchstart', e => { ty0 = e.touches[0].clientY; }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const d = ty0 - e.changedTouches[0].clientY;
      if (Math.abs(d) > 30) goTo(d > 0 ? current + 1 : current - 1);
    }, { passive: true });

    // Wait one frame so layout is complete before measuring
    requestAnimationFrame(() => {
      measure();
      buildPips();
      goTo(0);
      // re-measure on resize
      window.addEventListener('resize', () => { measure(); goTo(current); });
    });
  })();

});
