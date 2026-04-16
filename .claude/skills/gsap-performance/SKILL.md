---
name: gsap-performance
description: Official GSAP skill for performance optimization — compositor-friendly transforms, will-change, batching, quickTo, ScrollTrigger tips, cleanup. Use when optimizing animations for 60fps, diagnosing jank, or asking about animation performance best practices.
license: MIT
origin: https://github.com/greensock/gsap-skills
---

## GSAP Performance

### When to Use This Skill

Apply when optimizing animations for smooth 60fps, diagnosing jank, or reviewing code for animation performance issues.

**Related skills:** For core animation API use **gsap-core**; for scroll performance use **gsap-scrolltrigger**.

### Compositor-Friendly Properties

Animating **transform** (`x`, `y`, `scaleX`, `scaleY`, `rotation`, `rotationX`, `rotationY`, `skewX`, `skewY`) and **opacity** keeps work on the compositor and avoids layout and most paint work.

```javascript
// ✅ GOOD: compositor properties
gsap.to(".box", { x: 100, y: 50, opacity: 0.5, rotation: 45 });

// ❌ BAD: triggers layout (reflow)
gsap.to(".box", { width: 200, height: 100, top: 50, left: 30 });
```

GSAP's `x` and `y` properties use CSS transforms (`translateX`/`translateY`) by default — not `left`/`top`.

### CSS Hints

Apply `will-change: transform` only on elements that are **actually** being animated, not as a blanket optimization. Overuse wastes GPU memory.

```css
/* ✅ Only on elements that actually animate */
.animated-card {
  will-change: transform;
}
```

### Batch DOM Reads Before Writes

When combining GSAP with direct DOM manipulation, read all values before writing any to prevent layout thrashing:

```javascript
// ❌ BAD: interleaved reads/writes cause reflows
elements.forEach(el => {
  const height = el.offsetHeight; // read (forces reflow)
  el.style.marginTop = height + "px"; // write
});

// ✅ GOOD: batch reads, then writes
const heights = elements.map(el => el.offsetHeight); // all reads first
elements.forEach((el, i) => {
  el.style.marginTop = heights[i] + "px"; // then all writes
});
```

### Use Stagger Instead of Individual Tweens

```javascript
// ❌ BAD: many separate tweens with manual delays
items.forEach((el, i) => {
  gsap.to(el, { opacity: 1, y: 0, delay: i * 0.1 });
});

// ✅ GOOD: single tween with stagger
gsap.to(".item", { opacity: 1, y: 0, stagger: 0.1 });
```

### gsap.quickTo() for High-Frequency Updates

For properties updated constantly (mouse followers, sliders), `gsap.quickTo()` reuses a single tween instead of creating new ones on every update:

```javascript
// ❌ BAD: creates a new tween on every mousemove
document.addEventListener("mousemove", (e) => {
  gsap.to(".cursor", { x: e.clientX, y: e.clientY });
});

// ✅ GOOD: reuses the same tween
const moveX = gsap.quickTo(".cursor", "x", { duration: 0.3, ease: "power3" });
const moveY = gsap.quickTo(".cursor", "y", { duration: 0.3, ease: "power3" });

document.addEventListener("mousemove", (e) => {
  moveX(e.clientX);
  moveY(e.clientY);
});
```

### ScrollTrigger Performance Tips

- **Pin minimally** — only pin sections that need it; pinned elements use `position: fixed` which can affect performance.
- **Use conservative scrub values** — `scrub: 1` is smoother than `scrub: true` for most use cases.
- **Call `ScrollTrigger.refresh()` only when needed** — not on every resize. Debounce when needed.
- **Kill unused ScrollTriggers** — clean up when components unmount or elements are removed.

```javascript
// Kill all when navigating away (SPA)
ScrollTrigger.getAll().forEach(t => t.kill());
```

### Clean Up Off-Screen Animations

Pause or kill animations for elements that are off-screen or unmounted:

```javascript
// Pause when not visible
const tween = gsap.to(".element", { rotation: 360, repeat: -1 });

const observer = new IntersectionObserver(([entry]) => {
  entry.isIntersecting ? tween.play() : tween.pause();
});
observer.observe(document.querySelector(".element"));
```

### Avoid force3D Unless Needed

GSAP automatically handles GPU layer promotion via `force3D`. Don't apply it universally:

```javascript
// ✅ Let GSAP handle it (default behavior is smart)
gsap.to(".box", { x: 100 });

// ⚠️ Only override when you have a specific reason
gsap.to(".box", { x: 100, force3D: true });
```

### Official GSAP Best Practices

- ✅ Animate **transforms** and **opacity**; avoid layout-triggering properties (`width`, `height`, `top`, `left`).
- ✅ Use `gsap.quickTo()` for mouse followers, scroll-linked, or continuously updated values.
- ✅ Use `stagger` for uniform animations over many elements; avoid individual tweens with manual delays.
- ✅ Apply `will-change` only on elements that actually animate; remove it when done.
- ✅ Batch DOM reads before writes when mixing GSAP with direct DOM manipulation.
- ✅ Kill or pause off-screen / unmounted animations.

### Do Not

- ❌ Apply `will-change: transform` to every element; it wastes GPU memory.
- ❌ Create new tweens on every mouse event; use `gsap.quickTo()` for high-frequency updates.
- ❌ Animate `left`, `top`, `width`, or `height` for motion effects when transform equivalents are available.
- ❌ Call `ScrollTrigger.refresh()` on every resize without debouncing; viewport resize is auto-handled.

### Learn More

https://gsap.com/docs/v3/GSAP/
