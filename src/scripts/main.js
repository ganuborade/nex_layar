const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle?.querySelector('i');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.addEventListener('click', event => {
        if (event.target.closest('a')) {
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

if (navbar) {
    const updateNavbar = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);

        const scrollPosition = window.scrollY + 120;
        document.querySelectorAll('section[id]').forEach(section => {
            const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);

            if (link) {
                const isActive =
                    scrollPosition >= section.offsetTop &&
                    scrollPosition < section.offsetTop + section.offsetHeight;
                link.classList.toggle('active', isActive);
            }
        });
    };

    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });
}

const animatedCards = document.querySelectorAll(
    '.service-card, .project-card, .skill-card, .pricing-card'
);

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
                setTimeout(() => {
                    entry.target.classList.remove('reveal', 'visible');
                }, 500);
            }
        });
    }, { threshold: 0.1 });

    animatedCards.forEach(card => {
        card.classList.add('reveal');
        observer.observe(card);
    });
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
}

themeToggle?.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (themeIcon) {
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
});
