/* ============================================================
   RUTH NASSIWA — 3D LOVING NAV BEHAVIOR
   ============================================================ */

(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinksContainer = nav.querySelector('.nav-links');
  const navLinks = Array.from(nav.querySelectorAll('.nav-links a'));

  /* -----------------------------------------------------------
     1. MOBILE MENU TOGGLE (with ARIA + outside click + Esc)
     ----------------------------------------------------------- */
  const setMenu = (open) => {
    nav.dataset.open = String(open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  const isMenuOpen = () => nav.dataset.open === 'true';

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenu(!isMenuOpen());
  });

  // close when clicking a link (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMenuOpen()) setMenu(false);
    });
  });

  // close when clicking outside
  document.addEventListener('click', (e) => {
    if (!isMenuOpen()) return;
    if (!nav.contains(e.target)) setMenu(false);
  });

  // close with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen()) {
      setMenu(false);
      navToggle.focus();
    }
  });

  /* -----------------------------------------------------------
     2. ACTIVE LINK HIGHLIGHT ON SCROLL
     ----------------------------------------------------------- */
  const sections = Array.from(document.querySelectorAll('section[id]'));

  const setActiveLink = (id) => {
    navLinks.forEach(link => {
      const href = link.getAttribute('href').slice(1);
      link.classList.toggle('active', href === id);
    });
  };

  const onScroll = () => {
    const offset = window.scrollY + 140;
    let current = sections.length ? sections[0].id : 'home';

    for (const section of sections) {
      if (section.offsetTop <= offset) {
        current = section.id;
      } else {
        break;
      }
    }

    // highlight matching link
    setActiveLink(current);
  };

  // throttle with rAF
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('load', onScroll);

  /* -----------------------------------------------------------
     3. 3D TILT ON THE NAV BAR (subtle, mouse-driven)
     ----------------------------------------------------------- */
  const navInner = nav.querySelector('.nav-inner');
  let rafId = null;

  const resetTilt = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      navInner.style.transform = '';
    });
  };

  nav.addEventListener('mousemove', (e) => {
    if (window.matchMedia('(max-width: 900px)').matches) return;

    const rect = navInner.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateY = x * 4;     // max ~2deg
    const rotateX = -y * 3;    // max ~1.5deg

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      navInner.style.transform =
        `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(0)`;
    });
  });

  nav.addEventListener('mouseleave', resetTilt);

  /* -----------------------------------------------------------
     4. SMOOTH HOVER SCALE ON THE BRAND (extra love)
     ----------------------------------------------------------- */
  // handled in CSS; nothing needed here.

  /* -----------------------------------------------------------
     5. Subtle glow pulse on CTA hover (already in CSS) — no JS.
     ----------------------------------------------------------- */

  /* -----------------------------------------------------------
     6. Keyboard focus indicator for accessibility on the links
     (already covered in CSS with :focus-visible)
     ----------------------------------------------------------- */

})();

/* ============================================================
   MOBILE MENU — OPEN / CLOSE / FOCUS-TRAP / STAGGER
   ============================================================ */

(function () {
  'use strict';

  const nav       = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!navToggle || !mobileMenu) return; // safety

  const menuLinks = Array.from(mobileMenu.querySelectorAll('a'));
  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /* -----------------------------------------------------------
     STATE
     ----------------------------------------------------------- */
  const isOpen = () => mobileMenu.classList.contains('is-open');

  const openMenu = () => {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open');

    // move focus into the menu after the animation begins
    window.setTimeout(() => {
      const first = mobileMenu.querySelector(focusableSelector);
      if (first) first.focus({ preventScroll: true });
    }, 180);
  };

  const closeMenu = (returnFocus = true) => {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');

    if (returnFocus) navToggle.focus({ preventScroll: true });
  };

  const toggleMenu = () => (isOpen() ? closeMenu() : openMenu());

  /* -----------------------------------------------------------
     1. TOGGLE BUTTON
     ----------------------------------------------------------- */
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  /* -----------------------------------------------------------
     2. CLOSE WHEN A MENU LINK IS CLICKED
     ----------------------------------------------------------- */
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen()) closeMenu(false); // don't steal focus — the anchor will scroll
    });
  });

  /* -----------------------------------------------------------
     3. CLOSE ON OUTSIDE CLICK
     ----------------------------------------------------------- */
  document.addEventListener('click', (e) => {
    if (!isOpen()) return;
    // ignore clicks on the toggle (handled above) and inside the menu
    if (navToggle.contains(e.target)) return;
    if (mobileMenu.contains(e.target)) return;
    closeMenu();
  });

  /* -----------------------------------------------------------
     4. CLOSE ON ESCAPE
     ----------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      closeMenu();
    }
  });

  /* -----------------------------------------------------------
     5. FOCUS TRAP (keep Tab inside the menu while open)
     ----------------------------------------------------------- */
  mobileMenu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !isOpen()) return;

    const focusables = Array.from(mobileMenu.querySelectorAll(focusableSelector))
      .filter(el => el.offsetParent !== null); // visible only

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last  = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* -----------------------------------------------------------
     6. RESIZE SAFETY — close menu if viewport grows past mobile
     ----------------------------------------------------------- */
  const mq = window.matchMedia('(min-width: 901px)');
  mq.addEventListener('change', (e) => {
    if (e.matches && isOpen()) closeMenu(false);
  });

  /* -----------------------------------------------------------
     7. SIMPLE SWIPE-TO-CLOSE (optional, mobile only)
     ----------------------------------------------------------- */
  let touchStartY = 0;
  mobileMenu.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  mobileMenu.addEventListener('touchend', (e) => {
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (dy > 80) closeMenu(); // swipe down to close
  }, { passive: true });

})();


