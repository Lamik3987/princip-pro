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

    // particles
    const particles = [];
    const PARTICLE_COUNT = Math.max(18, Math.floor((hero.offsetWidth/120)));
    function initParticles(){
        particles.length = 0;
        for(let i=0;i<PARTICLE_COUNT;i++){
            particles.push({
                x: Math.random()*canvas.width/DPR,
                y: Math.random()*canvas.height/DPR,
                r: 6 + Math.random()*18,
                a: 0.05 + Math.random()*0.6,
                vx: (Math.random()-0.5)*0.2,
                vy: (Math.random()-0.5)*0.3,
                hue: 160 + Math.random()*120
            });
        }
    }
    initParticles();

    let last = performance.now();
    function tick(t){
        const dt = Math.min(40, t-last)/1000;
        last = t;
        ctx.clearRect(0,0,canvas.width/DPR,canvas.height/DPR);
        for(const p of particles){
            p.x += p.vx * (50*dt);
            p.y += p.vy * (50*dt) + Math.sin(t/1000 + p.x)*0.02;

            // wrap
            if (p.x < -50) p.x = canvas.width/DPR + 50;
            if (p.x > canvas.width/DPR + 50) p.x = -50;
            if (p.y < -50) p.y = canvas.height/DPR + 50;
            if (p.y > canvas.height/DPR + 50) p.y = -50;

            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*1.8);
            const color = `hsl(${p.hue}, 80%, 55%)`;
            g.addColorStop(0, color);
            g.addColorStop(0.35, color.replace('55%','30%'));
            g.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
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

