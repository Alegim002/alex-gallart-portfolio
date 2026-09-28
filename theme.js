(() => {
  'use strict';

  const root = document.documentElement;
  const button = document.getElementById('themeToggle');
  if (!button) return;

  const label = document.getElementById('themeLabel');
  const sun = document.getElementById('themeSun');
  const moon = document.getElementById('themeMoon');
  const toolbarColor = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const storageKey = 'portfolio-theme';
  const isTheme = value => value === 'dark' || value === 'light';
  let preference = null;
  try {
    const stored = localStorage.getItem(storageKey);
    if (isTheme(stored)) preference = stored;
  } catch { /* The selector also works when storage is unavailable. */ }

  function renderButton() {
    const dark = root.dataset.theme === 'dark';
    const english = root.lang === 'en';
    label.textContent = english ? (dark ? 'Light mode' : 'Dark mode') : (dark ? 'Modo día' : 'Modo noche');
    const action = english ? (dark ? 'Switch to light mode' : 'Switch to dark mode') :
      (dark ? 'Activar modo día' : 'Activar modo noche');
    button.setAttribute('aria-label', action);
    button.setAttribute('title', action);
    sun.hidden = !dark;
    moon.hidden = dark;
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (toolbarColor) toolbarColor.content = theme === 'dark' ? '#07111f' : '#f4f7fb';
    renderButton();
  }

  const getSystemTheme = () => systemTheme && systemTheme.matches ? 'dark' : 'light';
  applyTheme(preference || getSystemTheme());
  button.hidden = false;

  button.addEventListener('click', () => {
    preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(preference);
    try { localStorage.setItem(storageKey, preference); } catch { /* Keep the choice for this visit. */ }
  });

  const onSystemChange = () => { if (!preference) applyTheme(getSystemTheme()); };
  if (systemTheme && systemTheme.addEventListener) systemTheme.addEventListener('change', onSystemChange);
  else if (systemTheme && systemTheme.addListener) systemTheme.addListener(onSystemChange);

  document.addEventListener('portfolio-language-change', renderButton);
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    try { if (event.storageArea && event.storageArea !== localStorage) return; } catch { return; }
    preference = isTheme(event.newValue) ? event.newValue : null;
    applyTheme(preference || getSystemTheme());
  });
})();
