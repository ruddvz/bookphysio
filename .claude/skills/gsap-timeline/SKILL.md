---
name: gsap-timeline
description: Official GSAP skill for timelines — gsap.timeline(), position parameter, labels, nesting, playback. Use when sequencing multiple animations, choreographing multi-step animation, or when the user asks about GSAP timelines, keyframes, or animation order.
license: MIT
origin: https://github.com/greensock/gsap-skills
---

## GSAP Timeline

### When to Use This Skill

Apply when coordinating multiple tweens in sequence or parallel, building multi-step animations, or when delays alone are not sufficient. Timelines are the primary tool for animation sequencing in GSAP.

**Related skills:** For single tweens use **gsap-core**; for scroll-driven animation use **gsap-scrolltrigger**; for React cleanup use **gsap-react**.

### Creating a Timeline

```javascript
const tl = gsap.timeline();
tl.to(".a", { x: 100, duration: 0.5 })
  .to(".b", { y: 50, duration: 0.5 })
  .to(".c", { opacity: 0, duration: 0.3 });
```

By default, tweens are **appended** one after another (sequential). Use the **position parameter** (third argument) to place them precisely.

### Timeline Defaults

Pass defaults to the timeline constructor so child tweens inherit them:

```javascript
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power2.out" } });
tl.to(".a", { x: 100 })     // inherits duration: 0.5, ease: "power2.out"
  .to(".b", { y: 50 })
  .from(".c", { opacity: 0 });
```

### Position Parameter

The third argument to `.to()`, `.from()`, `.fromTo()`, and `.add()` controls **when** the tween starts on the timeline:

| Value | Meaning |
|-------|---------|
| (omitted) | Append to end of timeline |
| `0` | Absolute: start at 0 seconds |
| `1.5` | Absolute: start at 1.5 seconds |
| `"+=0.5"` | 0.5 s after end of previous tween |
| `"-=0.3"` | 0.3 s before end of previous tween (overlap) |
| `"<"` | Start at the same time as previous tween |
| `">"` | Start after the end of the previous tween (same as default, explicit) |
| `"<0.2"` | 0.2 s after start of previous tween |
| `">-0.2"` | 0.2 s before end of previous tween |
| `"label"` | Start at the label's time |
| `"label+=0.5"` | 0.5 s after the label |

```javascript
const tl = gsap.timeline();
tl.to(".a", { x: 100, duration: 1 })
  .to(".b", { y: 50, duration: 0.5 }, "-=0.3")   // overlap by 0.3s
  .to(".c", { opacity: 0 }, "<")                   // same time as .b
  .to(".d", { scale: 1.5 }, "+=0.2");              // 0.2s after .c ends
```

### Labels

Labels mark a point in time. Add them with `.add("labelName")` or inline with `.addLabel()`:

```javascript
const tl = gsap.timeline();
tl.to(".intro", { opacity: 1, duration: 1 })
  .add("contentStart")
  .to(".content", { y: 0, duration: 0.8 })
  .add("outroStart", "+=1")
  .to(".outro", { opacity: 0, duration: 0.5 });

// Seek to a label:
tl.seek("contentStart");
```

### Playback Controls

```javascript
const tl = gsap.timeline({ paused: true });
// populate with tweens...

tl.play();
tl.pause();
tl.reverse();
tl.restart();
tl.seek(1.5);          // seek to 1.5 seconds
tl.seek("labelName");  // seek to label
tl.progress(0.5);      // seek to 50% progress
tl.timeScale(2);       // play at 2x speed
tl.kill();
```

### Nested Timelines

Timelines can be added to other timelines using the position parameter:

```javascript
function buildIntro() {
  const tl = gsap.timeline();
  tl.from(".logo", { opacity: 0, duration: 0.5 })
    .from(".tagline", { y: 20, opacity: 0, duration: 0.4 });
  return tl;
}

const master = gsap.timeline();
master.add(buildIntro())
      .to(".hero", { x: 100, duration: 1 }, "+=0.3");
```

### Timeline with ScrollTrigger

Attach ScrollTrigger to the **timeline**, not to child tweens:

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".section",
    start: "top top",
    end: "+=2000",
    scrub: 1,
    pin: true
  }
});
tl.to(".a", { x: 100 })
  .to(".b", { y: 50 })
  .to(".c", { opacity: 0 });
```

### Callbacks

```javascript
const tl = gsap.timeline({
  onStart: () => console.log("started"),
  onComplete: () => console.log("done"),
  onUpdate: () => console.log("progress:", tl.progress())
});
```

### Official GSAP Best Practices

- ✅ Prefer timelines over chaining tweens with `delay`; timelines are easier to reason about and control.
- ✅ Set `defaults` on the timeline constructor to reduce repetition across child tweens.
- ✅ Use labels for readable, maintainable sequencing especially in long or complex animations.
- ✅ Attach **ScrollTrigger** to the **top-level timeline**, not to individual child tweens.
- ✅ Nest timelines to build modular, reusable animation functions.

### Do Not

- ❌ Use `delay` to sequence tweens when a timeline with the position parameter is clearer and more maintainable.
- ❌ Put ScrollTrigger on a **child tween** inside a timeline; attach it to the **timeline** itself (or a top-level tween).
- ❌ Forget that timeline duration is determined by its children — individual tween duration is separate.

### Learn More

https://gsap.com/docs/v3/GSAP/Timeline/