/* ============================================================
   HERO 3D — three-hero.js
   Particle field + pointer parallax (dots only, no knot)
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

  const s = document.createElement('script');
  s.src = THREE_URL;
  s.async = true;
  s.onload = boot;
  s.onerror = () => { canvas.style.display = 'none'; };
  document.head.appendChild(s);

  function boot() {
    const THREE = window.THREE;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06050a, 0.03);

    const camera = new THREE.PerspectiveCamera(52, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0);

    /* ---------- LIGHTS (kept for future meshes; harmless) ---------- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const l1 = new THREE.PointLight(0xff4d9f, 22, 60);
    l1.position.set(-8, 6, 8);
    scene.add(l1);

    const l2 = new THREE.PointLight(0xb45eff, 22, 60);
    l2.position.set(10, -4, 6);
    scene.add(l2);

    const l3 = new THREE.PointLight(0xc6ff4d, 14, 50);
    l3.position.set(0, 8, -6);
    scene.add(l3);

    /* ---------- PARTICLE FIELD ---------- */
    const COUNT = prefersReduced ? 500 : 2000;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const cA = new THREE.Color('#ff4d9f');
    const cB = new THREE.Color('#b45eff');
    const cC = new THREE.Color('#c6ff4d');
    const tmp = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const r = 8 + Math.random() * 26;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      positions[i*3]   = r * Math.sin(ph) * Math.cos(th);
      positions[i*3+1] = r * Math.sin(ph) * Math.sin(th) * 0.8;
      positions[i*3+2] = r * Math.cos(ph);

      const t = Math.random();
      if (t > 0.93) tmp.copy(cC);
      else if (t > 0.5) tmp.copy(cA).lerp(cB, (t - 0.5) * 2);
      else tmp.copy(cB).lerp(cA, t * 2);

      colors[i*3]   = tmp.r;
      colors[i*3+1] = tmp.g;
      colors[i*3+2] = tmp.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // soft round sprite
    const sp = document.createElement('canvas');
    sp.width = sp.height = 64;
    const cx = sp.getContext('2d');
    const g = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = g;
    cx.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(sp);

    const pMat = new THREE.PointsMaterial({
      size: 0.9, sizeAttenuation: true, vertexColors: true,
      transparent: true, opacity: 0.95, depthWrite: false,
      blending: THREE.AdditiveBlending, map: sprite, alphaTest: 0.01,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    /* ---------- POINTER PARALLAX ---------- */
    const p = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', (e) => {
      p.tx = (e.clientX / window.innerWidth) * 2 - 1;
      p.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    /* ---------- RESIZE ---------- */
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', resize);
    resize();

    /* ---------- ANIMATE ---------- */
    let raf = null;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      p.x += (p.tx - p.x) * 0.05;
      p.y += (p.ty - p.y) * 0.05;

      // particles drift
      points.rotation.y = t * 0.04 + p.x * 0.35;
      points.rotation.x = p.y * 0.25;

      // camera parallax
      camera.position.x = p.x * 3;
      camera.position.y = -p.y * 2;
      camera.lookAt(0, 0, 0);

      // lights orbit slightly
      l1.position.x = Math.cos(t * 0.5) * 10;
      l1.position.z = Math.sin(t * 0.5) * 10;
      l2.position.x = Math.cos(t * 0.4 + 2) * 10;
      l2.position.z = Math.sin(t * 0.4 + 2) * 10;

      renderer.render(scene, camera);
    };

    // pause when hero out of view
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { if (!raf) animate(); }
        else if (raf) { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0.05 });
    io.observe(canvas);

    if (!prefersReduced) animate();
    else renderer.render(scene, camera);
  }
})();

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   Adds .is-visible when elements enter the viewport
   ============================================================ */

