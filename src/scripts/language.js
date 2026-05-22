import { translations } from './translations.js';
import { select, selectAll } from './utils.js';

const STORAGE_KEY = 'innovatek_lang';
const DEFAULT_LANG = 'fr';

export function initLanguage() {
  const savedLang = localStorage.getItem(STORAGE_KEY);
  const currentLang = savedLang || detectBrowserLanguage() || DEFAULT_LANG;
  setLanguage(currentLang);

  const switchers = selectAll('.lang-switch');
  switchers.forEach(switcher => {
    switcher.addEventListener('click', (e) => {
      const lang = e.target.dataset.lang;
      if (lang) setLanguage(lang);
    });
  });
}

function detectBrowserLanguage() {
  // Check URL query parameters first (perfect for search engines crawling specific language links)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang')?.toLowerCase();
  const supported = ['fr', 'en', 'ar'];
  
  if (urlLang && supported.includes(urlLang)) {
    return urlLang;
  }

  const browserLang = navigator.language || navigator.userLanguage;
  if (!browserLang) return null;
  
  const shortLang = browserLang.split('-')[0].toLowerCase();
  return supported.includes(shortLang) ? shortLang : null;
}

function setLanguage(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  
  // Handle RTL for Arabic
  if (lang === 'ar') {
    document.documentElement.dir = 'rtl';
    document.body.classList.add('rtl');
  } else {
    document.documentElement.dir = 'ltr';
    document.body.classList.remove('rtl');
  }

  // Update document title and description meta tags dynamically for rich SEO indexation
  const titleTranslation = translations[lang]?.meta_title;
  const descTranslation = translations[lang]?.meta_description;
  if (titleTranslation) {
    document.title = titleTranslation;
  }
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && descTranslation) {
    metaDesc.setAttribute('content', descTranslation);
  }
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && titleTranslation) {
    ogTitle.setAttribute('content', titleTranslation);
  }
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && descTranslation) {
    ogDesc.setAttribute('content', descTranslation);
  }

  // Update all translatable elements
  const elements = selectAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.dataset.i18n;
    const translation = translations[lang]?.[key];
    
    if (translation) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else if (el.hasAttribute('aria-label') && el.querySelector('svg, i, .icon')) {
        // If it has an icon-like child and an aria-label, only update the label
        el.setAttribute('aria-label', translation);
      } else {
        el.innerHTML = translation;
      }
    }
  });

  // Update active state in switchers
  const switchers = selectAll('.lang-switch__btn');
  switchers.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}
