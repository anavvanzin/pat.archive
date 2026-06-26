(() => {
  'use strict';

  const STORAGE_KEY = 'chdx_theme';
  const THEMES = new Set(['pista', 'atelier']);

  function getSavedTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return THEMES.has(stored) ? stored : 'pista';
    } catch (error) {
      return 'pista';
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Theme still applies for this page even if storage is unavailable.
    }
  }

  function updateButtons(theme) {
    document.querySelectorAll('[data-theme-toggle], #themeToggle').forEach((button) => {
      button.setAttribute('aria-pressed', theme === 'atelier' ? 'true' : 'false');
      const strong = document.createElement('strong');
      const sparkle = document.createElement('span');
      sparkle.textContent = '✦';
      if (theme === 'atelier') {
        strong.textContent = 'ateliê';
        sparkle.style.color = 'var(--soft)';
        button.replaceChildren('pista ', sparkle, ' ', strong);
      } else {
        strong.textContent = 'pista';
        sparkle.style.color = 'var(--gold)';
        button.replaceChildren(strong, ' ', sparkle, ' ateliê');
      }
    });
  }

  function applyTheme(theme, { persist = true } = {}) {
    const nextTheme = THEMES.has(theme) ? theme : 'pista';
    if (!document.body) return nextTheme;

    document.body.classList.toggle('light-theme', nextTheme === 'atelier');
    document.body.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme === 'atelier' ? 'light' : 'dark';
    updateButtons(nextTheme);

    if (persist) saveTheme(nextTheme);
    window.dispatchEvent(new CustomEvent('chdx:theme-change', { detail: { theme: nextTheme } }));
    return nextTheme;
  }

  function toggleTheme() {
    const current = document.body?.dataset.theme || getSavedTheme();
    return applyTheme(current === 'atelier' ? 'pista' : 'atelier');
  }

  function initThemeControls() {
    applyTheme(getSavedTheme(), { persist: false });
    document.querySelectorAll('[data-theme-toggle], #themeToggle').forEach((button) => {
      if (button.dataset.themeBound === 'true') return;
      button.dataset.themeBound = 'true';
      button.addEventListener('click', toggleTheme);
    });
  }

  window.CHDXTheme = {
    apply: applyTheme,
    init: initThemeControls,
    toggle: toggleTheme,
    updateButtons,
    get: getSavedTheme,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeControls, { once: true });
  } else {
    initThemeControls();
  }
})();
