(() => {
  'use strict';
  const form = document.getElementById('contact-form');
  const panel = document.getElementById('contact-form-panel');
  const fields = document.getElementById('contact-fields');
  const status = document.getElementById('contact-status');
  const button = document.getElementById('contact-submit');
  const endpoint = form.dataset.endpoint.trim();
  const configured = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
  let busy = false;
  let state = '';
  const messages = {
    es: {
      sending: 'Enviando…',
      success: 'Mensaje recibido por el servicio de contacto. Gracias por escribirme.',
      error: 'No se ha podido confirmar el envío. Tu texto se conserva; puedes copiarlo y escribirme por correo o LinkedIn.',
      rate: 'Se han realizado demasiados intentos. Espera un momento o utiliza el correo de contacto.',
      invalid: 'Revisa los campos obligatorios y acepta la información de privacidad.',
      spam: 'No se ha enviado el mensaje. Utiliza el correo de contacto si el problema continúa.',
      send: 'Enviar mensaje'
    },
    en: {
      sending: 'Sending…',
      success: 'The contact service has received your message. Thank you for getting in touch.',
      error: 'Delivery could not be confirmed. Your text is preserved; you can copy it and contact me by email or LinkedIn.',
      rate: 'Too many attempts. Please wait a moment or use the contact email.',
      invalid: 'Check the required fields and accept the privacy information.',
      spam: 'The message was not sent. Please use the contact email if the problem continues.',
      send: 'Send message'
    }
  };
  function render() {
    const copy = messages[document.documentElement.lang === 'en' ? 'en' : 'es'];
    button.textContent = busy ? copy.sending : copy.send;
    status.textContent = state ? copy[state] : '';
    status.dataset.state = state === 'success' ? 'success' : state === 'sending' || !state ? '' : 'error';
  }
  document.addEventListener('portfolio-language-change', render);
  // An unconfigured service must never look like a working contact form.
  // Email and LinkedIn remain available even without JavaScript.
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!configured || busy) return;
    if (!form.reportValidity()) {
      state = 'invalid';
      render();
      return;
    }
    if (form.elements.namedItem('_gotcha').value) {
      state = 'spam';
      render();
      return;
    }
    const payload = new FormData(form);
    payload.set('_subject', 'Contacto desde el portfolio de Alex Gallart');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    busy = true;
    state = 'sending';
    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    render();
    try {
      const response = await fetch(endpoint, {
        method: 'POST', body: payload, headers: { Accept: 'application/json' },
        credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.ok === true) {
        form.reset();
        state = 'success';
      } else {
        state = response.status === 429 ? 'rate' : 'error';
      }
    } catch {
      state = 'error';
    } finally {
      clearTimeout(timeout);
      busy = false;
      fields.disabled = false;
      form.setAttribute('aria-busy', 'false');
      render();
      status.focus();
    }
  });
  if (configured) {
    form.action = endpoint;
    fields.disabled = false;
    panel.hidden = false;
    document.getElementById('form-provider-notice').hidden = false;
  }
  document.querySelectorAll('a[href="#privacidad"]').forEach(link => {
    link.addEventListener('click', () => { document.getElementById('privacidad').open = true; });
  });
  render();
})();
