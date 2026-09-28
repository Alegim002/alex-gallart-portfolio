(() => {
  'use strict';
  const toggle = document.getElementById('langToggle');
  if (!toggle) return;
  const navigation = document.querySelector('nav');
  const description = document.querySelector('meta[name="description"]');
  const services = document.body.dataset.page === 'services';
  const descriptions = {
    es: description.content,
    en: services ?
      'Alex Gallart: automation and AI integration, websites and IT support for small businesses. Tell me about your project.' :
      'Alex Gallart Gimeno, Systems Administrator at Ibermedia in Valencia, Spain. Microsoft 365, Windows Server, networking, backups and n8n automation.'
  };
  function setLanguage(language) {
    const english = language === 'en';
    document.body.classList.toggle('en', english);
    document.documentElement.lang = language;
    document.title = services ?
      (english ? 'Digital services | Alex Gallart' : 'Servicios digitales | Alex Gallart') :
      (english ? 'Alex Gallart Gimeno | Systems Administrator' : 'Alex Gallart Gimeno | Administrador de sistemas');
    description.content = descriptions[language];
    navigation.setAttribute('aria-label', english ? 'Main navigation' : 'Navegación principal');
    toggle.textContent = english ? 'ES' : 'EN';
    toggle.lang = english ? 'es' : 'en';
    toggle.setAttribute('aria-label', english ? 'Cambiar a español' : 'Switch to English');
    document.querySelectorAll('option[data-es]').forEach(option => { option.textContent = option.dataset[language]; });
    document.querySelectorAll('[data-placeholder-es]').forEach(field => { field.placeholder = field.dataset[english ? 'placeholderEn' : 'placeholderEs']; });
    document.querySelectorAll('[data-label-es]').forEach(element => { element.setAttribute('aria-label', element.dataset[english ? 'labelEn' : 'labelEs']); });
    document.dispatchEvent(new Event('portfolio-language-change'));
  }
  let saved = 'es';
  try { saved = localStorage.getItem('portfolio-lang') === 'en' ? 'en' : 'es'; } catch { /* Storage may be disabled. */ }
  setLanguage(saved);
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const language = document.documentElement.lang === 'es' ? 'en' : 'es';
    setLanguage(language);
    try { localStorage.setItem('portfolio-lang', language); } catch { /* The selector works without storage. */ }
  });
})();
