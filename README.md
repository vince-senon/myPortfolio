# Vince Joshua Senon — Portfolio

Personal portfolio site built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step.  
Live at: [vince-senon.github.io/myPortfolio](https://vince-senon.github.io/myPortfolio)

---

## Features

- Dark / light theme toggle with `localStorage` persistence
- Typewriter effect cycling role titles in the hero
- Scroll-triggered fade-in animations on every section
- Animated stat counters (count-up on scroll entry)
- Floating icon animation on the tech stack grid
- Project filter tabs (All / Available / In Progress)
- 3-tab Experience section (Experience / Education / Certificates)
- Contact form with client-side validation + FormSubmit AJAX delivery
- Scroll progress bar, back-to-top button, mobile nav overlay
- Responsive down to 400 px; respects `prefers-reduced-motion`

---

## Folder Structure

```
myPortfolio/
├── index.html              # Main page
├── favicon.svg             # VS initials favicon
├── css/
│   └── style.css           # All styles + CSS custom properties
├── js/
│   └── main.js             # All interactive behaviour
├── assets/
│   ├── resume.pdf          # Downloadable CV
│   ├── project-forest.jpg  # Project thumbnail
│   └── project-commute.jpg # Project thumbnail
└── README.md
```

---

## Contact Form Setup

The form uses [FormSubmit.co](https://formsubmit.co) for email delivery — no backend required.

**One-time activation required:**
1. Deploy the site and submit the contact form once.
2. FormSubmit sends a confirmation email to `iamvjsenon@gmail.com`.
3. Click **Confirm** in that email.
4. All future submissions are delivered directly to your inbox.

---

## Tech Stack Grid Icons

Tool logos are served from the [SimpleIcons CDN](https://simpleicons.org) (`cdn.simpleicons.org`).  
SQL uses a custom inline SVG since there is no official SQL brand logo.

---

## Adding Content

### Add a new Project

Find the `<!-- PROJECTS -->` section in `index.html` and copy-paste this block inside `.projects-grid`:

```html
<div class="project-card fade-in" data-status="available">
  <!-- data-status: "available" | "in-progress" -->
  <div class="project-img">
    <img src="assets/your-image.jpg" alt="Project Name" loading="lazy"/>
  </div>
  <div class="project-body">
    <div class="project-meta">
      <span class="project-tag">Python</span>
      <span class="project-tag">SQL</span>
    </div>
    <h3 class="project-title">Your Project Title</h3>
    <p class="project-desc">A short description of what the project does and the impact it had.</p>
    <div class="project-links">
      <a href="https://github.com/..." target="_blank" class="btn btn-sm btn-outline">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12..."/></svg>
        GitHub
      </a>
      <a href="#" class="btn btn-sm btn-primary">View Project →</a>
    </div>
  </div>
</div>
```

The filter buttons (`All` / `Available` / `In Progress`) read the `data-status` attribute automatically — no JS changes needed.

---

### Add a Work Experience Entry

Find `<div class="timeline" id="tab-experience">` and add inside `.timeline`:

```html
<div class="timeline-item fade-in">
  <div class="timeline-dot"></div>
  <div class="timeline-content">
    <div class="timeline-header">
      <h3 class="timeline-title">Job Title</h3>
      <span class="timeline-period">Jan 2024 – Present</span>
    </div>
    <p class="timeline-company">Company Name</p>
    <ul class="timeline-bullets">
      <li>Achievement or responsibility one.</li>
      <li>Achievement or responsibility two.</li>
    </ul>
  </div>
</div>
```

If there are more than 3 entries in a panel, a **Show more** button appears automatically (no changes needed).

---

### Add an Education Entry

Same structure as Work Experience — find `<div id="tab-education">` and add a `.timeline-item` block inside its `.timeline` div.

---

### Add a Certificate

Find `<div class="cert-grid">` inside the Certificates tab and add:

```html
<div class="cert-card fade-in">
  <div class="cert-icon">
    <!-- Optional: small icon or initials badge -->
    <span>GC</span>
  </div>
  <div class="cert-body">
    <h4 class="cert-title">Certificate Name</h4>
    <p class="cert-issuer">Issuing Organization</p>
    <span class="cert-date">Month Year</span>
  </div>
</div>
```

If there are more than 4 certificates, a **Show more** button appears automatically.

---

### Add a Tech Stack Item

Find `<div class="stack-track">` and add inside it (before the closing tag):

```html
<div class="stack-item">
  <div class="stack-icon">
    <img src="https://cdn.simpleicons.org/toolname/hex-color" alt="Tool Name" width="52" height="52"/>
  </div>
  <span class="stack-label">Tool Name</span>
</div>
```

Replace `toolname` with the slug from [simpleicons.org](https://simpleicons.org) and `hex-color` with the brand's hex color (without `#`). The stat counter in the About section will pick up the new count automatically on next page load.
