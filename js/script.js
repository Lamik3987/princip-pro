document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Mobile burger menu toggle
    const burgerBtn = document.getElementById('burger-btn');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;
    let menuOpen = false;

    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(control => {
        if (!control.hasAttribute('aria-label')) {
            control.setAttribute('aria-label', control.getAttribute('placeholder'));
        }
    });

    if (burgerBtn) {
        burgerBtn.addEventListener('click', () => {
            menuOpen = !menuOpen;
            navMenu.classList.toggle('active');
            burgerBtn.setAttribute('aria-expanded', String(menuOpen));
            burgerBtn.setAttribute('aria-label', menuOpen ? 'Закрыть меню' : 'Открыть меню');
            
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

    function closeMobileMenu() {
        if (!menuOpen) return;
        menuOpen = false;
        navMenu.classList.remove('active');
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.setAttribute('aria-label', 'Открыть меню');
        burgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        body.style.overflow = '';
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMobileMenu();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1100) closeMobileMenu();
    });

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
            if (window.innerWidth <= 1100) {
                e.preventDefault();
                const dropdown = parent.nextElementSibling;
                if (dropdown && dropdown.classList.contains('dropdown')) {
                    dropdown.classList.toggle('active');
                }
            }
        });
    });

    // 6. Scroll reveal animations
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

    // 12. Water Process Installation Animation
    if (!prefersReducedMotion) {
        const processStages = document.querySelectorAll('.process-stage');

        if (processStages.length > 0) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateWaterProcess();
                        heroObserver.disconnect();
                    }
                });
            }, { threshold: 0.3 });

            heroObserver.observe(document.querySelector('.hero'));

            function animateWaterProcess() {
                processStages.forEach((stage, index) => {
                    setTimeout(() => {
                        stage.classList.add('active');
                    }, index * 600);
                });
            }
        }
    } else {
        // Show all stages immediately if reduced motion
        document.querySelectorAll('.process-stage').forEach(stage => {
            stage.classList.add('active');
        });
    }

    // 13. Timeline Animation (How It Works)
    const workTimeline = document.getElementById('work-timeline');
    if (workTimeline && !prefersReducedMotion) {
        const timelineItems = workTimeline.querySelectorAll('.timeline-item');
        const timelineConnector = workTimeline.querySelector('.timeline-connector');

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateTimeline();
                    timelineObserver.disconnect();
                }
            });
        }, { threshold: 0.2 });

        timelineObserver.observe(workTimeline);

        function animateTimeline() {
            // Animate the connector line
            if (timelineConnector) {
                timelineConnector.classList.add('animated');
            }

            // Activate each step sequentially
            timelineItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('active');
                }, index * 400);
            });
        }
    } else if (workTimeline) {
        // Show all timeline items immediately if reduced motion
        const timelineConnector = workTimeline.querySelector('.timeline-connector');
        if (timelineConnector) {
            timelineConnector.classList.add('animated');
        }
        workTimeline.querySelectorAll('.timeline-item').forEach(item => {
            item.classList.add('active');
        });
    }
});

/* === EXTRA: Particles, cursor, hero text, counters, tilt === */
(function(){
    // safe guards
    const body = document.body;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Simplified version - removed heavy particle canvas and 3D tilt
    // Keep only essential animations

    // 1) COUNTERS
    const counters = document.querySelectorAll('.number-value');
    if (counters.length){
        const counterObs = new IntersectionObserver((entries, o)=>{
            entries.forEach(entry=>{
                if (entry.isIntersecting){
                    const el = entry.target;
                    const original = el.textContent.trim();
                    if (original.includes('/')) {
                        o.unobserve(el);
                        return;
                    }
                    const match = original.match(/^(\d+)(.*)$/);
                    if (!match) {
                        o.unobserve(el);
                        return;
                    }
                    const target = parseInt(match[1], 10);
                    const suffix = match[2];
                    const dur = 1200; const start = performance.now();
                    function step(now){
                        const t = Math.min(1, (now-start)/dur);
                        el.textContent = Math.floor(target * easeOutCubic(t)) + suffix;
                        if (t < 1) requestAnimationFrame(step);
                        else el.textContent = original;
                    }
                    requestAnimationFrame(step);
                    o.unobserve(el);
                }
            });
        },{threshold:0.3});
        counters.forEach(c=> counterObs.observe(c));
    }
    function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

    // Create dynamic bubbles in water visualization
    const bubblesLayer = document.querySelector('.bubbles-layer');
    if (bubblesLayer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const bubbleCount = 12;
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const x = Math.random() * 1400;
            const startY = 500 + Math.random() * 200;
            const radius = 2 + Math.random() * 4;
            const duration = 6 + Math.random() * 4;
            const delay = Math.random() * 3;

            bubble.setAttribute('class', 'bubble');
            bubble.setAttribute('cx', x);
            bubble.setAttribute('cy', startY);
            bubble.setAttribute('r', radius);
            bubble.setAttribute('fill', 'url(#bubble-gradient)');
            bubble.setAttribute('opacity', '0.5');

            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'cy');
            animate.setAttribute('values', `${startY};${startY - 150};${startY}`);
            animate.setAttribute('dur', `${duration}s`);
            animate.setAttribute('begin', `${delay}s`);
            animate.setAttribute('repeatCount', 'indefinite');

            bubble.appendChild(animate);
            bubblesLayer.appendChild(bubble);
        }
    }

})();

/* End of enhancements */

