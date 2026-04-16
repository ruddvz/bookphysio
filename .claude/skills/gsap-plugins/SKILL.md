---
name: gsap-plugins
description: Official GSAP skill for GSAP plugins — registration, ScrollToPlugin, ScrollSmoother, Flip, Draggable, Inertia, Observer, SplitText, ScrambleText, DrawSVG, MorphSVG, MotionPath, CustomEase, EasePack, GSDevTools. Use when the user asks about a GSAP plugin, scroll-to, flip animations, draggable, SVG drawing/morphing, text splitting, or plugin registration.
license: MIT
origin: https://github.com/greensock/gsap-skills
---

## GSAP Plugins

### When to Use This Skill

Apply when using or reviewing code that uses GSAP plugins: registering plugins, scroll-to, flip/FLIP animations, draggable elements, SVG (DrawSVG, MorphSVG, MotionPath), text (SplitText, ScrambleText), physics, easing plugins (CustomEase, EasePack), or GSDevTools. ScrollTrigger has its own skill (**gsap-scrolltrigger**).

**Related skills:** For core tweens use **gsap-core**; for ScrollTrigger use **gsap-scrolltrigger**; for React use **gsap-react**.

### Registering Plugins

Register each plugin once before use:

```javascript
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollToPlugin, Flip, Draggable);
```

- ✅ Register before using the plugin in any tween or API call.
- ✅ In React, register at top level (not inside a component that re-renders).

---

## Scroll

### ScrollToPlugin

Animate scroll position (window or scrollable element):

```javascript
gsap.registerPlugin(ScrollToPlugin);

gsap.to(window, { duration: 1, scrollTo: { y: 500 } });
gsap.to(window, { duration: 1, scrollTo: { y: "#section", offsetY: 50 } });
gsap.to(scrollContainer, { duration: 1, scrollTo: { x: "max" } });
```

| Option | Description |
|--------|-------------|
| `x`, `y` | Target position (number) or `"max"` for maximum |
| `element` | Selector or element to scroll to |
| `offsetX`, `offsetY` | Pixel offset from the target position |

### ScrollSmoother

Smooth scroll wrapper. Requires ScrollTrigger and a specific DOM structure:

```html
<body>
  <div id="smooth-wrapper">
    <div id="smooth-content">
      <!-- ALL YOUR CONTENT HERE -->
    </div>
  </div>
</body>
```

Register after ScrollTrigger. See GSAP docs for full setup.

---

## DOM / UI

### Flip

Capture layout state → change DOM → animate from old state to new (FLIP pattern):

```javascript
gsap.registerPlugin(Flip);

const state = Flip.getState(".item");
// change DOM: reorder, add/remove, change classes
Flip.from(state, { duration: 0.5, ease: "power2.inOut" });
```

| Option | Description |
|--------|-------------|
| `absolute` | Use `position: absolute` during the flip |
| `scale` | Scale elements to fit (default `true`) |
| `duration`, `ease` | Standard tween options |

More: https://gsap.com/docs/v3/Plugins/Flip

### Draggable

Makes elements draggable, spinnable, or throwable:

```javascript
gsap.registerPlugin(Draggable, InertiaPlugin);

Draggable.create(".box", { type: "x,y", bounds: "#container", inertia: true });
Draggable.create(".knob", { type: "rotation" });
```

| Option | Description |
|--------|-------------|
| `type` | `"x"`, `"y"`, `"x,y"`, `"rotation"`, `"scroll"` |
| `bounds` | Element, selector, or `{ minX, maxX, minY, maxY }` |
| `inertia` | `true` for throw/momentum (requires InertiaPlugin) |
| `edgeResistance` | 0–1; resistance past bounds |
| `onDragStart`, `onDrag`, `onDragEnd` | Callbacks |

### Inertia (InertiaPlugin)

Works with Draggable for momentum after release, or track velocity of any property:

```javascript
gsap.registerPlugin(Draggable, InertiaPlugin);
Draggable.create(".box", { type: "x,y", inertia: true });

// or track velocity manually:
InertiaPlugin.track(".box", "x");
gsap.to(obj, { inertia: { x: "auto" } }); // glide to stop
```

### Observer

Normalizes pointer/scroll input across devices for custom gesture logic:

```javascript
gsap.registerPlugin(Observer);

Observer.create({
  target: "#area",
  onUp: () => {},
  onDown: () => {},
  onLeft: () => {},
  onRight: () => {},
  tolerance: 10
});
```

| Option | Description |
|--------|-------------|
| `target` | Element or selector to observe |
| `onUp/Down/Left/Right` | Callbacks when swipe/scroll passes tolerance |
| `tolerance` | Pixels before direction is detected (default 10) |
| `type` | `"touch"`, `"pointer"`, `"wheel"` |

---

## Text

### SplitText

Splits element text into chars, words, and/or lines for staggered animation:

```javascript
gsap.registerPlugin(SplitText);

const split = SplitText.create(".heading", { type: "words, chars" });
gsap.from(split.chars, { opacity: 0, y: 20, stagger: 0.03, duration: 0.4 });
// later:
split.revert();
```

With `autoSplit` for responsive re-splitting:

