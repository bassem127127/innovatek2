/* ============================================
   INNOVATEK — Main Entry Point
   ============================================ */

import { initNavigation } from './scripts/navigation.js';
import { initParticles } from './scripts/particles.js';
import { initAnimations } from './scripts/animations.js';
import { initContactForm } from './scripts/form.js';
import { initLanguage } from './scripts/language.js';
import { initChatbot } from './scripts/chatbot.js';

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initNavigation();
  initParticles(document.querySelector('.hero__canvas'));
  initAnimations();
  initContactForm();
  initChatbot();

  // Remove preloader
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      // Add a slight delay to ensure everything is rendered
      setTimeout(() => {
        loader.classList.add('loader--hidden');
        // Optional: remove from DOM after transition
        setTimeout(() => loader.remove(), 600);
      }, 1000);
    }
  });
});