(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) {
    // fallback for ancient browsers — show everything
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // once revealed, no need to watch anymore
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,          // 15% of element visible triggers
      rootMargin: '0px 0px -8% 0px', // small bottom buffer
    }
  );

  document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
    observer.observe(el);
  });

  /* -----------------------------------------------------------
     Auto-apply stagger indices to children of .reveal-stagger
     ----------------------------------------------------------- */
  document.querySelectorAll('.reveal-stagger').forEach((parent) => {
    Array.from(parent.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
    });
  });
})();

/* ============================================================
   REVEAL SYSTEM — shatter words + per-card arrivals
   ============================================================ */

   /* ---------- 5. CARD VARIANT assignment + individual observation ---------- */
const ioCards = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      ioCards.unobserve(entry.target);
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
);

const tagCards = (selector, variant) => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal', `reveal-${variant}`);
    el.style.setProperty('--card-i', i);
    ioCards.observe(el);   // ← KEY: observe each card individually
  });
};

tagCards('.ledger-cell', 'flip');
tagCards('.trait', 'rise');
tagCards('.interest', 'corner');
tagCards('.project', 'curtain');
tagCards('.edu', 'unfurl');
tagCards('.intro-photo', 'peel');
tagCards('.contact-form', 'from-right');
tagCards('.contact-left', 'from-left');
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, .reveal-stagger, [data-split-words]')
      .forEach(el => el.classList.add('is-visible'));
    return;
  }

  /* ---------- 1. Split into letters ---------- */
  document.querySelectorAll('[data-split-words]').forEach((el) => {
    const splitLettersIn = (node) => {
      if (node.nodeType === 3) {
        const text = node.textContent;
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        for (const ch of text) {
          if (ch === ' ') frag.appendChild(document.createTextNode(' '));
          else {
            const s = document.createElement('span');
            s.className = 'shatter-letter';
            s.textContent = ch;
            frag.appendChild(s);
          }
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        if (node.tagName === 'BR') return;
        Array.from(node.childNodes).forEach(splitLettersIn);
      }
    };
    Array.from(el.childNodes).forEach(splitLettersIn);
  });

  /* ---------- 2. Wrap runs into words ---------- */
  document.querySelectorAll('[data-split-words]').forEach((el) => {
    const wrapRuns = (parent) => {
      let run = [];
      Array.from(parent.childNodes).forEach((child) => {
        if (child.nodeType === 1 && child.classList.contains('shatter-letter')) {
          run.push(child);
        } else {
          if (run.length) {
            const w = document.createElement('span');
            w.className = 'shatter-word';
            run[0].parentNode.insertBefore(w, run[0]);
            run.forEach(r => w.appendChild(r));
            run = [];
          }
          if (child.nodeType === 1 && child.children.length) wrapRuns(child);
        }
      });
      if (run.length) {
        const w = document.createElement('span');
        w.className = 'shatter-word';
        run[0].parentNode.insertBefore(w, run[0]);
        run.forEach(r => w.appendChild(r));
      }
    };
    wrapRuns(el);
  });

  /* ---------- 3. Random 3D origin per word ---------- */
  const origins = [
    { x: -140, y: 100, z: -300, rot: 120 },
    { x: 160, y: -90, z: -260, rot: -100 },
    { x: -180, y: -140, z: -340, rot: 80 },
    { x: 200, y: 160, z: -280, rot: -140 },
    { x: 0, y: 220, z: -300, rot: 60 },
    { x: 0, y: -220, z: -300, rot: -60 },
  ];

  document.querySelectorAll('[data-split-words]').forEach((el) => {
    el.querySelectorAll('.shatter-word').forEach((word, i) => {
      word.style.setProperty('--word-i', i);
      const o = origins[i % origins.length];
      word.style.setProperty('--x', o.x + 'px');
      word.style.setProperty('--y', o.y + 'px');
      word.style.setProperty('--z', o.z + 'px');
      word.style.setProperty('--rot', o.rot + 'deg');
      word.querySelectorAll('.shatter-letter').forEach((l, li) => {
        l.style.setProperty('--letter-i', li);
      });
    });
  });

  /* ---------- 4. Observe top-level reveal blocks ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -12% 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-stagger, [data-split-words]').forEach((el) => {
    if (el.classList.contains('reveal-stagger')) {
      Array.from(el.children).forEach((c, i) => c.style.setProperty('--i', i));
    }
    io.observe(el);
  });

  /* ---------- 5. Tag cards + observe individually ---------- */
  const ioCards = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        ioCards.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  const tagCards = (selector, variant) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal', `reveal-${variant}`);
      el.style.setProperty('--card-i', i);
      ioCards.observe(el);
    });
  };

  tagCards('.ledger-cell', 'flip');
  tagCards('.trait', 'rise');
  tagCards('.interest', 'corner');
  tagCards('.project', 'curtain');
  tagCards('.edu', 'unfurl');
  tagCards('.intro-photo', 'peel');
  tagCards('.contact-form', 'from-right');
  tagCards('.contact-left', 'from-left');

  /* ---------- 6. Safety fallback ---------- */
  setTimeout(() => {
    document.querySelectorAll('.reveal, .reveal-stagger, [data-split-words]')
      .forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight) {
            el.classList.add('is-visible');
          }
        }
      });
  }, 1500);

})();

