/* ════════════════════════════════════════
   THEME TOGGLE
════════════════════════════════════════ */
(function () {
  const html  = document.documentElement;
  const btn   = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  if (saved) html.setAttribute('data-theme', saved);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();

/* ════════════════════════════════════════
   SCROLL PROGRESS BAR
════════════════════════════════════════ */
(function () {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const update = () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ════════════════════════════════════════
   NAVBAR — scroll shadow + active link
════════════════════════════════════════ */
(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const sections = Array.from(document.querySelectorAll('section[id]'));
  const links    = Array.from(document.querySelectorAll('.nav-link'));
  if (!sections.length || !links.length) return;

  const syncActive = () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', syncActive, { passive: true });
  syncActive();
})();

/* ════════════════════════════════════════
   HAMBURGER MENU — targets #mobileNav
════════════════════════════════════════ */
(function () {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  const toggle = (open) => {
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
    nav.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', () => toggle(!btn.classList.contains('open')));

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => toggle(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && btn.classList.contains('open')) toggle(false);
  });
})();

/* ════════════════════════════════════════
   TYPEWRITER EFFECT
════════════════════════════════════════ */
(function () {
  const el = document.getElementById('typingRole');
  if (!el) return;

  const roles   = ['Data Analyst', 'Financial Researcher', 'Problem Solver'];
  let roleIdx   = 0;
  let charIdx   = 0;
  let deleting  = false;
  const PAUSE_AFTER_TYPE   = 1800;
  const PAUSE_AFTER_DELETE = 350;
  const TYPE_SPEED         = 80;
  const DELETE_SPEED       = 45;

  function tick() {
    const current = roles[roleIdx];

    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_AFTER_TYPE);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx  = (roleIdx + 1) % roles.length;
        setTimeout(tick, PAUSE_AFTER_DELETE);
        return;
      }
    }

    setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
  }

  setTimeout(tick, 600);
})();

/* ════════════════════════════════════════
   STAT COUNTERS
════════════════════════════════════════ */
(function () {
  const statsRow = document.querySelector('.stats-row');
  if (!statsRow) return;

  /* Auto-populate targets from live DOM so counts stay in sync */
  const statNums = statsRow.querySelectorAll('.stat-num');
  /* [1] = Projects count */
  if (statNums[1]) {
    const projectCount = document.querySelectorAll('.project-card').length;
    if (projectCount > 0) statNums[1].dataset.target = String(projectCount);
  }
  /* [2] = Tech stack count (marquee cloner hasn't run yet, so items are originals) */
  if (statNums[2]) {
    const techCount = document.querySelectorAll('.stack-track .stack-item').length;
    if (techCount > 0) statNums[2].dataset.target = String(techCount);
  }

  let animated = false;

  const animate = () => {
    if (animated) return;
    animated = true;

    statsRow.querySelectorAll('.stat-num').forEach(el => {
      const target   = parseInt(el.dataset.target, 10);
      const suffix   = el.dataset.suffix || '+';
      const duration = 1400;
      const start    = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      animate();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(statsRow);
})();

/* ════════════════════════════════════════
   FADE-IN ON SCROLL
════════════════════════════════════════ */
(function () {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════
   EXPERIENCE / EDUCATION / CERTIFICATES TABS
════════════════════════════════════════ */
(function () {
  const btns   = document.querySelectorAll('.exp-tab-btn');
  const panels = document.querySelectorAll('.exp-panel');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      panels.forEach(p => p.classList.toggle('hidden', p.id !== 'tab-' + target));
      /* Reveal any fade-in elements that were hidden when the observer ran */
      const activePanel = document.getElementById('tab-' + target);
      activePanel?.querySelectorAll('.fade-in:not(.visible)').forEach(el => el.classList.add('visible'));
    });
  });
})();

/* ════════════════════════════════════════
   PROJECT FILTERS
════════════════════════════════════════ */
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all') {
          card.classList.remove('hidden');
        } else {
          card.classList.toggle('hidden', card.dataset.status !== filter);
        }
      });
    });
  });
})();

