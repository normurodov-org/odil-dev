# Liquid Glass, for the web

A practical guide to the design language Apple introduced at WWDC 2025 — the
material, the geometry, the motion — and how to rebuild it honestly in HTML and
CSS. Everything here is implemented in `glass/`, so you can read the guide and
the code side by side.

> **The medium is not the message.** The real Liquid Glass is a GPU material that
> samples, bends and reflects the content behind it in real time. The web cannot
> do that. What you *can* do is reproduce the **cues** that make it read as glass:
> the frosted sample, the rim light, the moving specular, the floating shadow,
> and the restraint about where it is allowed to appear. That last part matters
> more than any CSS filter.

---

## 1. The one rule

**Glass is the control layer that floats above content. It is never the content.**

Apple's guidance is unusually strict about this: navigation bars, tab bars,
toolbars, buttons, menus and the floating control cluster. Not cards, not lists,
not table rows, not text containers, not media frames. Content sits on solid,
legible surfaces; glass sits above it, and the two never mix.

That single rule is what separates "iOS 26" from the 2020 glassmorphism trend
(everything translucent, nothing readable). If you break only one rule in this
document, don't break this one.

The second rule: **glass cannot sample glass.** On iOS this is a rendering
constraint; on the web, nested `backdrop-filter` layers look muddy and cost
twice as much. One glass surface per stacking layer.

---

## 2. What the material actually is

Five physical behaviours, in order of importance:

| Behaviour | What it looks like | Web equivalent |
|---|---|---|
| **Frost** | What's behind is blurred, saturated and slightly brightened | `backdrop-filter: blur() saturate() brightness()` |
| **Specular** | A soft highlight that moves as the device/pointer moves | Radial gradient at `--mx/--my`, updated in `rAF` |
| **Rim light** | A bright 1px edge where light grazes the glass | 1px masked conic gradient + inset shadows |
| **Lensing** | Edges bend and magnify what's behind | Approximated: brighter rim + inner glow (see §5) |
| **Float** | A soft, wide shadow separating it from content | `box-shadow: 0 24px 60px -18px` |

Two variants exist in the OS, and the distinction is useful on the web too:

- **Regular** — the default. More opaque, more legible, for nearly everything.
- **Clear** — more transparent and richer. Only over media, only with bold/bright
  foreground text, only on simple shapes. This is what the project labels in
  `glass/index.html` use (`.glass--clear`).

And one interaction detail people forget: **glass is interactive**. Press it and
it scales down slightly; hover it and light moves across it. Static glass looks
like a PNG.

---

## 3. Design laws

**Hierarchy.** Chrome floats; content is primary. Bars should shrink, hide or
simplify as you scroll so the content keeps the stage. In `glass/` the dock loses
8px of height and gains opacity after 24px of scroll, and the mobile tab bar
slides away when you scroll down and returns when you scroll up.

**Harmony.** Geometry follows the hardware: capsule controls, concentric corner
radii, and a consistent spacing rhythm. Nested corners must share a centre:

```
inner radius = outer radius − padding
```

A 30px card with 14px padding gets 16px inner elements. Getting this wrong is
the fastest way to make an interface feel "designed by a developer".

**Consistency.** One material, one set of motion curves, one radius scale. Apple
adapts across window sizes rather than redesigning per breakpoint — the layout
reflows, the language does not change.

---

## 4. Building the material

The complete recipe, stripped to its essentials:

```css
.glass {
  position: relative;
  isolation: isolate;                  /* keeps the layers honest */

  background-color: rgba(255, 255, 255, 0.10);
  background-image: linear-gradient(
    180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0) 46%
  );

  -webkit-backdrop-filter: blur(22px) saturate(180%);
  backdrop-filter: blur(22px) saturate(180%);

  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.55),   /* top edge catches light */
    inset 0 -0.5px 0 rgba(255, 255, 255, 0.08),  /* bottom edge is darker  */
    0 0 0 0.5px rgba(255, 255, 255, 0.16),       /* hairline definition    */
    0 22px 56px -18px rgba(0, 0, 0, 0.55);       /* the float              */
}
```