/* ============================================================
   SKILLS TABS — switch active panel on click
   ============================================================ */
(function () {
  'use strict';

  const tabs = document.querySelectorAll('.skill-tab');
  const panels = document.querySelectorAll('.skill-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      const nextPanel = document.getElementById(`panel-${target}`);
      if (!nextPanel) return;

      // deactivate all
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => {
        p.classList.remove('active');
        // reset the entrance animation so it replays
        p.style.animation = 'none';
        p.offsetHeight; // force reflow
        p.style.animation = '';
      });

      // activate clicked
      tab.classList.add('active');
      nextPanel.classList.add('active');
    });
  });
})();


/* ============================================================
   CONTACT — aurora follow + magnetic send button
   ============================================================ */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const section = document.querySelector('.section-contact');
  const aurora = document.querySelector('.contact-aurora');
  const sendBtn = document.getElementById('sendBtn');

  /* ---------------------------------------------------------
     1. AURORA follows the cursor across the whole section
     --------------------------------------------------------- */
  if (section && aurora) {
    let raf = null;
    let targetX = 20, targetY = 30;
    let currentX = 20, currentY = 30;
    let targetX2 = 80, targetY2 = 70;
    let currentX2 = 80, currentY2 = 70;

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      targetX = x;
      targetY = y;
      // second glow drifts the opposite way
      targetX2 = 100 - x;
      targetY2 = 100 - y;
    });

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      currentX2 += (targetX2 - currentX2) * 0.06;
      currentY2 += (targetY2 - currentY2) * 0.06;

      aurora.style.setProperty('--mx', currentX + '%');
      aurora.style.setProperty('--my', currentY + '%');
      aurora.style.setProperty('--mx2', currentX2 + '%');
      aurora.style.setProperty('--my2', currentY2 + '%');

      raf = requestAnimationFrame(animate);
    };
    animate();
  }

  /* ---------------------------------------------------------
     2. MAGNETIC send button — pulls toward the cursor
     --------------------------------------------------------- */
  if (sendBtn) {
    const strength = 0.35;
    const maxPull = 24;

    sendBtn.addEventListener('mousemove', (e) => {
      const rect = sendBtn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = (e.clientX - centerX) * strength;
      let dy = (e.clientY - centerY) * strength;
      dx = Math.max(-maxPull, Math.min(maxPull, dx));
      dy = Math.max(-maxPull, Math.min(maxPull, dy));
      sendBtn.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
    });

    sendBtn.addEventListener('mouseleave', () => {
      sendBtn.style.transform = '';
    });

    // press feedback
    sendBtn.addEventListener('mousedown', () => {
      sendBtn.style.transform += ' scale(0.96)';
    });
    sendBtn.addEventListener('mouseup', () => {
      sendBtn.style.transform = '';
    });
  }

  /* ---------------------------------------------------------
     3. FORM submit — flash + reset (visual demo only)
     --------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // validate
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.classList.add('is-sent');
      setTimeout(() => form.classList.remove('is-sent'), 800);

      // show confirmation
      const note = document.getElementById('formNote');
      const original = note.textContent;
      note.textContent = 'Message ready — connect Formspree, EmailJS or your API to send.';
      note.style.color = 'var(--hl, #d4ff3a)';
      setTimeout(() => {
        note.textContent = original;
        note.style.color = '';
      }, 4000);

      form.reset();
    });
  }
})();