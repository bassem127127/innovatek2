/* ============================================
   INNOVATEK — Utility Functions
   ============================================ */

/**
 * Query a single DOM element with error-safe fallback.
 * @param {string} selector
 * @param {Element} parent
 * @returns {Element|null}
 */
export const select = (selector, parent = document) =>
  parent.querySelector(selector);

/**
 * Query all matching DOM elements as an array.
 * @param {string} selector
 * @param {Element} parent
 * @returns {Element[]}
 */
export const selectAll = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

/**
 * Debounce a function to limit execution rate.
 * @param {Function} callback
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (callback, delay = 100) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};

/**
 * Throttle a function to execute at most once per interval.
 * @param {Function} callback
 * @param {number} interval
 * @returns {Function}
 */
export const throttle = (callback, interval = 100) => {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      callback(...args);
    }
  };
};

/**
 * Linearly interpolate between two values.
 * @param {number} start
 * @param {number} end
 * @param {number} factor
 * @returns {number}
 */
export const lerp = (start, end, factor) =>
  start + (end - start) * factor;
