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
