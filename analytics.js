(() => {
  'use strict';
  const key = 'portfolio-analytics-choice-v1';
  const panel = document.getElementById('analytics-choice');
  const preferences = document.getElementById('analytics-preferences');
  const accept = document.getElementById('analytics-accept');
  const reject = document.getElementById('analytics-reject');
  const privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  const production = location.protocol === 'https:' && location.hostname === 'alegim002.github.io' &&
    /^\/alex-gallart-portfolio\/(?:index\.html)?$/.test(location.pathname);
  let choice = null;
  let script = null;
  let counted = false;
  try {
    const saved = localStorage.getItem(key);
    choice = saved === 'accepted' || saved === 'declined' ? saved : null;
  } catch { /* Consent can still be given for this page without browser storage. */ }
  function allowed() { return choice === 'accepted' && !privacySignal && production; }
  function countOnce() {
    if (!allowed() || counted || typeof window.goatcounter?.count !== 'function') return;
    counted = true;
    window.goatcounter.count();
  }
  function start() {
    if (!allowed() || counted) return;
    if (script) { countOnce(); return; }
    let referrer = '';
    try { referrer = document.referrer ? new URL(document.referrer).origin : ''; } catch { /* Omit invalid URLs. */ }
    window.goatcounter = {
      no_onload: true, no_events: true,
      endpoint: 'https://alexgallart.goatcounter.com/count',
      path: () => allowed() ? '/alex-gallart-portfolio/' : null,
      title: 'Portfolio profesional | Alex Gallart Gimeno',
      referrer
    };
    script = document.createElement('script');
    script.src = 'https://gc.zgo.at/count.js';
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.addEventListener('load', countOnce);
    script.addEventListener('error', () => { script.remove(); script = null; });
    document.head.appendChild(script);
  }
  function choose(value) {
    choice = value;
    try { localStorage.setItem(key, value); } catch { /* Keep the choice in memory. */ }
    panel.hidden = true;
    preferences.focus({ preventScroll: true });
    if (value === 'accepted') start();
  }
  accept.addEventListener('click', () => choose('accepted'));
  reject.addEventListener('click', () => choose('declined'));
  preferences.addEventListener('click', () => {
    panel.hidden = false;
    reject.focus();
  });
  // Respect changes from another open portfolio tab as well.
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    choice = event.newValue === 'accepted' || event.newValue === 'declined' ? event.newValue : null;
    panel.hidden = choice !== null || privacySignal;
    if (choice === 'accepted') start();
  });
  preferences.hidden = false;
  accept.hidden = privacySignal;
  document.getElementById('analytics-signal').hidden = !privacySignal;
  panel.hidden = choice !== null || privacySignal;
  start();
})();
