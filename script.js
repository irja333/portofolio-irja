/* ========================================
   IRJA ZAHIDI PORTFOLIO - Interactive JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Initial language check
    const currentLang = localStorage.getItem('lang') || 'id';
    if (currentLang === 'en') {
        document.body.classList.add('lang-en');
    }

    // ========================================
    // 1. PARTICLE BACKGROUND
    // ========================================
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse interaction - subtle attraction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.x += dx * 0.002;
                this.y += dy * 0.002;
                this.opacity = Math.min(this.opacity + 0.01, 0.8);
            }

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(162, 155, 254, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 80);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(108, 92, 231, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ========================================
    // 2. CURSOR GLOW EFFECT
    // ========================================
    const cursorGlow = document.getElementById('cursorGlow');
    let glowX = 0, glowY = 0;
    let currentGlowX = 0, currentGlowY = 0;

    document.addEventListener('mousemove', (e) => {
        glowX = e.clientX;
        glowY = e.clientY;
    });

    function animateGlow() {
        currentGlowX += (glowX - currentGlowX) * 0.08;
        currentGlowY += (glowY - currentGlowY) * 0.08;
        cursorGlow.style.left = currentGlowX + 'px';
        cursorGlow.style.top = currentGlowY + 'px';
        requestAnimationFrame(animateGlow);
    }

    // Only enable cursor glow on desktop
    if (window.innerWidth > 768) {
        animateGlow();
    }

    // ========================================
    // 2.5 CURSOR TRAIL EFFECT (Dots)
    // ========================================
    if (window.innerWidth > 768) {
        const blueColors = ['#00cef5', '#74b9ff', '#81ecec', '#0984e3', '#1e90ff'];
        let lastTrailTime = 0;

        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastTrailTime < 20) return; // smooth and fast dots
            lastTrailTime = now;

            const dot = document.createElement('div');
            dot.className = 'cursor-trail';
            const color = blueColors[Math.floor(Math.random() * blueColors.length)];
            const size = Math.random() * 6 + 4; // 4px to 10px
            
            dot.style.cssText = `
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                width: ${size}px;
                height: ${size}px;
                --trail-color: ${color};
            `;
            document.body.appendChild(dot);

            setTimeout(() => {
                dot.remove();
            }, 800);
        });
    }

    // ========================================
    // 3. TYPING ANIMATION
    // ========================================
    const typingElement = document.getElementById('typingText');
    const rolesId = [
        'Web Developer',
        'Fresh Graduate',
        'Spesialis Data Entry',
        'Guru Informatika',
        'Content Creator',
        'Tech Enthusiast'
    ];
    const rolesEn = [
        'Web Developer',
        'Fresh Graduate',
        'Data Entry Specialist',
        'Informatics Teacher',
        'Content Creator',
        'Tech Enthusiast'
    ];
    let roles = document.body.classList.contains('lang-en') ? rolesEn : rolesId;
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function typeRole() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 80;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            typingSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 400; // Pause before next word
        }

        setTimeout(typeRole, typingSpeed);
    }

    typeRole();

    // ========================================
    // 4. NAVBAR SCROLL EFFECT
    // ========================================
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button
        if (scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            if (scrollY >= top) {
                current = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Back to top click
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ========================================
    // 5. MOBILE NAVIGATION
    // ========================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    let overlay = null;

    function createOverlay() {
        overlay = document.createElement('div');
        overlay.classList.add('nav-overlay');
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeNav);
    }

    function openNav() {
        navToggle.classList.add('active');
        navMenu.classList.add('active');
        if (!overlay) createOverlay();
        setTimeout(() => overlay.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
            closeNav();
        } else {
            openNav();
        }
    });

    // Close nav on link click (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // ========================================
    // 6. SCROLL REVEAL ANIMATION
    // ========================================
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation for children
                const delay = entry.target.closest('.timeline') ? 0 : 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // Timeline items stagger
    const timelineItems = document.querySelectorAll('.timeline-item[data-animate]');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const allItems = Array.from(timelineItems);
                const itemIndex = allItems.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, itemIndex * 150);
                timelineObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    timelineItems.forEach(el => timelineObserver.observe(el));

    // ========================================
    // 7. COUNTER ANIMATION
    // ========================================
    const statNumbers = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.dataset.count);
                const isDecimal = el.dataset.decimal === 'true';
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = eased * target;

                    if (isDecimal) {
                        el.textContent = current.toFixed(2);
                    } else {
                        el.textContent = Math.round(current);
                    }

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }

                requestAnimationFrame(updateCounter);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    // ========================================
    // 8. SKILL BAR ANIMATION
    // ========================================
    const skillFills = document.querySelectorAll('.skill-fill');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const width = el.dataset.width;
                setTimeout(() => {
                    el.style.width = width + '%';
                }, 200);
                skillObserver.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    skillFills.forEach(el => skillObserver.observe(el));


    // ========================================
    // 10. SMOOTH SCROLL
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                const offsetTop = targetEl.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // 11. TILT EFFECT ON SKILL CARDS (Desktop)
    // ========================================
    if (window.innerWidth > 768) {
        const skillCards = document.querySelectorAll('.skill-card');
        
        skillCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 15;
                const rotateY = (centerX - x) / 15;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ========================================
    // 11.5. 3D TILT & GLARE EFFECT ON AVATAR (Desktop)
    // ========================================
    if (window.innerWidth > 768) {
        const avatarRing = document.querySelector('.avatar-ring');
        const avatarContainer = document.querySelector('.avatar-container');
        const avatarImg = document.querySelector('.avatar-img');
        const avatarGlow = document.querySelector('.avatar-glow');

        if (avatarRing && avatarContainer) {
            avatarRing.addEventListener('mouseenter', () => {
                avatarContainer.style.transition = 'transform 0.1s ease-out, box-shadow 0.4s ease';
                if (avatarImg) avatarImg.style.transition = 'transform 0.1s ease-out, filter 0.4s ease';
                if (avatarGlow) avatarGlow.style.transition = 'transform 0.1s ease-out, opacity 0.4s ease, filter 0.4s ease';
            });

            avatarRing.addEventListener('mousemove', (e) => {
                const rect = avatarRing.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Tilt angles (max 15 degrees)
                const rotateX = ((centerY - y) / centerY) * 15;
                const rotateY = ((x - centerX) / centerX) * 15;

                // Update glare position
                const percentX = (x / rect.width) * 100;
                const percentY = (y / rect.height) * 100;
                avatarContainer.style.setProperty('--mouse-x', `${percentX}%`);
                avatarContainer.style.setProperty('--mouse-y', `${percentY}%`);

                // Apply transform to container
                avatarContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;

                // Parallax glow effect
                if (avatarGlow) {
                    avatarGlow.style.transform = `translate(${rotateY * 0.8}px, ${-rotateX * 0.8}px) scale(1.08)`;
                    avatarGlow.style.opacity = '0.35';
                    avatarGlow.style.filter = 'blur(30px)';
                }

                // Parallax photo depth effect
                if (avatarImg) {
                    avatarImg.style.transform = `translate(${-rotateY * 0.3}px, ${-rotateX * 0.3}px) scale(1.06)`;
                }
            });

            avatarRing.addEventListener('mouseleave', () => {
                avatarContainer.style.transition = 'transform 0.5s ease, box-shadow 0.4s ease';
                avatarContainer.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
                
                if (avatarGlow) {
                    avatarGlow.style.transition = 'transform 0.5s ease, opacity 0.4s ease, filter 0.4s ease';
                    avatarGlow.style.transform = 'translate(0, 0) scale(1)';
                    avatarGlow.style.opacity = '0.15';
                    avatarGlow.style.filter = 'blur(40px)';
                }

                if (avatarImg) {
                    avatarImg.style.transition = 'transform 0.5s ease, filter 0.4s ease';
                    avatarImg.style.transform = 'translate(0, 0) scale(1)';
                }
            });
        }
    }
    // ========================================
    // 11.6. DARK/LIGHT THEME TOGGLE
    // ========================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    
    // Check local storage for theme preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
        }
    } else {
        // Default is dark theme
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    }
    
    if (themeToggle && themeIcon) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            
            // Toggle icon
            if (isLight) {
                themeIcon.className = 'fas fa-moon';
                localStorage.setItem('theme', 'light');
            } else {
                themeIcon.className = 'fas fa-sun';
                localStorage.setItem('theme', 'dark');
            }
            
            // Add a temporary micro-animation to the icon
            themeToggle.style.transform = 'scale(0.8) rotate(45deg)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 150);
        });
    }

    // ========================================
    // 12. RESIZE HANDLER FOR PARTICLES
    // ========================================
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initParticles();
        }, 300);
    });

    // ========================================
    // 13. CERTIFICATE LIGHTBOX MODAL
    // ========================================
    const lightbox = document.getElementById('certLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const certCards = document.querySelectorAll('.cert-card');
    
    // Store certificate data for navigation
    const certificatesData = [];
    certCards.forEach((card, index) => {
        const img = card.querySelector('.cert-img');
        const title = card.querySelector('.cert-title').textContent;
        const issuer = card.querySelector('.cert-issuer').textContent;
        
        certificatesData.push({
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: title,
            issuer: issuer
        });
        
        // Add click listener to the certificate image container
        const imgContainer = card.querySelector('.cert-img-container');
        if (imgContainer) {
            imgContainer.addEventListener('click', () => {
                openLightbox(index);
            });
        }
    });
    
    let currentCertIndex = 0;
    
    function openLightbox(index) {
        currentCertIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        // Restore scroll style (be mindful of mobile menu state)
        const isMobileNavActive = navMenu.classList.contains('active');
        if (!isMobileNavActive) {
            document.body.style.overflow = '';
        }
    }
    
    function updateLightboxContent() {
        const cert = certificatesData[currentCertIndex];
        if (cert) {
            // Add a subtle fade out/in effect to image during load
            lightboxImg.style.opacity = '0';
            lightboxImg.src = cert.src;
            lightboxImg.alt = cert.alt;
            lightboxCaption.textContent = `${cert.title} — ${cert.issuer}`;
            
            lightboxImg.onload = () => {
                lightboxImg.style.transition = 'opacity 0.3s ease';
                lightboxImg.style.opacity = '1';
            };
        }
    }
    
    function showNextCert() {
        currentCertIndex = (currentCertIndex + 1) % certificatesData.length;
        updateLightboxContent();
    }
    
    function showPrevCert() {
        currentCertIndex = (currentCertIndex - 1 + certificatesData.length) % certificatesData.length;
        updateLightboxContent();
    }
    
    // Event listeners
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', showNextCert);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevCert);
    
    // Close lightbox on click outside the image wrapper
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            showNextCert();
        } else if (e.key === 'ArrowLeft') {
            showPrevCert();
        }
    });

    // ========================================
    // 14. LANGUAGE SWITCHER
    // ========================================
    const langToggle = document.getElementById('langToggle');
    const langSpan = langToggle ? langToggle.querySelector('span') : null;
    
    // Set initial text on load
    if (langSpan) {
        langSpan.textContent = document.body.classList.contains('lang-en') ? 'EN' : 'ID';
    }
    
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            document.body.classList.toggle('lang-en');
            const isEn = document.body.classList.contains('lang-en');
            
            // Save language preference
            localStorage.setItem('lang', isEn ? 'en' : 'id');
            
            // Update button text
            if (langSpan) {
                langSpan.textContent = isEn ? 'EN' : 'ID';
            }
            
            // Re-assign typing array and reset typing animation
            roles = isEn ? rolesEn : rolesId;
            roleIndex = 0;
            charIndex = 0;
            isDeleting = false;
            if (typingElement) {
                typingElement.textContent = "";
            }
            
            // Add a temporary micro-animation
            langToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                langToggle.style.transform = '';
            }, 100);
        });
    }

});
