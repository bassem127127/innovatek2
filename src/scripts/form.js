/* ============================================
   INNOVATEK — Contact Form Handler
   ============================================ */

import { select, selectAll } from './utils.js';

const VALIDATION_RULES = {
  name: { required: true, minLength: 2 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  company: { required: false },
  message: { required: true, minLength: 10 },
};

export function initContactForm() {
  const form = select('#contact-form');
  if (!form) return;

  const submitButton = select('.contact__submit', form);
  const successMessage = select('.contact__success');
  const resetBtn = select('#form-reset');

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (successMessage) successMessage.classList.remove('visible');
      form.style.display = 'flex';
      form.reset();
      
      // Clear errors if any
      selectAll('.form-group', form).forEach(group => group.classList.remove('error'));
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validateForm(form)) return;

    // --- Anti-Spam Cooldown ---
    const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes
    const lastSubmission = localStorage.getItem('form_last_submission');
    const now = Date.now();

    if (lastSubmission && (now - lastSubmission < COOLDOWN_TIME)) {
      const remaining = Math.ceil((COOLDOWN_TIME - (now - lastSubmission)) / 60000);
      alert(`Please wait ${remaining} minute(s) before sending another message.`);
      return;
    }
    // ---------------------------

    // Real form submission via SplitForms
    submitButton.disabled = true;
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span>Sending...</span>';

    const formData = new FormData(form);
    
    fetch('https://splitforms.com/api/submit', {
      method: 'POST',
      body: formData
    })
    .then(async (response) => {
      if (response.ok) {
        localStorage.setItem('form_last_submission', Date.now());
        form.style.display = 'none';
        if (successMessage) successMessage.classList.add('visible');
      } else {
        const json = await response.json().catch(() => ({ message: 'Submission failed' }));
        alert(json.message || 'Something went wrong!');
      }
    })
    .catch(error => {
      console.error('Form Error:', error);
      alert('Network error. Please try again.');
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    });
  });

  // Real-time validation on blur
  const inputs = selectAll('.form-group__input, .form-group__textarea', form);
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group?.classList.contains('error')) {
        validateField(input);
      }
    });
  });
}

function validateForm(form) {
  const fields = selectAll('.form-group__input, .form-group__textarea', form);
  let isValid = true;

  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  return isValid;
}

function validateField(field) {
  const fieldName = field.name;
  const rule = VALIDATION_RULES[fieldName];
  const group = field.closest('.form-group');

  if (!rule || !group) return true;

  const value = field.value.trim();
  let isValid = true;

  if (rule.required && !value) {
    isValid = false;
  } else if (rule.minLength && value.length < rule.minLength) {
    isValid = false;
  } else if (rule.pattern && !rule.pattern.test(value)) {
    isValid = false;
  }

  group.classList.toggle('error', !isValid);
  return isValid;
}
