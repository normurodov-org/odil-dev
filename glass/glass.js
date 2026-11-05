/* ------------------------------------------------------------------
   Liquid Glass — behaviour layer.
   Pointer-lit glass, spring motion, polished scroll chrome, theme
   switching with a view transition, and no dependency on anything.
------------------------------------------------------------------ */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  root.classList.add('js');

  /* ----------------------------- theme ----------------------------- */

  var themeBtn = document.getElementById('theme');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function paintTheme(next, persist) {
    root.dataset.theme = next;
    if (themeMeta) themeMeta.setAttribute('content', next === 'dark' ? '#05050a' : '#eef1f7');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', next === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance');
    }
    if (persist !== false) {
      try { localStorage.setItem('on-glass-theme', next); } catch (e) {}
    }
  }

  function currentTheme() {
    return root.dataset.theme === 'light' ? 'light' : 'dark';
  }

  paintTheme(currentTheme(), false);

  function toggleTheme() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';

    if (!document.startViewTransition || reduceMotion || !themeBtn) {
      paintTheme(next);
      return;
    }

    var box = themeBtn.getBoundingClientRect();
    var x = box.left + box.width / 2;
    var y = box.top + box.height / 2;
    var radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    var transition = document.startViewTransition(function () { paintTheme(next); });

    transition.ready.then(function () {
      root.animate(
        {
          clipPath: [
            'circle(0px at ' + x + 'px ' + y + 'px)',
            'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'
          ]
        },
        {
          duration: 620,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    }).catch(function () {});
  }

  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  /* -------------------------- pointer light ------------------------ */

  var glassItems = Array.prototype.slice.call(document.querySelectorAll('.glass'));

  if (finePointer && !reduceMotion) {
    glassItems.forEach(function (el) {
      var frame = 0;
      var px = 0;
      var py = 0;

      function apply() {
        frame = 0;
        var rect = el.getBoundingClientRect();
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var dx = px - cx;
        var dy = py - cy;
        var angle = Math.atan2(dy, dx) * 180 / Math.PI;

        el.style.setProperty('--mx', px + 'px');
        el.style.setProperty('--my', py + 'px');
        el.style.setProperty('--ang', angle + 'deg');
      }

      el.addEventListener('pointermove', function (event) {
        var rect = el.getBoundingClientRect();
        px = event.clientX - rect.left;
        py = event.clientY - rect.top;
        el.style.setProperty('--near', '1');
        if (!frame) frame = requestAnimationFrame(apply);
      });

      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--near', '0');
        el.style.setProperty('--ang', '145deg');
      });
    });
  }

  /* --------------------------- magnetic ---------------------------- */

  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-mag]').forEach(function (el) {
      var target = { x: 0, y: 0 };
      var current = { x: 0, y: 0 };
      var running = false;

      function tick() {
        current.x += (target.x - current.x) * 0.16;
        current.y += (target.y - current.y) * 0.16;
        el.style.setProperty('--tx', current.x.toFixed(2) + 'px');
        el.style.setProperty('--ty', current.y.toFixed(2) + 'px');

        if (Math.abs(target.x - current.x) > 0.05 || Math.abs(target.y - current.y) > 0.05) {
          requestAnimationFrame(tick);
        } else {
          running = false;
        }
      }

      function start() {
        if (running) return;
        running = true;
        requestAnimationFrame(tick);
      }

      el.addEventListener('pointermove', function (event) {
        var rect = el.getBoundingClientRect();
        target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 9;
        target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 7;
        start();
      });

      el.addEventListener('pointerleave', function () {
        target.x = 0;
        target.y = 0;
        start();
      });
    });
  }

  /* ---------------------------- reveals ---------------------------- */

  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  revealItems.forEach(function (el) {
    var siblings = el.parentElement
      ? Array.prototype.slice.call(el.parentElement.querySelectorAll(':scope > [data-reveal]'))
      : [];
    var index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty('--d', String(index));
  });

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealItems.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------- counters --------------------------- */

  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function runCounter(el) {
    var end = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) { el.textContent = String(end); return; }

    var start = performance.now();
    var duration = 1200;

    function step(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(end * eased));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ----------------------------- clock ----------------------------- */

  var clocks = Array.prototype.slice.call(document.querySelectorAll('[data-clock]'));
  var timeFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Samarkand',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  function tickClock() {
    var now = new Date();
    var full = timeFormat.format(now);
    clocks.forEach(function (el) {
      el.textContent = el.getAttribute('data-clock') === 'short' ? full.slice(0, 5) : full;
    });
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ------------------------- scroll chrome ------------------------- */

  var dock = document.getElementById('dock');
  var tabbar = document.getElementById('tabbar');
  var lastY = window.scrollY;
  var queued = false;

  function onScroll() {
    queued = false;
    var y = window.scrollY;

    if (dock) dock.classList.toggle('is-compact', y > 24);
    document.body.classList.toggle('is-scrolled', y > 8);

    if (tabbar) {
      var goingDown = y > lastY + 4;
      if (y > 160 && goingDown) tabbar.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 120) tabbar.classList.remove('is-hidden');
    }
    lastY = y;
  }

  window.addEventListener('scroll', function () {
    if (!queued) { queued = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  onScroll();

  /* --------------------------- scroll spy -------------------------- */

  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('[data-spy]'));
  var sections = ['work', 'about', 'contact', 'services']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActive(id) {
    spyLinks.forEach(function (link) {
      var on = link.getAttribute('data-spy') === id;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ----------------------------- toast ----------------------------- */

  var toast = document.getElementById('toast');
  var toastTimer = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
  }

  var copyBtn = document.getElementById('copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = 'normurodovodilbek3110@gmail.com';
      var done = function () { showToast('Email copied'); };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { showToast(email); });
      } else {
        showToast(email);
      }
    });
  }

  /* ------------------- in-page links & focus ----------------------- */

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });
})();
