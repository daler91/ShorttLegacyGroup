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
    onScroll();
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

  /* ---------- Contact form: compose an email or WhatsApp message ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    var whatsappButton = form.querySelector('[data-whatsapp]');
    var whatsappNote = form.querySelector('[data-whatsapp-note]');
    var serviceSelect = form.querySelector('#cf-service');

    if (whatsappButton) whatsappButton.hidden = false;
    if (whatsappNote) whatsappNote.hidden = false;

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

    var setStatus = function (message) {
      if (status) status.textContent = message;
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var subject = 'Website enquiry: ' + field('service') + ' – ' + field('name');
      var body = 'Hello Shortt Legacy Group,\n\n' + field('message') + '\n\n—\n' + details();
      window.location.href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      setStatus('Opening your email app… If nothing happens, email us at ' + CONTACT_EMAIL + '.');
    });

    if (whatsappButton) {
      whatsappButton.addEventListener('click', function () {
        if (!form.reportValidity()) return;

        var text = 'Hello Shortt Legacy Group,\n\n' + field('message') + '\n\n' + details();
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        setStatus('Opening WhatsApp… If nothing happens, message us on +91 94427 15232.');
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