Why each line matters:

- **`background-color` at 8–14% (dark) or 40–50% (light).** Pure
  `backdrop-filter` with no fill has no body; it looks like a blur cut-out.
  The fill is what gives it thickness.
- **The top-to-bottom gradient** is a fake reflection. Real glass picks up the
  sky; this picks up "light from above".
- **Blur 20–26px, saturate 160–200%.** Below ~16px it reads as a smudge; above
  ~30px it stops reading as a surface. Saturation is what makes colours behind
  the glass bloom instead of turning grey.
- **The 0.5px outer ring** defines the shape on busy backgrounds where the
  shadow disappears.
- **`inset` shadows are asymmetric on purpose.** Light comes from above: bright
  top, dark bottom. Symmetric inset glows look like plastic.

### Light and dark are not the same material

| Token | Dark | Light |
|---|---|---|
| `--glass` | `rgba(255,255,255,.10)` | `rgba(255,255,255,.40)` |
| `--rim-top` | `rgba(255,255,255,.55)` | `rgba(255,255,255,.98)` |
| `--shadow` | `rgba(0,0,0,.55)` | `rgba(38,46,80,.18)` |
| `--ink` | `#f7f7fa` | `#17171b` |

Light-mode glass is mostly *white*, not transparent: over a pastel wallpaper,
40% white plus blur is enough to read as frosted. Dark-mode glass is mostly
*absent*: 10% white over an already-dark scene is all the material you need.
Getting these backwards produces the classic "grey sludge" panel.

---

## 5. The optical cues

### Rim light that responds to the pointer

A conic gradient masked to a 1px ring, rotated toward the pointer:

```css
.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: inherit;
  padding: 1px;
  background: conic-gradient(
    from var(--ang, 145deg),
    transparent 0deg,
    rgba(255,255,255,.9) 38deg,
    rgba(255,255,255,.2) 96deg,
    transparent 168deg,
    rgba(255,255,255,.28) 250deg,
    transparent 322deg
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  opacity: calc(0.32 + var(--near, 0) * 0.5);
  transition: opacity .5s cubic-bezier(.22,1,.36,1);
}
```

`padding: 1px` + `content-box` masking is what turns a gradient into a ring.
The `--ang` variable comes from `Math.atan2(dy, dx)` in `glass.js`.

### Specular

```css
.glass::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    160px circle at var(--mx, 24%) var(--my, 0%),
    rgba(255,255,255,.3), transparent 62%
  );
  opacity: calc(0.2 + var(--near, 0) * 0.7);
  mix-blend-mode: screen;   /* soft-light in light mode */
  pointer-events: none;
}
```

Update `--mx`/`--my` in a `requestAnimationFrame` in the pointer handler — never
in the event itself, and never with `left/top` (that would relayout). `screen`
blending on dark glass and `soft-light` on light glass keeps it from blowing out.

### Lensing

This is the hard one. Real lensing is a displacement map applied to the backdrop.
`backdrop-filter` cannot sample with an SVG displacement filter reliably, so the
honest web version is an *implication* of refraction:

1. A brighter, 1px rim exactly where the surface curves away (above).
2. A soft inner glow: `inset 0 0 18px rgba(255,255,255,.06)`.
3. A tiny magnification of what's behind, faked by a slightly stronger
   `saturate()` and `brightness(1.03–1.08)` in the backdrop filter.

If you want a real refraction effect, the only robust route is WebGL: render the
background to a texture, draw the glass shape as a mesh, sample the texture with
an offset proportional to the surface normal at the edges. That is a shader job,
not a CSS job — and on a portfolio it is usually not worth the weight.

> Do not copy the "SVG turbulence displacement" demos you see on CodePen. They
> distort the *content* of the glass, not the backdrop, and they break text
> rendering and accessibility.

---

## 6. Geometry

- **Capsule controls.** Every button, tab and toolbar is a pill:
  `border-radius: 999px`. This is the strongest single signifier of the language.
