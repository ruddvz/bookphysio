---
name: gsap-frameworks
description: Official GSAP skill for Vue, Svelte, and other non-React frameworks — lifecycle integration, when to create/kill tweens and ScrollTriggers, scoping selectors, cleanup on unmount. Use when animating in Vue, Svelte, Nuxt, SvelteKit, or other component-based frameworks.
license: MIT
origin: https://github.com/greensock/gsap-skills
---

## GSAP with Vue, Svelte, and Other Frameworks

### When to Use This Skill

Apply when integrating GSAP with Vue (Composition API), Svelte, Nuxt, SvelteKit, or any non-React component framework: lifecycle integration, cleanup, and selector scoping.

**Related skills:** For React use **gsap-react**; for tweens and timelines use **gsap-core** and **gsap-timeline**; for scroll-based animation use **gsap-scrolltrigger**.

### Core Principles

1. Create animations **after** the DOM is available (inside mounted/onMount lifecycle)
2. Scope selectors to the component container using `gsap.context(callback, containerRef)`
3. Clean up (revert) on unmount/destroy

---

## Vue 3 (Composition API / script setup)

```vue
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import gsap from "gsap";

const container = ref(null);
let ctx;

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.to(".box", { x: 100, duration: 1 });
    gsap.from(".item", { opacity: 0, stagger: 0.1 });
  }, container.value); // scope to this component's root
});

onUnmounted(() => {
  ctx?.revert();
});
</script>

<template>
  <div ref="container">
    <div class="box" />
    <div class="item" />
  </div>
</template>
```

### Vue with ScrollTrigger

```vue
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const container = ref(null);
let ctx;

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.to(".panel", {
      x: 100,
      scrollTrigger: {
        trigger: ".panel",
        start: "top center",
        end: "bottom center",
        scrub: 1
      }
    });
  }, container.value);
});

onUnmounted(() => {
  ctx?.revert(); // also kills associated ScrollTriggers
});
</script>
```

---

## Svelte

```svelte
<script>
  import { onMount } from "svelte";
  import gsap from "gsap";

  let container;
  let ctx;

  onMount(() => {
    ctx = gsap.context(() => {
      gsap.to(".box", { x: 100, duration: 1 });
      gsap.from(".item", { opacity: 0, stagger: 0.1 });
    }, container); // scope to this component

    return () => ctx.revert(); // cleanup on unmount
  });
</script>

<div bind:this={container}>
  <div class="box" />
  <div class="item" />
</div>
```

### Svelte with ScrollTrigger

```svelte
<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  let container;

  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.to(".panel", {
        x: 100,
        scrollTrigger: {
          trigger: ".panel",
          start: "top center",
          scrub: 1
        }
      });
    }, container);

    return () => ctx.revert();
  });
</script>

<div bind:this={container}>
  <div class="panel" />
</div>
```

---

## Nuxt 3

Use `onMounted` as in Vue 3. For SSR, ensure GSAP code runs client-side only:

```javascript
// In a Nuxt plugin or composable
if (process.client) {
  gsap.registerPlugin(ScrollTrigger);
}
```

Or use a `<ClientOnly>` wrapper for components with heavy GSAP animations.

---

## SvelteKit

Same as Svelte. For SSR, guard GSAP registration:

```javascript
import { browser } from "$app/environment";

if (browser) {
  gsap.registerPlugin(ScrollTrigger);
}
```

---

## Official GSAP Best Practices

- ✅ Create animations inside **mounted** callbacks (after DOM availability).
- ✅ Use `gsap.context(callback, containerRef)` to scope selectors to the component.
- ✅ Call `ctx.revert()` on unmount/destroy to kill all tweens and ScrollTriggers created in that context.
- ✅ For SSR frameworks (Nuxt, SvelteKit), guard GSAP/ScrollTrigger registration with a browser/client check.

### Do Not

- ❌ Create animations before component mounting (DOM not yet available).
- ❌ Use global selectors without a scope; always pass the container ref to `gsap.context()`.
- ❌ Skip cleanup functions; always `ctx.revert()` on unmount.
- ❌ Register plugins or run GSAP code during SSR.

### Learn More

https://gsap.com/docs/v3/GSAP/gsap.context()
