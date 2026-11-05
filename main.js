/* ------------------------------------------------------------------
   Odilbek Normurodov — interactions
   Lenis smooth scroll + GSAP reveals + small, quiet details.
------------------------------------------------------------------ */

(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
  const hasLenis = typeof window.Lenis !== 'undefined';
  const hasMotion = hasGSAP && hasScrollTrigger && !prefersReduced;

  if (hasGSAP && hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (!hasMotion) {
    root.classList.remove('js');
    const earlyLoader = $('#loader');
    if (earlyLoader) earlyLoader.remove();
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* -----------------------------------------------------------------
     Elements
  ----------------------------------------------------------------- */

  const loader = $('#loader');
  const header = $('#site-header');
  const progressBar = $('.progress span');
  const menu = $('#menu');
  const menuToggle = $('#menu-toggle');
  const themeToggle = $('#theme-toggle');
  const themeMeta = $('meta[name="theme-color"]');
  const toast = $('#toast');
  const form = $('#contact-form');
  const preview = $('#work-preview');
  const marqueeTrack = $('#marquee-track');
  const marqueeGroup = marqueeTrack ? marqueeTrack.firstElementChild : null;

  let menuOpen = false;
  let headerLockUntil = 0;
  let currentLang = 'en';
  let lenis = null;

  /* -----------------------------------------------------------------
     Copy / translations
  ----------------------------------------------------------------- */

  const copy = {
    en: {
      'nav.work': `Work`,
      'nav.about': `About`,
      'nav.services': `Services`,
      'nav.contact': `Contact`,
      'a11y.skip': `Skip to content`,
      'a11y.language': `Language`,
      'menu.label': `Menu`,
      'menu.open': `Open menu`,
      'menu.close': `Close menu`,
      'hero.eyebrow': `Backend developer — Qarshi, Uzbekistan`,
      'hero.avail': `Available for select projects`,
      'hero.line1': `The best <em>backend</em>`,
      'hero.line2': `is the one you`,
      'hero.line3': `never <em>notice</em>.`,
      'hero.lead': `I'm Odilbek, a backend developer from Qarshi. I design APIs, data and integrations that stay fast, secure and out of the way.`,
      'hero.ctaWork': `View selected work`,
      'hero.ctaContact': `Get in touch`,
      'hero.card.label': `Quick facts`,
      'hero.card.live': `online`,
      'hero.card.role': `role`,
      'hero.card.roleValue': `Backend`,
      'hero.card.exp': `experience`,
      'hero.card.expValue': `2+ years`,
      'hero.card.time': `local time`,
      'hero.card.place': `based in`,
      'hero.card.placeValue': `Qarshi, UZ`,
      'hero.scroll': `Scroll to explore`,
      'about.label': `About`,
      'about.note': `A short introduction`,
      'about.title': `A developer with a soft spot for <em>quiet, reliable</em> software.`,
      'about.status': `Currently open to freelance, internships and junior backend roles.`,
      'about.p1': `I'm Odilbek Normurodov, a backend developer based in Qarshi. For the past two years I've been building APIs, storefronts, booking flows and integrations — mostly the parts users never see, but always feel when they're missing.`,
      'about.p2': `I care about clean architecture, fast response times and interfaces that respect people's time. When I'm not shipping, I'm usually reading about systems design, learning something new, or practising Arabic.`,
      'stat.experience': `Years of experience`,
      'stat.projects': `Projects shipped`,
      'stat.languages': `Languages spoken`,
      'stat.reply': `Reply time`,
      'about.languages': `Languages I speak`,
      'work.label': `Work`,
      'work.note': `Live products, built end to end`,
      'work.title': `Selected <em>work</em>`,
      'work.intro': `Three products, three different problems. Each one is live — open a link and take a look.`,
      'work.live': `Live`,
      'project1.desc': `A Telegram-first digital storefront with automated order flow, product management and a clean buying experience.`,
      'project2.desc': `A product catalogue and lead-generation website for a professional car paint and equipment brand in Qarshi.`,
      'project3.desc': `A warm, multilingual restaurant site with a full digital menu, gallery, reviews and a table-booking flow.`,
      'work.more': `More projects on GitHub`,
      'services.label': `Services`,
      'services.note': `From first sketch to production`,
      'services.title': `How I can <em>help</em>`,
      'services.intro': `From idea to a working product — I take care of the backend side, the integrations and the details that keep everything running.`,
      'service1.title': `Backend architecture`,
      'service1.desc': `REST APIs, authentication, data models and business logic that stay understandable as the product grows.`,
      'service2.title': `Integrations & automation`,
      'service2.desc': `Telegram bots, payment flows, webhooks and third-party services connected without the duct tape.`,
      'service3.title': `Performance & deployment`,
      'service3.desc': `Caching, logging, Docker and Linux servers tuned for fast, predictable releases.`,
      'toolbox.label': `Tools I reach for`,
      'contact.label': `Contact`,
      'contact.note': `Let's work together`,
      'contact.title': `Have an idea?<br><em>Let's build it.</em>`,
      'contact.intro': `A project, an idea, or just a question? My inbox is open — and I usually reply within a day.`,
      'contact.email': `Email`,
      'contact.copy': `Copy email`,
      'contact.reply': `Usually replies within a day.`,
      'contact.place': `Based in`,
      'contact.form.name': `Your name`,
      'contact.form.emailLabel': `Email address`,
      'contact.form.message': `Your message`,
      'contact.form.namePh': `Your name`,
      'contact.form.emailPh': `you@example.com`,
      'contact.form.messagePh': `Tell me about the project, timeline and goals…`,
      'contact.form.submit': `Send message`,
      'contact.form.hint': `This opens your email app — no data is stored.`,
      'contact.form.error': `Please fill in all fields with a valid email.`,
      'contact.form.opening': `Opening your email app…`,
      'contact.form.fallback': `If nothing opens, write to me at`,
      'footer.tagline': `Backend developer building quiet, reliable systems.`,
      'footer.note': `Built from scratch in Qarshi.`,
      'footer.top': `Back to top`,
      'toast.copied': `Email copied`,
      'toast.copyError': `Couldn't copy — select the email manually`,
      'theme.label': `Dark mode`,
      'theme.toDark': `Switch to dark mode`,
      'theme.toLight': `Switch to light mode`
    },
    uz: {
      'nav.work': `Ishlar`,
      'nav.about': `Men haqimda`,
      'nav.services': `Xizmatlar`,
      'nav.contact': `Aloqa`,
      'a11y.skip': `Kontentga o‘tish`,
      'a11y.language': `Til`,
      'menu.label': `Menyu`,
      'menu.open': `Menyuni ochish`,
      'menu.close': `Menyuni yopish`,
      'hero.eyebrow': `Backend dasturchi — Qarshi, O‘zbekiston`,
      'hero.avail': `Tanlangan loyihalar uchun ochiq`,
      'hero.line1': `Eng zo‘r <em>backend</em> —`,
      'hero.line2': `siz umuman`,
      'hero.line3': `<em>sezmaydigan</em> tizim.`,
      'hero.lead': `Men Odilbek — Qarshilik backend dasturchi. Tez, xavfsiz va ortiqcha ovozsiz ishlaydigan API, ma’lumotlar va integratsiyalar yarataman.`,
      'hero.ctaWork': `Ishlarni ko‘rish`,
      'hero.ctaContact': `Bog‘lanish`,
      'hero.card.label': `Qisqa ma’lumotlar`,
      'hero.card.live': `onlayn`,
      'hero.card.role': `rol`,
      'hero.card.roleValue': `Backend`,
      'hero.card.exp': `tajriba`,
      'hero.card.expValue': `2+ yil`,
      'hero.card.time': `mahalliy vaqt`,
      'hero.card.place': `manzil`,
      'hero.card.placeValue': `Qarshi, UZ`,
      'hero.scroll': `Pastga suring`,
      'about.label': `Men haqimda`,
      'about.note': `Qisqacha tanishuv`,
      'about.title': `<em>Sokin va ishonchli</em> dasturlarga mehr qo‘yadigan dasturchi.`,
      'about.status': `Hozirda frilanser, amaliyot va junior backend lavozimlariga ochiqman.`,
      'about.p1': `Men Odilbek Normurodov, Qarshida yashovchi backend dasturchiman. So‘nggi ikki yil davomida API’lar, onlayn do‘konlar, bron qilish oqimlari va integratsiyalar ustida ishladim — asosan foydalanuvchilar ko‘rmaydigan, lekin yetishmasa darhol sezadigan qismlar.`,
      'about.p2': `Toza arxitektura, tezkor javob vaqtlari va inson vaqtini qadrlaydigan interfeyslar men uchun muhim. Kod yozmayotgan paytlarimda tizimlar dizayni haqida o‘qiyman, yangi narsa o‘rganaman yoki arab tili bilan shug‘ullanaman.`,
      'stat.experience': `Yillik tajriba`,
      'stat.projects': `Loyiha`,
      'stat.languages': `Til`,
      'stat.reply': `Javob vaqti`,
      'about.languages': `Men biladigan tillar`,
      'work.label': `Ishlar`,
      'work.note': `Jonli mahsulotlar`,
      'work.title': `Tanlangan <em>ishlar</em>`,
      'work.intro': `Uchta mahsulot, uchta turli muammo. Har biri jonli — havolani ochib ko‘ring.`,
      'work.live': `Jonli`,
      'project1.desc': `Telegram’ga asoslangan raqamli do‘kon: avtomatik buyurtma oqimi, mahsulot boshqaruvi va qulay xarid tajribasi.`,
      'project2.desc': `Qarshidagi professional avto bo‘yoq va jihozlar brendi uchun mahsulot katalogi va mijozlar jalb qiluvchi sayt.`,
      'project3.desc': `Issiq va ko‘p tilli restoran sayti: to‘liq raqamli menyu, galereya, sharhlar va stol bron qilish oqimi.`,
      'work.more': `GitHub’da ko‘proq loyihalar`,
      'services.label': `Xizmatlar`,
      'services.note': `G‘oyadan ishlab chiqarishgacha`,
      'services.title': `Qanday <em>yordam</em> bera olaman`,
      'services.intro': `G‘oyadan ishlaydigan mahsulotgacha — backend tomoni, integratsiyalar va hammasi uzluksiz ishlashi uchun kerakli detallarni o‘z zimmamga olaman.`,
      'service1.title': `Backend arxitektura`,
      'service1.desc': `Mahsulot o‘sgani sari tushunarli bo‘lib qoladigan REST API’lar, autentifikatsiya, ma’lumot modellari va biznes logika.`,
      'service2.title': `Integratsiya va avtomatlashtirish`,
      'service2.desc': `Telegram botlar, to‘lov oqimlari, webhook’lar va uchinchi tomon xizmatlari — ishonchli va ozoda ulanish.`,
      'service3.title': `Tezlik va deploy`,
      'service3.desc': `Keshlash, logging, Docker va Linux serverlar — tez va barqaror relizlar uchun sozlangan.`,
      'toolbox.label': `Ko‘p ishlatadigan vositalarim`,
      'contact.label': `Aloqa`,
      'contact.note': `Birga ishlaymizmi?`,
      'contact.title': `G‘oyangiz bormi?<br><em>Keling, birga quramiz.</em>`,
      'contact.intro': `Loyiha, g‘oya yoki shunchaki savolingiz bormi? Pochta qutim ochiq — odatda bir kun ichida javob beraman.`,
      'contact.email': `Email`,
      'contact.copy': `Emailni nusxalash`,
      'contact.reply': `Odatda bir kun ichida javob beraman.`,
      'contact.place': `Manzil`,
      'contact.form.name': `Ismingiz`,
      'contact.form.emailLabel': `Email manzilingiz`,
      'contact.form.message': `Xabaringiz`,
      'contact.form.namePh': `Ismingiz`,
      'contact.form.emailPh': `siz@example.com`,
      'contact.form.messagePh': `Loyiha, muddat va maqsadlar haqida yozing…`,
      'contact.form.submit': `Xabar yuborish`,
      'contact.form.hint': `Bu email ilovangizni ochadi — ma’lumot saqlanmaydi.`,
      'contact.form.error': `Iltimos, barcha maydonlarni to‘g‘ri to‘ldiring.`,
      'contact.form.opening': `Email ilovangiz ochilmoqda…`,
      'contact.form.fallback': `Agar ilova ochilmasa, menga yozing:`,
      'footer.tagline': `Sokin va ishonchli tizimlar quradigan backend dasturchi.`,
      'footer.note': `Qarshida noldan qurilgan.`,
      'footer.top': `Yuqoriga`,
      'toast.copied': `Email nusxalandi`,
      'toast.copyError': `Nusxalab bo‘lmadi — emailni qo‘lda belgilang`,
      'theme.label': `Tungi rejim`,
      'theme.toDark': `Tungi rejimga o‘tish`,
      'theme.toLight': `Kunduzgi rejimga o‘tish`
    },
  };

  function t(key) {
    return (copy[currentLang] || copy.en)[key] || (copy.en[key] || key);
  }

  /* -----------------------------------------------------------------
     Theme — day / night
  ----------------------------------------------------------------- */

  const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const THEME_KEY = 'odilbek-theme';

  function currentTheme() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function updateThemeLabel() {
    if (!themeToggle) return;
    const isDark = currentTheme() === 'dark';
    themeToggle.setAttribute('aria-label', t('theme.label'));
    themeToggle.setAttribute('title', t(isDark ? 'theme.toLight' : 'theme.toDark'));
    themeToggle.setAttribute('aria-pressed', String(isDark));
  }

  function applyTheme(theme, persist = true) {
    root.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    const isDark = currentTheme() === 'dark';
    if (themeMeta) themeMeta.setAttribute('content', isDark ? '#121110' : '#f2efe7');
    updateThemeLabel();
    if (persist) {
      try { localStorage.setItem(THEME_KEY, currentTheme()); } catch (error) { /* ignore */ }
    }
  }

  applyTheme(currentTheme(), false);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      if (typeof document.startViewTransition === 'function' && !prefersReduced) {
        document.startViewTransition(() => applyTheme(next));
      } else {
        applyTheme(next);
      }
    });
  }

  if (themeQuery.addEventListener) {
    themeQuery.addEventListener('change', (event) => {
      let stored = null;
      try { stored = localStorage.getItem(THEME_KEY); } catch (error) { /* ignore */ }
      if (!stored) applyTheme(event.matches ? 'dark' : 'light', false);
    });
  }

  /* -----------------------------------------------------------------
     Language
  ----------------------------------------------------------------- */

  const langButtons = $$('.lang-btn');
  try {
    const stored = localStorage.getItem('odilbek-lang');
    if (stored === 'uz' || stored === 'en') currentLang = stored;
  } catch (error) { /* storage can be unavailable */ }

  function updateMenuLabel() {
    if (!menuToggle) return;
    menuToggle.setAttribute('aria-label', t(menuOpen ? 'menu.close' : 'menu.open'));
  }

  function applyLanguage(lang, persist = true) {
    const dict = copy[lang] || copy.en;
    currentLang = copy[lang] ? lang : 'en';

    $$('[data-i18n]').forEach((element) => {
      const value = dict[element.dataset.i18n];
      if (value) element.textContent = value;
    });
    $$('[data-i18n-html]').forEach((element) => {
      const value = dict[element.dataset.i18nHtml];
      if (value) element.innerHTML = value;
    });
    $$('[data-i18n-placeholder]').forEach((element) => {
      const value = dict[element.dataset.i18nPlaceholder];
      if (value) element.setAttribute('placeholder', value);
    });
    $$('[data-i18n-aria]').forEach((element) => {
      const value = dict[element.dataset.i18nAria];
      if (value) element.setAttribute('aria-label', value);
    });

    root.lang = currentLang;
    langButtons.forEach((button) => {
      const active = button.dataset.lang === currentLang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    updateThemeLabel();
    updateMenuLabel();

    const isUz = currentLang === 'uz';
    document.title = isUz
      ? 'Odilbek Normurodov — Backend dasturchi'
      : 'Odilbek Normurodov — Backend Developer';

    const description = isUz
      ? "Odilbek Normurodov — Qarshilik backend dasturchi. Tez, xavfsiz API’lar, integratsiyalar va raqamli mahsulotlar."
      : 'Odilbek Normurodov is a backend developer from Qarshi, Uzbekistan, building fast, secure APIs, integrations and digital products.';

    const descriptionMeta = $('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.setAttribute('content', description);

    const ogTitle = $('meta[property="og:title"]');
    const ogDescription = $('meta[property="og:description"]');
    const twitterTitle = $('meta[name="twitter:title"]');
    const twitterDescription = $('meta[name="twitter:description"]');
    if (ogTitle) ogTitle.setAttribute('content', document.title);
    if (ogDescription) ogDescription.setAttribute('content', description);
    if (twitterTitle) twitterTitle.setAttribute('content', document.title);
    if (twitterDescription) twitterDescription.setAttribute('content', description);

    if (persist) {
      try { localStorage.setItem('odilbek-lang', currentLang); } catch (error) { /* ignore */ }
    }
    if (hasMotion) ScrollTrigger.refresh();
  }

  langButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.lang && button.dataset.lang !== currentLang) {
        applyLanguage(button.dataset.lang);
      }
    });
  });

  applyLanguage(currentLang, false);

  /* -----------------------------------------------------------------
     Clock — Qarshi (Asia/Tashkent)
  ----------------------------------------------------------------- */

  const clockParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  function updateClocks() {
    const parts = clockParts.formatToParts(new Date());
    const get = (type) => {
      const part = parts.find((item) => item.type === type);
      return part ? part.value : '--';
    };
    const full = `${get('hour')}:${get('minute')}:${get('second')}`;
    const short = `${get('hour')}:${get('minute')}`;
    $$('[data-clock]').forEach((element) => {
      element.textContent = element.dataset.clock === 'short' ? short : full;
    });
  }

  updateClocks();
  window.setInterval(updateClocks, 1000);

  /* -----------------------------------------------------------------
     Smooth scrolling
  ----------------------------------------------------------------- */

  if (hasLenis && hasGSAP && !prefersReduced) {
    lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1.02,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.15
    });
    if (hasScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function onScroll(data) {
    const scroll = typeof data.scroll === 'number' ? data.scroll : window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = typeof data.progress === 'number' ? data.progress : scroll / max;
    if (progressBar) {
      progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    }
    if (!header) return;
    header.classList.toggle('is-scrolled', scroll > 24);

    if (menuOpen) return;
    if (performance.now() < headerLockUntil) {
      header.classList.remove('is-hidden');
      return;
    }
    if (typeof data.direction === 'number') {
      if (data.direction === 1 && data.velocity > 2 && scroll > 240) {
        header.classList.add('is-hidden');
      } else if (data.direction === -1 || scroll < 160) {
        header.classList.remove('is-hidden');
      }
    }
  }

  if (lenis) {
    lenis.on('scroll', onScroll);
  } else {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      onScroll({
        scroll: y,
        progress: y / max,
        direction: y > lastY ? 1 : -1,
        velocity: Math.abs(y - lastY)
      });
      lastY = y;
    }, { passive: true });
    onScroll({
      scroll: window.scrollY,
      progress: window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    });
  }

  /* -----------------------------------------------------------------
     Loader + hero entrance
  ----------------------------------------------------------------- */

  const isCompact = window.matchMedia('(max-width: 760px)').matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || '')));
  const heroLines = $$('.hero-title .line-inner');
  const introTargets = $$('[data-intro]');
  const animateHero = hasGSAP && !prefersReduced && !isCompact;
  let intro = null;

  if (animateHero) {
    gsap.set(heroLines, { y: 0, yPercent: 112 });
    gsap.set(introTargets, { opacity: 0, y: 18 });

    intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    intro
      .to(heroLines, { yPercent: 0, duration: 1.3, stagger: 0.075, ease: 'expo.out' }, 0)
      .to(introTargets, { opacity: 1, y: 0, duration: 0.9, stagger: 0.06 }, 0.24);
  }

  let seenLoader = false;
  try { seenLoader = sessionStorage.getItem('odilbek-visited') === '1'; } catch (error) { /* ignore */ }

  const skipLoader = seenLoader || isCompact || saveData;

  if (!hasMotion || !loader || !intro) {
    if (loader) loader.remove();
    if (intro) intro.progress(1);
  } else if (skipLoader) {
    loader.remove();
    body.style.overflow = '';
    intro.timeScale(isCompact ? 2 : 1.45).play();
  } else {
    try { sessionStorage.setItem('odilbek-visited', '1'); } catch (error) { /* ignore */ }

    const loaderName = $('.loader-name span', loader);
    const loaderBar = $('#loader-bar');
    const loaderPercent = $('#loader-percent');
    const counter = { value: 0 };
    if (loaderName) gsap.set(loaderName, { y: 0, yPercent: 112 });
    if (lenis) lenis.stop(); else body.style.overflow = 'hidden';

    const loaderTimeline = gsap.timeline({
      onComplete: () => {
        loader.remove();
        body.style.overflow = '';
      }
    });

    loaderTimeline
      .to(counter, {
        value: 100,
        duration: 0.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (loaderPercent) loaderPercent.textContent = String(Math.round(counter.value));
        }
      }, 0)
      .to(loaderName, { yPercent: 0, duration: 0.75, ease: 'expo.out' }, 0.02)
      .to(loaderBar, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 0)
      .to(loader, { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, 0.82)
      .call(() => {
        if (lenis) lenis.start();
        else body.style.overflow = '';
        intro.play();
      }, null, 0.95)
      .fromTo(header, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 1.02);
  }

  /* -----------------------------------------------------------------
     Scroll reveals + counters
  ----------------------------------------------------------------- */

  if (hasMotion) {
    $$('[data-reveal]').forEach((element) => {
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 1.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          once: true
        }
      });
    });

    $$('[data-count]').forEach((element) => {
      const target = Number.parseInt(element.dataset.count, 10);
      const pad = Number.parseInt(element.dataset.pad || '0', 10);
      const value = { current: 0 };
      if (!Number.isFinite(target)) return;

      ScrollTrigger.create({
        trigger: element,
        start: 'top 92%',
        once: true,
        onEnter: () => {
          gsap.to(value, {
            current: target,
            duration: 1.7,
            ease: 'power2.out',
            onUpdate: () => {
              const number = Math.round(value.current);
              element.textContent = pad ? String(number).padStart(pad, '0') : String(number);
            }
          });
        }
      });
    });
  }

  /* -----------------------------------------------------------------
     Mobile menu
  ----------------------------------------------------------------- */

  function menuFocusables() {
    if (!menu) return [];
    const candidates = [menuToggle, ...$$('a[href]', menu)];
    return candidates.filter((element) => element && element.offsetParent !== null);
  }

  function openMenu() {
    if (menuOpen || !menu || !menuToggle) return;
    menuOpen = true;
    menu.inert = false;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    updateMenuLabel();
    body.classList.add('menu-open');
    if (header) {
      header.classList.add('is-open');
      header.classList.remove('is-hidden');
    }
    if (lenis) lenis.stop();
    body.style.overflow = 'hidden';

    if (hasGSAP) {
      gsap.fromTo('.menu-link', { y: 28, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.65, stagger: 0.055, ease: 'power3.out', delay: 0.12
      });
      gsap.fromTo('.menu-foot > *', { y: 14, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.3
      });
    }

    window.setTimeout(() => {
      const firstLink = menu.querySelector('a');
      if (firstLink) firstLink.focus({ preventScroll: true });
    }, 280);
  }

  function closeMenu(returnFocus = true) {
    if (!menuOpen || !menu || !menuToggle) return;
    menuOpen = false;
    menu.inert = true;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    updateMenuLabel();
    body.classList.remove('menu-open');
    if (header) header.classList.remove('is-open');
    if (lenis) lenis.start();
    body.style.overflow = '';
    if (returnFocus) menuToggle.focus({ preventScroll: true });
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (menuOpen) closeMenu(); else openMenu();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!menuOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== 'Tab') return;
    const items = menuFocusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960 && menuOpen) closeMenu(false);
  });

  /* -----------------------------------------------------------------
     Anchor scrolling
  ----------------------------------------------------------------- */

  function scrollToTarget(target, { focus = false, updateHistory = false } = {}) {
    if (!target) return;
    headerLockUntil = performance.now() + 1500;
    if (header) header.classList.remove('is-hidden');

    const isTop = target.id === 'top';
    if (isTop) {
      if (lenis) lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    } else if (lenis) {
      lenis.scrollTo(target, { offset: -78, duration: 1.35 });
    } else {
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    }

    if (focus) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }

    if (updateHistory) {
      const hash = isTop ? '#top' : `#${target.id}`;
      if (window.location.hash !== hash) {
        history.pushState(null, '', hash);
      }
    }
  }

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();

      const fromMenu = link.hasAttribute('data-menu-link');
      const isSkip = link.classList.contains('skip-link');
      if (menuOpen) closeMenu(false);

      scrollToTarget(target, {
        focus: fromMenu || isSkip,
        updateHistory: !isSkip
      });
    });
  });

  window.addEventListener('popstate', () => {
    const hash = window.location.hash;
    if (!hash || hash === '#') {
      if (lenis) lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      return;
    }
    const target = document.querySelector(hash);
    if (target) scrollToTarget(target);
  });

  /* -----------------------------------------------------------------
     Cursor, magnetic buttons, project preview
  ----------------------------------------------------------------- */

  if (finePointer && hasGSAP && !prefersReduced) {
    const dot = $('.cursor');
    const ring = $('.cursor-ring');
    const cursorLabel = $('.cursor-label');

    if (dot && ring) {
      root.classList.add('has-custom-cursor');
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

      const dotX = gsap.quickTo(dot, 'x', { duration: 0.09, ease: 'power2.out' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.09, ease: 'power2.out' });
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' });

      window.addEventListener('mousemove', (event) => {
        dotX(event.clientX);
        dotY(event.clientY);
        ringX(event.clientX);
        ringY(event.clientY);
      }, { passive: true });

      document.addEventListener('mouseover', (event) => {
        const interactive = event.target.closest('a, button, input, textarea, .lang-btn');
        const labelled = event.target.closest('[data-cursor]');
        ring.classList.toggle('is-hover', Boolean(interactive));
        ring.classList.toggle('has-label', Boolean(labelled));
        if (cursorLabel && labelled) cursorLabel.textContent = labelled.dataset.cursor || 'View';
      });
    }

    $$('[data-magnetic]').forEach((element) => {
      const moveX = gsap.quickTo(element, 'x', { duration: 0.5, ease: 'power3.out' });
      const moveY = gsap.quickTo(element, 'y', { duration: 0.5, ease: 'power3.out' });

      element.addEventListener('mousemove', (event) => {
        const bounds = element.getBoundingClientRect();
        moveX((event.clientX - bounds.left - bounds.width / 2) * 0.16);
        moveY((event.clientY - bounds.top - bounds.height / 2) * 0.22);
      });
      element.addEventListener('mouseleave', () => {
        moveX(0);
        moveY(0);
      });
    });
  }

  if (preview && finePointer && hasGSAP && !prefersReduced) {
    const previewImage = $('img', preview);
    const previewName = $('.wp-name', preview);
    const previewCategory = $('.wp-cat', preview);
    const moveX = gsap.quickTo(preview, 'x', { duration: 0.58, ease: 'power3.out' });
    const moveY = gsap.quickTo(preview, 'y', { duration: 0.58, ease: 'power3.out' });
    const tilt = gsap.quickTo(preview, 'rotation', { duration: 0.7, ease: 'power3.out' });
    let previewVisible = false;

    gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0.9, rotation: 0 });

    function positionPreview(event) {
      const width = preview.offsetWidth || 300;
      const height = preview.offsetHeight || 190;
      const gap = 34;
      const roomOnRight = event.clientX + width + gap < window.innerWidth;
      let x = roomOnRight
        ? event.clientX + gap + width / 2
        : event.clientX - gap - width / 2;
      x = Math.min(
        Math.max(x, width / 2 + 16),
        window.innerWidth - width / 2 - 16
      );
      const y = Math.min(
        Math.max(event.clientY, height / 2 + 16),
        window.innerHeight - height / 2 - 16
      );
      return { x, y };
    }

    $$('.project').forEach((project) => {
      project.addEventListener('mouseenter', (event) => {
        if (previewImage && project.dataset.preview) previewImage.src = project.dataset.preview;
        if (previewName) previewName.textContent = project.dataset.previewName || '';
        if (previewCategory) previewCategory.textContent = project.dataset.previewCat || '';

        if (!previewVisible) {
          const point = positionPreview(event);
          gsap.set(preview, { x: point.x, y: point.y });
          previewVisible = true;
        }
        preview.classList.add('is-active');
        gsap.to(preview, { scale: 1, duration: 0.45, ease: 'power3.out' });
      });

      project.addEventListener('mousemove', (event) => {
        const point = positionPreview(event);
        moveX(point.x);
        moveY(point.y);
        tilt(gsap.utils.clamp(-7, 7, (event.movementX || 0) * 0.55));
      });

      project.addEventListener('mouseleave', () => {
        preview.classList.remove('is-active');
        tilt(0);
        gsap.to(preview, { scale: 0.9, duration: 0.4, ease: 'power3.out' });
      });
    });
  }

  /* -----------------------------------------------------------------
     Marquee
  ----------------------------------------------------------------- */

  if (marqueeTrack && marqueeGroup && hasGSAP && !prefersReduced) {
    let groupWidth = 0;
    let offset = 0;
    let speed = 0.55;

    const measureMarquee = () => {
      groupWidth = marqueeGroup.getBoundingClientRect().width;
    };
    measureMarquee();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureMarquee).catch(() => {});
    }
    window.addEventListener('resize', measureMarquee, { passive: true });

    if (lenis) {
      lenis.on('scroll', ({ velocity }) => {
        speed = Math.min(5.5, 0.55 + Math.abs(velocity) * 0.4);
      });
    }

    gsap.ticker.add((time, deltaTime) => {
      const delta = Math.min(deltaTime || 16.67, 50);
      speed += (0.55 - speed) * 0.026;
      offset -= speed * (delta / 16.667);
      if (groupWidth > 0) {
        while (offset <= -groupWidth) offset += groupWidth;
      }
      marqueeTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
    });
  }

  /* -----------------------------------------------------------------
     Copy email + toast
  ----------------------------------------------------------------- */

  let toastTimer = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  const emailAddress = 'normurodovodilbek3110@gmail.com';
  const copyButton = $('#copy-email');

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      let copied = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(emailAddress);
          copied = true;
        } catch (error) { /* fall through to legacy copy */ }
      }

      if (!copied) {
        const field = document.createElement('textarea');
        field.value = emailAddress;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.top = '0';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
        field.remove();
      }

      showToast(t(copied ? 'toast.copied' : 'toast.copyError'));
    });
  }

  /* -----------------------------------------------------------------
     Contact form — composes a mailto link
  ----------------------------------------------------------------- */

  if (form) {
    const status = $('#form-status');
    const nameField = form.querySelector('[name="name"]');
    const emailField = form.querySelector('[name="email"]');
    const messageField = form.querySelector('[name="message"]');

    function setFormStatus(message, color) {
      if (!status) return;
      status.textContent = message;
      status.style.color = color || '';
    }

    form.addEventListener('input', (event) => {
      if (event.target && event.target.removeAttribute) event.target.removeAttribute('aria-invalid');
      setFormStatus('');
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      if (data.get('_gotcha')) return;

      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();
      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      [nameField, emailField, messageField].forEach((field) => {
        if (field) field.removeAttribute('aria-invalid');
      });

      if (!name || !emailIsValid || !message) {
        setFormStatus(t('contact.form.error'), '#ff9a82');
        if (!name && nameField) nameField.setAttribute('aria-invalid', 'true');
        if (!emailIsValid && emailField) emailField.setAttribute('aria-invalid', 'true');
        if (!message && messageField) messageField.setAttribute('aria-invalid', 'true');
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const subject = encodeURIComponent(`Portfolio enquiry — ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      setFormStatus(t('contact.form.opening'), '#b9d8b9');
      window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;

      window.setTimeout(() => {
        setFormStatus(`${t('contact.form.fallback')} ${emailAddress}`, '');
      }, 1800);
    });
  }

  /* -----------------------------------------------------------------
     Back to top
  ----------------------------------------------------------------- */

  const toTop = $('#to-top');
  if (toTop) {
    toTop.addEventListener('click', () => {
      headerLockUntil = performance.now() + 1200;
      if (header) header.classList.remove('is-hidden');
      if (lenis) lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  }

  /* -----------------------------------------------------------------
     Active navigation link
  ----------------------------------------------------------------- */

  const navLinks = $$('[data-nav]');
  const navSections = ['top', 'work', 'about', 'services', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      const active = link.dataset.nav === id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && navSections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        setActiveNav(entry.target.id);
      });
    }, { rootMargin: '-32% 0px -56% 0px', threshold: 0 });

    navSections.forEach((section) => spy.observe(section));
  }

  /* -----------------------------------------------------------------
     Final refreshes
  ----------------------------------------------------------------- */

  if (hasMotion) {
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
  }

  if (!window.location.hash) {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }

  window.__odilReady = true;
})();