- **Radius scale.** `30px` cards, `24px` media, `16px` inner elements, `999px`
  controls. Keep it to four values and nest them concentrically.
- **44px minimum target.** Even when the visual control is 36px, pad the hit
  area to 44px.
- **Floating inset.** The mobile tab bar is `min(420px, 100% - 24px)` wide with
  a 14px bottom offset — it floats inside the screen, it does not touch edges.
- **Content gutters stay conventional.** Glass chrome is insetted; the content
  grid is not. Mixing both is what makes an interface feel composed.

---

## 7. Typography

Apple's system look is SF Pro — on Apple hardware you get it for free with
`-apple-system`. Do not ship a webfont to imitate it; ship a fallback stack:

```css
--sans: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
        'Inter Tight', 'Helvetica Neue', Arial, sans-serif;
```

Rules that do most of the work:

- **Tighten as size grows.** Body `0`; 20px headings `-0.02em`; 100px display
  `-0.038em`. Untracked large type looks like a default browser heading.
- **Line height below 1 for display** (`0.95`), around `1.55–1.62` for body.
- **Weight, not size, for hierarchy.** Secondary text is the same size at 62%
  opacity, not 13px.
- **Let a serif in once.** `Instrument Serif` italic carries the two accents in
  this page ("good products", "Let's build it"). It is not part of Liquid Glass;
  it is what keeps the page from being a costume. Use it once or twice, never
  for UI.

---

## 8. Motion

Motion is where Liquid Glass is most often faked badly. The material is springy
and *physical*; the usual mistake is to make everything slow and floaty.

### Tokens used in this build

```css
--ease:   cubic-bezier(0.22, 1, 0.36, 1);   /* out-expo-ish, for travel */
--spring: cubic-bezier(0.34, 1.3, 0.5, 1);  /* slight overshoot, for UI  */
--t-fast: .18s;   /* hover, press                    */
--t:      .42s;   /* state changes                   */
--t-slow: .90s;   /* entrances, image scale          */
```

For real springs, generate a `linear()` easing (spring generators exist online)
or drive it in JS. `cubic-bezier` with a control point above 1 is enough for
small UI elements; anything that traverses the screen wants a proper spring.

### What moves, and how much

| Element | Motion |
|---|---|
| Dock | height 60→52px, opacity ↑, `.55s var(--ease)` |
| Buttons | pointer magnet ≤ 9px, `scale(.97)` on press, `.5s var(--spring)` |
| Glass rim/sheen | opacity only, `.5s`; position via custom props |
| Project image | `scale(1.045)`, `1.1s var(--ease)` — never `width` |
| Project label | `translateY(-2px)`, `.55s var(--spring)` |
| Hero lines | `translateY(105%)→0`, `1.15s`, 90ms stagger |
| Sections | `translateY(22px)→0` + fade, `.9s`, 70ms stagger |
| Tab bar | `translate(-50%, 160%)`, `.55s` |
| Theme | circular `clip-path` reveal, 620ms |

Two rules:

1. **Animate only `transform`, `opacity` and custom properties.** Animating
   `backdrop-filter`, `filter` or `border-radius` re-rasterises the layer on
   every frame and will drop to 20fps on a laptop.
2. **Move less than you think.** 2–9px of magnetism, 4% of image scale, 8px of
   bar height. Apple's motion is small and precise; the "wow" comes from it being
   *exactly* right, not large.

### The circle reveal

The theme switch is a view transition, clipped from the button:

```js
const box = themeBtn.getBoundingClientRect();
const x = box.left + box.width / 2;
const y = box.top + box.height / 2;
const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

document.startViewTransition(() => paintTheme(next)).ready.then(() => {
  document.documentElement.animate(
    { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
    { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)',
      pseudoElement: '::view-transition-new(root)' }
  );
});
```

Gate it on `prefers-reduced-motion` and feature-detect `startViewTransition`
(fallback: instant swap).

### Reduced motion

