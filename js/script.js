document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile burger menu toggle
    const burgerBtn = document.getElementById('burger-btn');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;
    let menuOpen = false;

    if (burgerBtn) {
        burgerBtn.addEventListener('click', () => {
            menuOpen = !menuOpen;
            navMenu.classList.toggle('active');
            
            // Icon swap bars/xmark
            if (menuOpen) {
                burgerBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                body.style.overflow = 'hidden'; // Lock scrolling
            } else {
                burgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                body.style.overflow = ''; // Unlock scrolling
            }
        });
    }

    // 2. Close nav on link click
    const navLinks = document.querySelectorAll('.nav-link:not(.has-dropdown > .nav-link), .dropdown-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuOpen) {
                burgerBtn.click(); // Trigger close logic
            }
        });
    });

    // 3. Header shadow on scroll (> 50px)
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 4. Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Dropdown menu handling for mobile (toggle on click)
    const dropdownParents = document.querySelectorAll('.has-dropdown > .nav-link');
    dropdownParents.forEach(parent => {
        parent.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdown = parent.nextElementSibling;
                if (dropdown && dropdown.classList.contains('dropdown')) {
                    dropdown.classList.toggle('active');
                }
            }
        });
    });

    // 6. Form submission handler
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('.btn');
            
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                const originalBg = submitBtn.style.backgroundColor;
                
                // Visual feedback
                submitBtn.textContent = 'Отправлено!';
                submitBtn.style.backgroundColor = 'var(--accent-color)'; // Success color
                submitBtn.style.color = '#fff';
                
                // Reset form
                form.reset();
                
                // Reset button after 3s
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                }, 3000);
            }
        });
    });

    // 7. Scroll reveal animations
    const revealElements = document.querySelectorAll('.reveal');
    
    // Add .reveal class to major sections if they don't have it (fallback)
    const sections = document.querySelectorAll('.section, .category-section, .service-section');
    sections.forEach(section => {
        if (!section.classList.contains('reveal')) {
            section.classList.add('reveal');
        }
    });

    // Re-select all elements with reveal class
    const elementsToReveal = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Only reveal once
                }
            });
        }, observerOptions);

        elementsToReveal.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        elementsToReveal.forEach(el => el.classList.add('revealed'));
    }

    // 9. Modal Logic
    const modals = document.querySelectorAll('.modal-overlay');
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeBtns = document.querySelectorAll('.modal-close');

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        modals.forEach(modal => modal.classList.remove('active'));
        if (!navMenu.classList.contains('active')) {
            body.style.overflow = '';
        }
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    });

    // 10. Custom Toast Notification for Forms
    function showToast(message) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fa-solid fa-circle-check toast-icon"></i>
            <span class="toast-message">${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Overriding previous form submission to use Toast and close modal
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            if(btn) {
                const originalText = btn.textContent;
                btn.textContent = 'Отправка...';
                btn.disabled = true;

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    this.reset();
                    showToast('Ваша заявка успешно отправлена!');
                    closeModal(); // Close modal if form is inside one
                }, 1000);
            }
        });
    });

    // 11. Lightbox for Portfolio
    const lightboxTriggers = document.querySelectorAll('.project-item');
    if (lightboxTriggers.length > 0) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close"><i class="fa-solid fa-xmark"></i></button>
            <img class="lightbox-img" src="" alt="Project Image">
        `;
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const lightboxClose = lightbox.querySelector('.lightbox-close');

        lightboxTriggers.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img) {
                    lightboxImg.src = img.src;
                    lightbox.classList.add('active');
                    body.style.overflow = 'hidden';
                }
            });
            item.style.cursor = 'pointer';
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            if (!navMenu.classList.contains('active') && !document.querySelector('.modal-overlay.active')) {
                body.style.overflow = '';
            }
        };

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
});

/* === EXTRA: Particles, cursor, hero text, counters, tilt === */
(function(){
    // safe guards
    const body = document.body;
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // 1) PARTICLES CANVAS
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-canvas particle-layer';
    hero.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let DPR = Math.max(1, window.devicePixelRatio || 1);

    function resizeCanvas(){
        canvas.width = Math.floor(hero.offsetWidth * DPR);
        canvas.height = Math.floor(hero.offsetHeight * DPR);
        canvas.style.width = hero.offsetWidth + 'px';
        canvas.style.height = hero.offsetHeight + 'px';
        ctx.setTransform(DPR,0,0,DPR,0,0);
    }
    window.addEventListener('resize', resizeCanvas, {passive:true});
    resizeCanvas();

    // particles (subtle, parallax-follow, always visible above content)
    const particles = [];
    const PARTICLE_COUNT = Math.max(25, Math.floor((hero.offsetWidth/60)));

    // track pointer for parallax
    let pointer = { x: hero.offsetWidth/2, y: hero.offsetHeight/2 };
    window.addEventListener('pointermove', (e)=>{
        const rect = hero.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
    }, {passive:true});

    function initParticles(){
        particles.length = 0;
        const w = canvas.width / DPR; const h = canvas.height / DPR;
        for(let i=0;i<PARTICLE_COUNT;i++){
            const baseX = Math.random()*w;
            const baseY = Math.random()*h;
            particles.push({
                baseX,
                baseY,
                x: baseX,
                y: baseY,
                r: 30 + Math.random()*80,           // larger radius (blobs)
                a: 0.15 + Math.random()*0.3,     // more alpha
                vx: (Math.random()-0.5)*0.06,
                vy: (Math.random()-0.5)*0.06,
                hue: 190 + Math.random()*60,
                parallax: 0.02 + Math.random()*0.12 // how strongly follows pointer
            });
        }
    }
    initParticles();

    let last = performance.now();
    let parallaxOffset = { x:0, y:0 };
    function tick(t){
        const dt = Math.min(40, t-last)/1000;
        last = t;
        ctx.clearRect(0,0,canvas.width/DPR,canvas.height/DPR);

        // smooth parallax target toward pointer center
        const cx = hero.offsetWidth/2; const cy = hero.offsetHeight/2;
        const targetOffsetX = (pointer.x - cx) * 0.08; // sensitivity
        const targetOffsetY = (pointer.y - cy) * 0.06;
        parallaxOffset.x += (targetOffsetX - parallaxOffset.x) * 0.12;
        parallaxOffset.y += (targetOffsetY - parallaxOffset.y) * 0.12;

        for(const p of particles){
            // base oscillation
            p.baseX += Math.sin((t/1000) + p.hue) * 0.02 * (p.r/4);
            p.baseY += Math.cos((t/900) + p.hue) * 0.02 * (p.r/6);

            // position = base + small motion + parallax
            p.x += ( (p.baseX + parallaxOffset.x * p.parallax) - p.x ) * 0.08 + p.vx;
            p.y += ( (p.baseY + parallaxOffset.y * p.parallax) - p.y ) * 0.08 + p.vy;

            // wrap gently
            const W = canvas.width/DPR; const H = canvas.height/DPR;
            if (p.x < -30) p.x = W + 30;
            if (p.x > W + 30) p.x = -30;
            if (p.y < -30) p.y = H + 30;
            if (p.y > H + 30) p.y = -30;

            // subtle gradient, low alpha
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*2.2);
            const baseColor = `hsla(${p.hue}, 65%, 60%, ${p.a})`;
            g.addColorStop(0, baseColor);
            g.addColorStop(0.35, `hsla(${p.hue}, 60%, 50%, ${p.a*0.45})`);
            g.addColorStop(1, 'rgba(255,255,255,0)');

            // removed screen mode // keep soft and visible over text
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fill();
        }
        // restored source-over
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);


    // 2) CUSTOM CURSOR
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    let mouseX=0, mouseY=0, cx=0, cy=0;
    document.addEventListener('mousemove', (e)=>{ mouseX=e.clientX; mouseY=e.clientY; cursor.style.left = (e.clientX)+'px'; cursor.style.top = (e.clientY)+'px'; });
    // enlarge on interactive elements
    ['a','button','.btn','.project-item','.routing-card','.nav-link'].forEach(sel=>{
        document.querySelectorAll(sel).forEach(el=>{
            el.addEventListener('mouseenter', ()=>{ cursor.classList.add('big'); });
            el.addEventListener('mouseleave', ()=>{ cursor.classList.remove('big'); });
        });
    });

    // 3) HERO TITLE SPLIT & STAGGER
    const title = document.querySelector('.hero-title');
    if (title){
        const text = title.textContent.trim();
        title.textContent = '';
        const frag = document.createDocumentFragment();
        for(let i=0;i<text.length;i++){
            const ch = document.createElement('span');
            ch.className = 'char';
            ch.textContent = (text[i] === ' ' ? '\u00A0' : text[i]);
            ch.style.transitionDelay = (i*28)+'ms';
            frag.appendChild(ch);
        }
        title.appendChild(frag);
        // start animation when hero visible
        const obs = new IntersectionObserver((entries, o)=>{
            entries.forEach(e=>{ if (e.isIntersecting){ title.classList.add('animate'); o.disconnect(); } });
        },{threshold:0.2});
        obs.observe(title);
    }

    // 4) TILT EFFECT FOR .routing-card
    document.querySelectorAll('.routing-card').forEach(card => {
        const inner = document.createElement('div');
        inner.className = 'card-inner';
        while(card.firstChild) inner.appendChild(card.firstChild);
        card.appendChild(inner);

        card.addEventListener('mousemove', (ev)=>{
            const rect = card.getBoundingClientRect();
            const px = (ev.clientX - rect.left) / rect.width;
            const py = (ev.clientY - rect.top) / rect.height;
            const rotY = (px - 0.5) * 12; // deg
            const rotX = (0.5 - py) * 8;
            inner.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) translateZ(12px)`;
        });
        card.addEventListener('mouseleave', ()=>{ inner.style.transform = ''; });
    });

    // 5) COUNTERS
    const counters = document.querySelectorAll('.number-value');
    if (counters.length){
        const counterObs = new IntersectionObserver((entries, o)=>{
            entries.forEach(entry=>{
                if (entry.isIntersecting){
                    const el = entry.target;
                    const target = parseInt(el.textContent.replace(/[^0-9]/g,'')) || 0;
                    let v = 0; const dur = 1200; const start = performance.now();
                    function step(now){
                        const t = Math.min(1, (now-start)/dur);
                        el.textContent = Math.floor(v + (target - v) * easeOutCubic(t));
                        if (t < 1) requestAnimationFrame(step);
                        else el.textContent = (target>=1000? (Math.round(target/100)/10+'k') : target);
                    }
                    requestAnimationFrame(step);
                    o.unobserve(el);
                }
            });
        },{threshold:0.3});
        counters.forEach(c=> counterObs.observe(c));
    }
    function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

    // 6) make sure canvas resizes with hero changes
    new ResizeObserver(() => {
        resizeCanvas();
        // re-init count if needed
        if (particles.length < Math.max(14, Math.floor(hero.offsetWidth/120))) initParticles();
    }).observe(hero);

    // 7) keyboard accessibility: hide custom cursor on keyboard navigation
    window.addEventListener('keydown', (e)=>{ if (e.key === 'Tab') cursor.style.display = 'none'; });
    window.addEventListener('mousedown', ()=> cursor.style.display = 'block');

})();

/* End of enhancements */