```javascript
SplitText.create(".split", {
  type: "lines",
  autoSplit: true,
  onSplit(self) {
    return gsap.from(self.lines, { y: 100, opacity: 0, stagger: 0.05, duration: 0.5 });
  }
});
```

**Key config:**

| Option | Description |
|--------|-------------|
| `type` | `"chars"`, `"words"`, `"lines"` (comma-separated) |
| `charsClass`, `wordsClass`, `linesClass` | CSS class on each split element |
| `aria` | `"auto"` (default), `"hidden"`, `"none"` |
| `autoSplit` | Re-split on font load or width change |
| `onSplit(self)` | Callback; return a tween for auto-sync on re-split |
| `mask` | `"lines"`, `"words"`, or `"chars"` for clip-mask reveal |

More: https://gsap.com/docs/v3/Plugins/SplitText/

### ScrambleText

Scramble/glitch text animation:

```javascript
gsap.registerPlugin(ScrambleTextPlugin);

gsap.to(".text", {
  duration: 1,
  scrambleText: { text: "New message", chars: "01", revealDelay: 0.5 }
});
```

---

## SVG

### DrawSVG (DrawSVGPlugin)

Reveals/hides SVG strokes by animating `stroke-dashoffset`/`stroke-dasharray`:

```javascript
gsap.registerPlugin(DrawSVGPlugin);

// draw from nothing to full stroke
gsap.from("#path", { duration: 1, drawSVG: 0 });
// explicit segment: 0–0 to 0–100%
gsap.fromTo("#path", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 1 });
// stroke only in the middle
gsap.to("#path", { duration: 1, drawSVG: "20% 80%" });
```

**Required:** Element must have a visible `stroke` and `stroke-width` set in CSS/SVG.

More: https://gsap.com/docs/v3/Plugins/DrawSVGPlugin

### MorphSVG (MorphSVGPlugin)

Morphs one SVG shape into another by animating the `d` attribute:

```javascript
gsap.registerPlugin(MorphSVGPlugin);

// Convert primitives to path first:
MorphSVGPlugin.convertToPath("circle, rect, ellipse, line");

gsap.to("#diamond", { duration: 1, morphSVG: "#lightning", ease: "power2.inOut" });
// or object form:
gsap.to("#diamond", {
  duration: 1,
  morphSVG: { shape: "#lightning", type: "rotational", shapeIndex: 2 }
});
```

| Option | Description |
|--------|-------------|
| `shape` | Target: selector, element, or raw path string |
| `type` | `"linear"` (default) or `"rotational"` |
| `shapeIndex` | Offset for start point mapping; use `"log"` to find good value |
| `map` | Segment matching: `"size"` (default), `"position"`, `"complexity"` |

More: https://gsap.com/docs/v3/Plugins/MorphSVGPlugin

### MotionPath (MotionPathPlugin)

Animate an element along an SVG path:

```javascript
gsap.registerPlugin(MotionPathPlugin);

gsap.to(".dot", {
  duration: 2,
  motionPath: { path: "#path", align: "#path", alignOrigin: [0.5, 0.5], autoRotate: true }
});
```

---

## Easing

### CustomEase

Custom easing curves (cubic-bezier or SVG path):

```javascript
gsap.registerPlugin(CustomEase);

const myEase = CustomEase.create("hop", "M0,0 C0,0 0.056,0.442 0.175,0.442 0.294,0.442 0.332,0 0.332,0 0.332,0 0.414,1 0.671,1 0.991,1 1,0 1,0");
gsap.to(".item", { x: 100, ease: myEase, duration: 1 });

// simple cubic-bezier:
const ease2 = CustomEase.create("my-ease", ".17,.67,.83,.67");
```

### EasePack

Adds extra named eases (SlowMo, RoughEase, ExpoScaleEase). Register and use the ease names in tweens.

### CustomWiggle / CustomBounce

Wiggle/shake and bounce-style easing with configurable strength. Register before use.

---

## Physics

### Physics2D (Physics2DPlugin)

```javascript
gsap.registerPlugin(Physics2DPlugin);

gsap.to(".ball", {
  duration: 2,
  physics2D: { velocity: 250, angle: 80, gravity: 500 }
});
```

### PhysicsProps (PhysicsPropsPlugin)

```javascript
gsap.registerPlugin(PhysicsPropsPlugin);

gsap.to(".obj", {
  duration: 2,
  physicsProps: {
    x: { velocity: 100, end: 300 },
    y: { velocity: -50, acceleration: 200 }
  }
});
```

---

## Development

### GSDevTools

UI for scrubbing timelines during development. **Remove before production.**

```javascript
gsap.registerPlugin(GSDevTools);
GSDevTools.create({ animation: tl });
```

---

## Best Practices

- ✅ Register every plugin with `gsap.registerPlugin()` before first use.
- ✅ Use `Flip.getState()` → DOM change → `Flip.from()` for layout transitions.
- ✅ Use `Draggable` + `InertiaPlugin` for drag with momentum.
- ✅ Revert SplitText instances (`split.revert()`) when components unmount.

### Do Not

- ❌ Use a plugin in a tween without registering it first.
- ❌ Ship GSDevTools to production.

### Learn More

https://gsap.com/docs/v3/Plugins/
