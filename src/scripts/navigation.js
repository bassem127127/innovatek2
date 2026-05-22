/* ============================================
   INNOVATEK — Navigation Controller
   ============================================ */

import { select, selectAll, throttle } from './utils.js';

export function initNavigation() {
  const navbar = select('.navbar');
  const toggle = select('.navbar__toggle');
  const navLinks = select('.navbar__links');
  const links = selectAll('.navbar__link');
  const backToTop = select('.back-to-top');

  if (!navbar) return;

  // --- Scroll-based navbar background ---
  const handleScroll = throttle(() => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);

    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    }

    updateActiveLink();
  }, 50);

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // --- Mobile menu toggle ---
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
  }

  // --- Smooth scroll to sections ---
  links.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = select(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }

      // Close mobile menu
      if (navLinks?.classList.contains('open')) {
        toggle?.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // --- Back to top ---
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Active link highlighting ---
  function updateActiveLink() {
    const sections = selectAll('section[id]');
    const scrollPosition = window.scrollY + 150;

    let currentSection = '';
    for (const section of sections) {
      if (section.offsetTop <= scrollPosition) {
        currentSection = section.id;
      }
    }

    links.forEach(link => {
      const isActive = link.getAttribute('href') === `#${currentSection}`;
      link.classList.toggle('active', isActive);
    });
  }
}
