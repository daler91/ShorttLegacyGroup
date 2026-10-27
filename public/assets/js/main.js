/* Shortt Legacy Group OPC – site behaviour (no dependencies). */
(function () {
  'use strict';

  window.slgReady = true;
  var root = document.documentElement;
  root.classList.add('js');

  var CONTACT_EMAIL = 'shorttlegacygroup@gmail.com';
  var WHATSAPP_NUMBER = '919442715232';

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    // First check on the next frame: reading scrollY during start-up forces an early layout.
    window.requestAnimationFrame(onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var nav = document.getElementById('site-nav');
  var toggle = document.querySelector('.nav-toggle');
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (nav.classList.contains('is-open') && !event.target.closest('.site-header')) setOpen(false);
    });

    var desktop = window.matchMedia('(min-width: 961px)');
    var onBreakpoint = function (event) {
      if (event.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  }

  var supportsObserver = 'IntersectionObserver' in window;

  /* ---------- Highlight the menu item for the section in view ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__list a[href^="#"]'));
  if (supportsObserver && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('main section[id]').forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ---------- Reveal content as it scrolls into view ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reveals.length && supportsObserver && !reduceMotion) {
    reveals.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
        return child.classList.contains('reveal');
      });
      var index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty('--delay', (index * 90) + 'ms');
    });

    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    root.classList.add('reveal-on');
    reveals.forEach(function (el) {
      revealer.observe(el);
    });
  }

  /* ---------- Contact form: send to the contact Worker, falling back to email or WhatsApp ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var endpoint = form.getAttribute('data-endpoint');
    var status = form.querySelector('.form-status');
    var submitButton = form.querySelector('button[type="submit"]');
    var submitLabel = form.querySelector('[data-submit-label]');
    var whatsappButton = form.querySelector('[data-whatsapp]');
    var serviceSelect = form.querySelector('#cf-service');
    var phoneInput = form.elements.phone;
    var sending = false;

    if (whatsappButton) whatsappButton.hidden = false;

    var field = function (name) {
      var input = form.elements[name];
      return input ? input.value.trim() : '';
    };

    var details = function () {
      var lines = ['Name: ' + field('name')];
      if (field('phone')) lines.push('Phone: ' + field('phone'));
      if (field('email')) lines.push('Email: ' + field('email'));
      lines.push('Interested in: ' + field('service'));
      return lines.join('\n');
    };

    var emailLink = function () {
      var subject = 'Website enquiry: ' + field('service') + ' – ' + field('name');
      var body = 'Hello Shortt Legacy Group,\n\n' + field('message') + '\n\n—\n' + details();
      return 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    };

    var whatsappLink = function () {
      var text = 'Hello Shortt Legacy Group,\n\n' + field('message') + '\n\n' + details();
      return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
    };

    // Builds the message from text and links as DOM nodes, so nothing typed into the form is parsed as HTML.
    var setStatus = function (state, parts) {
      if (!status) return;
      status.textContent = '';
      if (state) status.setAttribute('data-state', state);
      else status.removeAttribute('data-state');
      parts.forEach(function (part) {
        if (typeof part === 'string') {
          status.appendChild(document.createTextNode(part));
          return;
        }
        var link = document.createElement('a');
        link.href = part.href;
        link.textContent = part.text;
        if (part.external) {
          link.target = '_blank';
          link.rel = 'noopener';
        }
        status.appendChild(link);
      });
    };

    var setSending = function (on) {
      sending = on;
      if (!submitButton) return;
      submitButton.disabled = on;
      submitButton.setAttribute('aria-busy', String(on));
      if (submitLabel) submitLabel.textContent = on ? 'Sending…' : 'Send message';
    };

    var showFallback = function () {
      setStatus('error', [
        'Sorry, we couldn’t send your message just now. Please ',
        { href: emailLink(), text: 'send it by email' },
        ' or ',
        { href: whatsappLink(), text: 'on WhatsApp', external: true },
        ' instead.'
      ]);
    };

    // We can only reply if the visitor leaves a phone number or an email address.
    var checkReplyDetails = function () {
      var missing = !field('phone') && !field('email');
      phoneInput.setCustomValidity(missing ? 'Please add a phone number or an email address so we can reply.' : '');
    };
    ['phone', 'email'].forEach(function (name) {
      form.elements[name].addEventListener('input', function () {
        phoneInput.setCustomValidity('');
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (sending) return;
      checkReplyDetails();
      if (!form.reportValidity()) return;

      if (!endpoint || !window.fetch || !window.FormData) {
        window.location.href = emailLink();
        return;
      }

      var data = new FormData(form);
      // Time spent on the page; the Worker treats near-instant submissions as spam.
      data.set('elapsed_ms', String(Math.round(window.performance ? performance.now() : 0)));

      var controller = window.AbortController ? new AbortController() : null;
      var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;

      setSending(true);
      setStatus(null, ['Sending your message…']);

      fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller ? controller.signal : undefined
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (result) {
            if (response.ok && result.ok) {
              form.reset();
              setStatus('success', ['Thank you! Your message has been sent – we’ll get back to you soon.']);
            } else if (response.status === 400 && result.message) {
              setStatus('error', [result.message]);
            } else {
              showFallback();
            }
          });
        })
        .catch(showFallback)
        .then(function () {
          if (timer) clearTimeout(timer);
          setSending(false);
        });
    });

    if (whatsappButton) {
      whatsappButton.addEventListener('click', function () {
        phoneInput.setCustomValidity('');
        if (!form.reportValidity()) return;

        window.open(whatsappLink(), '_blank', 'noopener');
        setStatus(null, ['Opening WhatsApp… If nothing happens, message us on +91 94427 15232.']);
      });
    }

    // "Enquire about …" links on the service cards pre-select the service.
    document.querySelectorAll('[data-service]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (serviceSelect) serviceSelect.value = link.getAttribute('data-service');
      });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
