# Odilbek Normurodov — Portfolio

Personal portfolio for **Odilbek Normurodov**, a backend developer based in
Qarshi, Uzbekistan. A static, motion-first site with no build step, no
framework and no tracking.

**Live:** <https://normurodov-org.github.io/odil-dev/>

## Stack

- Semantic HTML, hand-written CSS and vanilla JavaScript
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling
- [GSAP](https://gsap.com/) + ScrollTrigger for reveals, counters and the
  floating project preview
- Self-hosted **Inter Tight** and **Instrument Serif** (no Google Fonts)
- Everything is vendored in `vendor/` — the site has no runtime CDN dependency

## Run locally

```bash
cd path/to/odil-dev
python3 -m http.server 4173
```

Open <http://localhost:4173>. A local server is recommended so fonts, images
and `fetch`-free assets load with the right headers. Double-clicking
`index.html` also works.

## Structure

```
index.html            markup, metadata, copy keys
styles.css            design tokens, layout, responsive rules, themes
main.js               i18n, theme, menu, reveals, clock, form, cursor
vendor/               Lenis, GSAP and ScrollTrigger (local copies)
assets/fonts/         Inter Tight + Instrument Serif (woff2)
assets/projects/      project screenshots (full + 720px JPEG/WebP variants)
assets/favicon.svg    logo mark
assets/favicon-32.png, assets/apple-touch-icon.png
assets/og-image.jpg   1200×630 social preview
404.html              self-contained GitHub Pages error page
robots.txt, sitemap.xml
```

## Editing

- **Copy / translations** — edit the text in `index.html` and the matching
  strings in the `copy` object at the top of `main.js` (English and Uzbek).
  Keep both languages in sync.
- **Projects** — update the `.project` blocks in `index.html`, the screenshots
  in `assets/projects/`, and the `data-preview*` attributes used by the hover
  preview. Keep the `-720.jpg` variants for mobile thumbnails.
- **Services / toolbox** — edit the Services section in `index.html`; the
  lists are plain markup.
- **Colours and type** — the palette and type stacks live in the `:root` and
  `html[data-theme="dark"]` blocks at the top of `styles.css`.
- **Contact form** — it validates locally and opens the visitor's email app
  with a prefilled message (`mailto:`). No data is stored. To use a form
  service instead, replace the submit handler in `main.js`.
- **Social links and email** — update them in the header menu, contact section
  and footer of `index.html`, and in `main.js` for the copy-to-clipboard
  address.

## Liquid Glass study

`glass/` is a separate, self-contained page that re-imagines the portfolio in
Apple's Liquid Glass language (iOS 26 / macOS Tahoe 26): floating frosted dock,
pointer-lit rim highlights, spring motion, a tinted primary button, a mobile
tab bar and a circular theme reveal.

```bash
python3 -m http.server 4173   # then open /glass/
```

- [`glass/glass.css`](glass/glass.css) — the material and motion system
- [`glass/glass.js`](glass/glass.js) — behaviour, no dependencies
- [`LIQUID-GLASS.md`](LIQUID-GLASS.md) — the playbook: principles, recipes,
  motion specs, performance and accessibility notes

The main portfolio and this study live side by side, with their own CSS and JavaScript.

## Deploy

The site is deployed with **GitHub Pages** from the `main` branch (root
folder). Any push to `main` republishes it.

To use a custom domain:

1. Add a `CNAME` file with the domain.
2. Update the absolute URLs in `index.html` (`canonical`, `og:url`,
   `og:image`, Twitter meta, JSON-LD), `robots.txt`, `sitemap.xml` and the
   `/odil-dev/` links inside `404.html`.

## Accessibility and performance

- Skip link, visible focus styles, keyboard-trapped mobile menu, labelled
  controls and `aria-current` navigation state
- `prefers-reduced-motion` disables the loader, smooth scrolling, cursor and
  decorative animation, and renders all content immediately
- Theme and language preferences persist in `localStorage`; the intro loader
  runs once per session on larger screens and is skipped on phones, save-data
  and slow connections
- WCAG AA contrast for body and interface text in both themes
- Project images are lazy-loaded, with 720px JPEG/WebP variants on small
  screens; fonts are preloaded and self-hosted

## Contact

- Email: <normurodovodilbek3110@gmail.com>
- GitHub: <https://github.com/normurodov-org>
- Telegram: <https://t.me/normuzb>

---

© 2026 Odilbek Normurodov. Code and content are original work unless noted.
