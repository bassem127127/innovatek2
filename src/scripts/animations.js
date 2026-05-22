/* ============================================
   INNOVATEK — Scroll Reveal Animations
   ============================================ */

import { selectAll } from './utils.js';

const OBSERVER_OPTIONS = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px',
};

export function initAnimations() {
  const revealElements = selectAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }
  }, OBSERVER_OPTIONS);

  revealElements.forEach(element => observer.observe(element));

  // --- Process section special animation ---
  initProcessAnimation();
}

function initProcessAnimation() {
  const processSection = document.querySelector('.process');
  if (!processSection) return;

  const steps = selectAll('.process__step', processSection);

  const processObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');

        // Activate steps sequentially
        steps.forEach((step, index) => {
          setTimeout(() => {
            step.classList.add('active');
          }, index * 300);
        });

        processObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.3 });

  processObserver.observe(processSection);
}