One block, applied at the top of the stylesheet, that neutralises every
animation and reveals all content:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    transition-duration: .001ms !important;
  }
  .js [data-reveal], .js .intro, .js .line__in {
    opacity: 1 !important; transform: none !important; animation: none !important;
  }
}
```

Also check the media query in JS (`matchMedia`) for rAF loops — the pointer
sheen and magnetism should not run at all.

---

## 9. Scroll chrome

Three pieces make a page feel like iOS 26:

1. **The floating dock.** Fixed, inset from the top, capsule, frosted. It
   condenses on scroll.
2. **The scroll edge effect.** A fixed, masked blur strip at the top of the
   viewport, so content dissolves as it slides under the bar:

   ```css
   .scroll-edge {
     position: fixed; inset: 0 0 auto; height: 108px; z-index: 40;
     backdrop-filter: blur(6px);
     mask-image: linear-gradient(#000 0 30%, transparent 92%);
     opacity: 0; transition: opacity .5s;
   }
   .is-scrolled .scroll-edge { opacity: 1; }
   ```

   Keep the blur weak (4–8px) — it is a hint, not a frosting. Disable it under
   `prefers-reduced-transparency`.

3. **The auto-hiding tab bar.** Hide on scroll down, show on scroll up, always
   show near the top. This is what gives content the whole screen.

---

## 10. Colour: glass needs something to bend

Glass over a flat background is invisible. You need a colourful, non-uniform
backdrop — a wallpaper, a mesh gradient, a photograph. Apple's wallpapers are
designed for exactly this.

In `glass/` the background is four large, blurred radial orbs on a near-black
base, plus 5% film grain and a vignette. The grain is not decoration: large soft
gradients band on 8-bit displays, and noise hides it.

Rules:

- **Four orbs, four hues** (violet, pink, teal, amber) at 30–55% opacity.
- **Blur them hard** (40–70px) so they read as light, not as circles.
- **Keep the centre calm.** Busy wallpaper under body text is a legibility
  problem you cannot solve with a scrim.
- **Animate the orbs extremely slowly** (30s, alternate) or not at all.
- **One accent.** The tinted primary button is the only saturated control;
  everything else is ink on glass.

---

## 11. Performance

`backdrop-filter` is one of the most expensive things you can put on a page. Each
surface forces the browser to snapshot and blur everything beneath it, and that
work repeats while scrolling.

- **Budget 6–8 glass surfaces.** `glass/` uses 7: the dock, 3 media labels, the
  hero toolbar, the mobile tab bar, and the sticky arrow on a hovered card.
- **Never nest them.** Glass inside glass breaks sampling and doubles the cost.
- **Never animate the blur radius.** Animate opacity of a pre-blurred layer, or
  don't animate it.
- **Keep surfaces small.** A 1180px-wide bar costs far more than a 200px pill.
  The dock is the one large exception; the scroll-edge strip is only 108px tall.
- **`will-change` is a scalpel.** Only on elements that actually animate
  (`transform`), never sprayed across the page.
- **Test on the oldest device you support**, in Safari and Chrome. Chrome's
  DevTools → Rendering → "Paint flashing" shows what is re-rasterising.

If a surface is mostly covering text, consider a solid surface with a subtle
gradient instead. The language will survive; the frame rate will too.

---

## 12. Accessibility

Glass is a contrast risk by construction. The system handles this natively; on
the web you handle it:

- **Text on glass must hit 4.5:1 against the *worst* backdrop it can overlap.**
  Test hovering the dock over the busiest project image, in both themes.
- **Secondary text at 60–70% opacity** is fine only if the base pair already
  passes. This build uses `--ink-2: .64` and `--ink-3: .46` on dark, `.62` and
  `.56` on light — deliberately tuned, not defaults.
- **Respect the OS dials:**

  ```css
  @media (prefers-reduced-transparency: reduce) {
    .glass { background: var(--ink); backdrop-filter: none; }
    .glass::before, .glass::after { display: none; }
  }
  @media (prefers-contrast: more) {
    .glass { box-shadow: 0 0 0 1px var(--ink), ...; }
  }
  ```

- **Focus rings must survive on glass.** Use `outline: 2px solid` with a 3px
  offset and a colour that is *not* one of the glass tokens.
- **Clear glass over media needs dimming** — a gradient scrim on the image, not
  a heavier glass, so the text stays legible while the image stays visible.
- **Don't rely on transparency to convey state.** The active tab changes
  background *and* gets `aria-current`.

---

## 13. Anti-patterns

- **Glass cards for everything.** Hierarchy collapses; nothing floats.
- **Glass on glass.** Muddy, expensive, and on iOS it literally cannot sample.
- **Blur over text.** The text behind the glass turns into visual noise.
- **Rainbow gradients inside the glass.** Tint should come from the backdrop,
  not a second set of colours.
- **Huge blur + high saturation with no rim.** Reads as a frosted sticker.
- **No rim/edge definition.** On a dark wallpaper the surface disappears.
- **Slow, floaty 1.5s transitions on controls.** Apple's UI is quick; the
  material is heavy, the interaction is not.
- **Motion on everything.** If every element springs, nothing feels responsive.
- **Shipping the effect to a low-end phone** without a solid fallback.

---

## 14. Applying this to the existing portfolio

`glass/` is a separate page, so nothing you already have is at risk. If you want
to move the main site over, do it in this order:

1. **Add the wallpaper.** The current palette is warm paper on a flat background.
   Glass needs depth: keep your cream and add two very large, blurred, warm
   orbs (terracotta at 8%, olive at 6%) plus grain. Or go dark, as in `glass/`.
2. **Convert the header only.** Replace `.site-header`'s frosted bar with the
   `.glass` recipe and a capsule shape. Ship that for a week. This is 90% of the
   perceived effect.
3. **Convert buttons.** Primary `mailto` CTA and the theme toggle become capsule
   glass; everything else stays as it is.
4. **Add the motion layer.** Pointer sheen on the two glass surfaces, magnetic
   pull on the primary CTA, the circle theme reveal.
5. **Only then** consider the mobile tab bar — it is a new navigation model, not
   a visual tweak, and it changes how people move through the page.
6. **Keep the serif.** The editorial voice is your identity; Liquid Glass is the
   material. They coexist better than a full imitation would.

Order matters: material first, motion second, structure last. Restructuring
before the material is proven is how redesigns turn into rewrites.

---

## 15. Checklist

Before shipping:

- [ ] Glass appears only on navigation/controls, never on content
- [ ] No glass inside glass
- [ ] ≤ 8 `backdrop-filter` surfaces on the page
- [ ] Every glass surface has: fill, top gradient, rim, float shadow
- [ ] Light and dark themes were both designed, not inverted
- [ ] Text on glass passes 4.5:1 over the busiest backdrop
- [ ] Capsule controls + concentric radii
- [ ] Motion is on `transform`/`opacity` only, ≤ 9px of travel
- [ ] `prefers-reduced-motion`, `prefers-reduced-transparency`,
      `prefers-contrast` all handled
- [ ] Tested at 390px and 1440px, in Safari and Chrome
- [ ] Scroll edge is subtle (≤ 8px blur)
- [ ] The page still reads with CSS filters disabled

---

## 16. Files

```
glass/index.html    the page (content + structure)
glass/glass.css     material, type, layout, motion, a11y, responsive
glass/glass.js      pointer light, magnetism, reveals, counters, clock,
                    scroll chrome, view-transition theme switch
```

Open `glass/index.html` through a local server (`python3 -m http.server 4173`)
so the fonts and the view transition behave the same as production. The page has
no dependencies and no build step.

### References

- [Meet Liquid Glass — WWDC25](https://developer.apple.com/videos/play/wwdc2025/219/)
- [Liquid Glass — Apple Developer](https://developer.apple.com/documentation/technologyoverviews/liquid-glass)
- [Materials — Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple introduces a new software design (newsroom)](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)
