const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.style.display === 'flex';
    navLinks.style.display = isOpen ? 'none' : 'flex';
  });
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks && navLinks.style.display === 'flex') {
      navLinks.style.display = 'none';
    }
  });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (event) {
    event.preventDefault();

    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

const navbar = document.querySelector('.navbar');

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow =
      window.scrollY > 50
        ? '0 5px 20px rgba(0, 0, 0, 0.15)'
        : '0 2px 10px rgba(0, 0, 0, 0.1)';
  });
}

// Animation Observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll(
  '.service-card, .portfolio-item, .project-card, .skill-card, .pricing-card'
).forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

  observer.observe(card);
});

// Active Navbar Link
window.addEventListener('scroll', () => {

  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 100;

  sections.forEach(section => {

    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    const sectionId = section.getAttribute('id');

    const navLink = document.querySelector(
      `.nav-links a[href="#${sectionId}"]`
    );

    if (
      navLink &&
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.style.opacity = '0.7';
      });

      navLink.style.opacity = '1';
    }
  });
});

console.log('NexLayar website loaded successfully!');