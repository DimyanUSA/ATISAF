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


/* ── FORM HANDLING (Formspree AJAX) ─────────────────────────── */
(function () {
    const form    = document.getElementById('access-form');
    const success = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = '...';
        btn.disabled = true;

        try {
            const res = await fetch(form.action, {
                method:  'POST',
                body:    new FormData(form),
                headers: { 'Accept': 'application/json' },
            });

            if (res.ok) {
                setTimeout(() => {
                    form.style.display    = 'none';
                    success.style.display = 'block';
                }, 1800);
            } else {
                throw new Error('server error');
            }
        } catch {
            btn.textContent = original;
            btn.disabled    = false;
            alert('Произошла ошибка при отправке. Попробуйте ещё раз.');
        }
    });
})();


/* ── ORIENTATION FORM HANDLING ─────────────────────────────── */
(function () {
    const orientationForm = document.getElementById('orientation-form');
    const orientationSuccess = document.getElementById('orientation-success');
    if (!orientationForm) return;

    orientationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = orientationForm.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = '...';
        btn.disabled = true;

        try {
            const res = await fetch(orientationForm.action, {
                method:  'POST',
                body:    new FormData(orientationForm),
                headers: { 'Accept': 'application/json' },
            });

            if (res.ok) {
                setTimeout(() => {
                    orientationForm.style.display    = 'none';
                    orientationSuccess.style.display = 'block';
                }, 1800);
            } else {
                throw new Error('server error');
            }
        } catch {
            btn.textContent = original;
            btn.disabled    = false;
            alert('Произошла ошибка при отправке. Попробуйте ещё раз.');
        }
    });
})();


/* ── ORIENTATION TOGGLE ──────────────────────────────────────── */
(function () {
    const orientToggle = document.querySelector('.orientation-toggle');
    const orientBlock  = document.querySelector('.orientation-block');
    const deeperToggle = document.querySelector('.orientation-deeper-toggle');
    const deeperBlock  = document.querySelector('.orientation-deeper');

    if (orientToggle) {
        orientToggle.addEventListener('click', () => {
            orientBlock.classList.toggle('open');
        });
    }

    if (deeperToggle) {
        deeperToggle.addEventListener('click', () => {
            deeperBlock.classList.toggle('open');
        });
    }
})();


// ── Behavioural UX Logic ──────────────────────────
(function() {
  const isRU = () => (localStorage.getItem('atisaf-lang') || 'en') === 'ru';

  const messages = {
    en: {
      deeper: "If you've reached this layer, you already understand more than most.",
      time60: "Not everything here is meant to be understood immediately.",
      time90: "At this point, most already know whether they are ready.",
      scroll: "If you are still here — the decision has already been made."
    },
    ru: {
      deeper: "Если вы дошли до этого уровня — вы уже понимаете больше, чем большинство.",
      time60: "Не всё здесь предназначено для немедленного понимания.",
      time90: "В этой точке большинство уже знают — готовы они или нет.",
      scroll: "Если вы всё ещё здесь — решение уже принято."
    }
  };

  let startTime = Date.now();
  let openedDeeper = false;
  let messageShown = false;
  let scrollMessageShown = false;

  function showUXMessage(text, withCTA) {
    if (document.querySelector('.ux-message')) return;
    const lang = isRU() ? 'ru' : 'en';
    const box = document.createElement('div');
    box.className = 'ux-message';
    box.innerHTML = `<p>${text}</p>${withCTA ? `<a href="#recommendation">${lang === 'ru' ? '→ Запросить допуск' : '→ Request access'}</a>` : ''}`;
    document.body.appendChild(box);
    setTimeout(() => box.classList.add('visible'), 100);
    setTimeout(() => {
      box.classList.remove('visible');
      setTimeout(() => box.remove(), 600);
    }, 6000);
  }

  // Deeper layer trigger
  const deeperBtn = document.querySelector('.orientation-deeper-toggle');
  if (deeperBtn) {
    deeperBtn.addEventListener('click', () => {
      openedDeeper = true;
      const lang = isRU() ? 'ru' : 'en';
      setTimeout(() => showUXMessage(messages[lang].deeper, true), 2000);
    });
  }

  // Time-based triggers
  const timeCheck = setInterval(() => {
    if (messageShown) { clearInterval(timeCheck); return; }
    const elapsed = (Date.now() - startTime) / 1000;
    const lang = isRU() ? 'ru' : 'en';
    if (elapsed > 90 && !openedDeeper) {
      showUXMessage(messages[lang].time90, false);
      messageShown = true;
    } else if (elapsed > 60 && !openedDeeper) {
      showUXMessage(messages[lang].time60, false);
      messageShown = true;
    }
  }, 5000);

  // Scroll to bottom trigger
  window.addEventListener('scroll', () => {
    if (scrollMessageShown) return;
    const scrolled = window.innerHeight + window.scrollY;
    const total = document.body.offsetHeight;
    if (scrolled >= total - 150) {
      scrollMessageShown = true;
      const lang = isRU() ? 'ru' : 'en';
      setTimeout(() => showUXMessage(messages[lang].scroll, true), 500);
    }
  });

  // Return visitor
  if (localStorage.getItem('atisaf-visited')) {
    const lang = isRU() ? 'ru' : 'en';
    const returnMsg = lang === 'ru' ? 'Вы уже были здесь.' : 'You have been here before.';
    setTimeout(() => showUXMessage(returnMsg, false), 3000);
  }
  localStorage.setItem('atisaf-visited', 'true');
})();