/* ════════════════════════════════════════
   CONTACT FORM — validation + FormSubmit AJAX
════════════════════════════════════════ */
(function () {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const fail    = document.getElementById('formFail');
  const submitBtn = document.getElementById('submitBtn');
  const submitOrigHTML = submitBtn ? submitBtn.innerHTML : '';
  if (!form) return;

  const getField = (name) => form.querySelector(`[name="${name}"]`);
  const getError = (id) => document.getElementById('err-' + id);

  const setError = (id, msg) => {
    const group = getField(id)?.closest('.form-group');
    const errEl = getError(id);
    if (group) group.classList.toggle('has-error', !!msg);
    if (errEl) errEl.textContent = msg || '';
  };

  const clearErrors = () => {
    ['name', 'email', 'message'].forEach(id => setError(id, ''));
  };

  const validate = () => {
    let valid = true;
    const name    = getField('name')?.value.trim();
    const email   = getField('email')?.value.trim();
    const message = getField('message')?.value.trim();

    if (!name) {
      setError('name', 'Please enter your name.');
      valid = false;
    }

    if (!email) {
      setError('email', 'Please enter your email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', 'Please enter a valid email address.');
      valid = false;
    }

    if (!message) {
      setError('message', 'Please enter your message.');
      valid = false;
    }

    return valid;
  };

  /* Clear error on input */
  ['name', 'email', 'message'].forEach(id => {
    getField(id)?.addEventListener('input', () => setError(id, ''));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    if (!validate()) return;

    const name    = getField('name').value.trim();
    const email   = getField('email').value.trim();
    const subject = getField('subject')?.value.trim() || '(No subject)';
    const message = getField('message').value.trim();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending…';
    }

    if (success) success.classList.add('hidden');
    if (fail)    fail.classList.add('hidden');

    try {
      const res = await fetch('https://formsubmit.co/ajax/iamvjsenon@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        form.reset();
        if (success) {
          success.classList.remove('hidden');
          setTimeout(() => success.classList.add('hidden'), 5000);
        }
      } else {
        throw new Error('Server error');
      }
    } catch {
      if (fail) {
        fail.classList.remove('hidden');
        setTimeout(() => fail.classList.add('hidden'), 6000);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitOrigHTML;
      }
    }
  });
})();

/* ════════════════════════════════════════
   CERTIFICATE GRID — orphan fix + show more
════════════════════════════════════════ */
(function () {
  const grid = document.querySelector('.cert-grid');
  if (!grid) return;

  const THRESHOLD = 4;
  const cards = Array.from(grid.querySelectorAll('.cert-card'));

  /* Always keep the lone last card centered when count is odd */
  const updateOrphan = () => {
    const visible = cards.filter(c => !c.classList.contains('cert-hidden'));
    cards.forEach(c => c.classList.remove('cert-solo'));
    if (visible.length % 2 !== 0 && visible.length > 0) {
      visible[visible.length - 1].classList.add('cert-solo');
    }
  };

  if (cards.length > THRESHOLD) {
    /* Inject show-more button before the hint text (if any) */
    const hint = grid.parentNode.querySelector('.cert-hint');
    const btn  = document.createElement('button');
    btn.className = 'cert-show-more';
    grid.parentNode.insertBefore(btn, hint || null);

    let expanded = false;
    const hiddenCount = cards.length - THRESHOLD;

    const update = () => {
      cards.forEach((c, i) => c.classList.toggle('cert-hidden', !expanded && i >= THRESHOLD));
      btn.textContent = expanded
        ? 'Show less ↑'
        : `Show ${hiddenCount} more certificate${hiddenCount > 1 ? 's' : ''} ↓`;
      updateOrphan();
    };

    btn.addEventListener('click', () => { expanded = !expanded; update(); });
    update(); /* set initial state */
  } else {
    updateOrphan(); /* just fix orphan, no button needed */
  }
})();

/* ════════════════════════════════════════
   MARQUEE — clone items for seamless loop
════════════════════════════════════════ */
(function () {
  const track = document.querySelector('.stack-track');
  if (!track) return;
  Array.from(track.children).forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
})();

/* ════════════════════════════════════════
   TIMELINE — show more for long panels
════════════════════════════════════════ */
(function () {
  const THRESHOLD = 3;
  document.querySelectorAll('.exp-panel').forEach(panel => {
    const items = Array.from(panel.querySelectorAll('.timeline-item'));
    if (items.length <= THRESHOLD) return;
    let expanded = false;
    const btn = document.createElement('button');
    btn.className = 'timeline-show-more';
    const timeline = panel.querySelector('.timeline');
    if (timeline) timeline.appendChild(btn);
    const hiddenCount = items.length - THRESHOLD;
    const update = () => {
      items.forEach((item, i) => item.classList.toggle('timeline-hidden', !expanded && i >= THRESHOLD));
      btn.textContent = expanded
        ? 'Show less ↑'
        : `Show ${hiddenCount} more entr${hiddenCount > 1 ? 'ies' : 'y'} ↓`;
    };
    btn.addEventListener('click', () => { expanded = !expanded; update(); });
    update();
  });
})();

/* ════════════════════════════════════════
   BACK TO TOP
════════════════════════════════════════ */
(function () {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
