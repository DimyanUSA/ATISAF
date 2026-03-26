/* ============================================================
   АТИСАФ — main.js
   ============================================================ */

/* ── PARTICLES ──────────────────────────────────────────────── */
(function () {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let raf;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function init() {
        particles = [];
        const count = Math.min(
            Math.floor((canvas.width * canvas.height) / 22000),
            42
        );
        for (let i = 0; i < count; i++) {
            particles.push({
                x:  Math.random() * canvas.width,
                y:  Math.random() * canvas.height,
                r:  Math.random() * 1.1 + 0.3,
                a:  Math.random() * 0.11 + 0.03,
                vx: (Math.random() - 0.5) * 0.16,
                vy: (Math.random() - 0.5) * 0.16,
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(240,234,224,${p.a})`;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0)             p.x = canvas.width;
            if (p.x > canvas.width)  p.x = 0;
            if (p.y < 0)             p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
        });

        raf = requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(raf);
        resize();
        init();
        draw();
    });
})();


/* ── SCROLL & LOAD FADE-IN ──────────────────────────────────── */
(function () {
    // Hero elements: animate on page load
    document.querySelectorAll('#hero .fade-in').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), 150 + i * 220);
    });

    // All other sections: animate on scroll into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section .fade-in, #final .fade-in').forEach(el => {
        observer.observe(el);
    });
})();


/* ── SCORING + BEHAVIOURAL UX + FORMS + TOGGLES ────────────── */
(function() {
  const isRU = () => (localStorage.getItem('atisaf-lang') || 'en') === 'ru';

  // ── Scoring system ──────────────────────────────
  let score = parseInt(localStorage.getItem('atisaf-score') || '0');
  let messageShown = false;
  let scrollScored = { forWhom: false, depth: false, bottom: false };
  let slowScrollScore = 0;
  let lastScrollTime = 0;

  // Return visitor
  if (localStorage.getItem('atisaf-visited')) {
    score += 5;
  }
  localStorage.setItem('atisaf-visited', 'true');

  // Time-based scoring
  setTimeout(() => { score += 2; localStorage.setItem('atisaf-score', score); }, 60000);
  setTimeout(() => { score += 3; localStorage.setItem('atisaf-score', score); }, 120000);

  // Scroll-based scoring
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const now = Date.now();

    // Slow reading detection
    if (now - lastScrollTime > 800 && lastScrollTime > 0) {
      if (slowScrollScore < 4) { score += 1; slowScrollScore++; }
    }
    lastScrollTime = now;

    // Section reach scoring
    const forWhomEl = document.getElementById('for-whom');
    const depthEl = document.getElementById('depth');

    if (!scrollScored.forWhom && forWhomEl && scrollY > forWhomEl.offsetTop - 200) {
      score += 3; scrollScored.forWhom = true;
    }
    if (!scrollScored.depth && depthEl && scrollY > depthEl.offsetTop - 200) {
      score += 4; scrollScored.depth = true;
    }
    if (!scrollScored.bottom && (window.innerHeight + scrollY) >= document.body.offsetHeight - 150) {
      scrollScored.bottom = true;
      const lang = isRU() ? 'ru' : 'en';
      const msg = lang === 'ru'
        ? 'Если вы всё ещё здесь — решение уже принято.'
        : 'If you are still here — the decision has already been made.';
      setTimeout(() => showUXMessage(msg, true), 500);
    }

    localStorage.setItem('atisaf-score', score);
  });

  // Orientation toggle scoring
  const orientToggle = document.querySelector('.orientation-toggle');
  const orientBlock = document.querySelector('.orientation-block');
  if (orientToggle) {
    orientToggle.addEventListener('click', () => {
      orientBlock.classList.toggle('open');
      score += 3;
      localStorage.setItem('atisaf-score', score);
    });
  }

  // Deeper layer scoring + trigger
  const deeperToggle = document.querySelector('.orientation-deeper-toggle');
  const deeperBlock = document.querySelector('.orientation-deeper');
  if (deeperToggle) {
    deeperToggle.addEventListener('click', () => {
      deeperBlock.classList.toggle('open');
      score += 6;
      localStorage.setItem('atisaf-score', score);
      const lang = isRU() ? 'ru' : 'en';
      const msg = lang === 'ru'
        ? 'Если вы дошли до этого уровня — вы уже понимаете больше, чем большинство.'
        : "If you've reached this layer, you already understand more than most.";
      setTimeout(() => showUXMessage(msg, true), 2000);
    });
  }

  // Score-based messaging (checked every 10s)
  const getText = (level) => {
    const lang = isRU() ? 'ru' : 'en';
    const texts = {
      ru: {
        low:  'Не всё здесь должно быть понятно сразу.',
        mid:  'Иногда распознавание происходит раньше понимания.',
        high: 'Вы уже понимаете, зачем вы здесь.'
      },
      en: {
        low:  'Not everything here is meant to be understood immediately.',
        mid:  'Recognition often precedes understanding.',
        high: 'You already know why you are here.'
      }
    };
    return texts[lang][level];
  };

  setInterval(() => {
    if (messageShown) return;
    if (score >= 21) {
      showUXMessage(getText('high'), true);
      messageShown = true;
    } else if (score >= 13) {
      showUXMessage(getText('mid'), false);
      messageShown = true;
    } else if (score >= 6) {
      showUXMessage(getText('low'), false);
      messageShown = true;
    }
  }, 10000);

  // ── UX Message display ───────────────────────────
  function showUXMessage(text, withCTA) {
    if (document.querySelector('.ux-message')) return;
    const lang = isRU() ? 'ru' : 'en';
    const ctaText = lang === 'ru' ? '→ Запросить допуск' : '→ Request access';
    const box = document.createElement('div');
    box.className = 'ux-message';
    box.innerHTML = `<p>${text}</p>${withCTA ? `<a href="#recommendation">${ctaText}</a>` : ''}`;
    document.body.appendChild(box);
    setTimeout(() => box.classList.add('visible'), 100);
    setTimeout(() => {
      box.classList.remove('visible');
      setTimeout(() => box.remove(), 600);
    }, 7000);
  }

  // ── Form delays ──────────────────────────────────
  const accessForm = document.getElementById('access-form');
  const formSuccess = document.getElementById('form-success');
  if (accessForm) {
    accessForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(accessForm);
      const res = await fetch(accessForm.action, {
        method: 'POST', body: data, headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        setTimeout(() => {
          accessForm.style.display = 'none';
          formSuccess.style.display = 'block';
        }, 1800);
      }
    });
  }

  const orientationForm = document.getElementById('orientation-form');
  const orientationSuccess = document.getElementById('orientation-success');
  if (orientationForm) {
    orientationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(orientationForm);
      const res = await fetch(orientationForm.action, {
        method: 'POST', body: data, headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        setTimeout(() => {
          orientationForm.style.display = 'none';
          orientationSuccess.style.display = 'block';
        }, 1800);
      }
    });
  }

})();
