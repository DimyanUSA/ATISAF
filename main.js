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
                form.style.display    = 'none';
                success.style.display = 'block';
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
