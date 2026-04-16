---
name: gsap-utils
description: Official GSAP skill for gsap.utils — clamp, mapRange, normalize, interpolate, random, snap, toArray, wrap, pipe. Use when the user asks about gsap.utils, clamping, range mapping, random values, snapping, toArray, or helper utilities in GSAP.
license: MIT
origin: https://github.com/greensock/gsap-skills
---

## GSAP Utils

### When to Use This Skill

Apply when writing or reviewing code that uses **gsap.utils** for math, array/collection handling, unit parsing, or value mapping in animations.

**Related skills:** Use with **gsap-core**, **gsap-timeline**, and **gsap-scrolltrigger** when building animations.

### Overview

**gsap.utils** provides pure helpers; no need to register. All are on `gsap.utils` (e.g. `gsap.utils.clamp()`).

**Function form:** Many utils accept the value as the **last** argument. Omit it to get a reusable function:

```javascript
// With value: returns result immediately
gsap.utils.clamp(0, 100, 150); // 100

// Without value: returns a function
let c = gsap.utils.clamp(0, 100);
c(150); // 100
c(-10); // 0
```

**Exception:** `random()` uses `true` as last argument for the function form, not omission.

### Clamping and Ranges

#### clamp(min, max, value?)

```javascript
gsap.utils.clamp(0, 100, 150); // 100
let clampFn = gsap.utils.clamp(0, 100);
clampFn(150); // 100
```

#### mapRange(inMin, inMax, outMin, outMax, value?)

```javascript
gsap.utils.mapRange(0, 100, 0, 500, 50);  // 250
let mapFn = gsap.utils.mapRange(0, 1, 0, 360);
mapFn(0.5); // 180
```

#### normalize(min, max, value?)

```javascript
gsap.utils.normalize(0, 100, 50);   // 0.5
let normFn = gsap.utils.normalize(0, 100);
normFn(75); // 0.75
```

#### interpolate(start, end, progress?)

Handles numbers, colors, and objects with matching keys:

```javascript
gsap.utils.interpolate(0, 100, 0.5);             // 50
gsap.utils.interpolate("#ff0000", "#0000ff", 0.5); // mid color
gsap.utils.interpolate({ x: 0 }, { x: 100 }, 0.5); // { x: 50 }
```

### Random and Snap

#### random(minimum, maximum[, snapIncrement, returnFunction]) / random(array[, returnFunction])

Pass `true` as last argument to get a reusable function:

```javascript
gsap.utils.random(-100, 100);         // immediate value
gsap.utils.random(0, 500, 5);         // snapped to nearest 5
let randomFn = gsap.utils.random(-200, 500, 10, true); // reusable
randomFn(); // new random value each call

gsap.utils.random(["red", "blue", "green"]); // random from array
```

**String form in tween vars:**

```javascript
gsap.to(".box", { x: "random(-100, 100, 5)", duration: 1 });
gsap.to(".item", { backgroundColor: "random([red, blue, green])" });
```

#### snap(snapTo, value?)

```javascript
gsap.utils.snap(10, 23);     // 20
gsap.utils.snap(0.25, 0.7);  // 0.75
gsap.utils.snap([0, 100, 200], 150); // nearest in array
let snapFn = gsap.utils.snap(10);
snapFn(23); // 20
```

#### shuffle(array)

```javascript
gsap.utils.shuffle([1, 2, 3, 4]); // e.g. [3, 1, 4, 2]
```

#### distribute(config)

Returns a function that assigns a value to each target based on position (flat or grid):

```javascript
gsap.to(".class", {
  scale: gsap.utils.distribute({
    base: 0.5,
    amount: 2.5,
    from: "center",
    ease: "power1.inOut"
  })
});
```

Config properties: `base`, `amount`, `each`, `from` (`"start"`, `"center"`, `"edges"`, `"random"`, `"end"`), `grid` (`[rows, cols]` or `"auto"`), `axis` (`"x"` or `"y"`), `ease`.

### Units and Parsing

#### getUnit(value)

```javascript
gsap.utils.getUnit("100px"); // "px"
gsap.utils.getUnit("50%");   // "%"
```

#### unitize(value, unit)

```javascript
gsap.utils.unitize(100, "px");  // "100px"
```

#### splitColor(color, returnHSL?)

```javascript
gsap.utils.splitColor("red");                    // [255, 0, 0]
gsap.utils.splitColor("#6fb936");                // [111, 185, 54]
gsap.utils.splitColor("rgba(204, 153, 51, 0.5)"); // [204, 153, 51, 0.5]
gsap.utils.splitColor("#6fb936", true);          // [94, 55, 47] (HSL)
```

### Arrays and Collections

#### selector(scope)

```javascript
const q = gsap.utils.selector(containerRef);
q(".box");        // only .box elements inside container
gsap.to(q(".circle"), { x: 100 });
```

#### toArray(value, scope?)

```javascript
gsap.utils.toArray(".item");            // array of elements
gsap.utils.toArray(".item", container); // scoped to container
gsap.utils.toArray(nodeList);           // from NodeList
```

#### pipe(...functions)

```javascript
const fn = gsap.utils.pipe(
  (v) => gsap.utils.normalize(0, 100, v),
  (v) => gsap.utils.snap(0.1, v)
);
fn(50); // normalized then snapped
```

#### wrap(min, max, value?) / wrapYoyo(min, max, value?)

```javascript
gsap.utils.wrap(0, 360, 370);      // 10 (cycles)
gsap.utils.wrapYoyo(0, 100, 150);  // 50 (bounces)
let wrapFn = gsap.utils.wrap(0, 360);
wrapFn(370); // 10
```

### Best practices

- ✅ Omit value argument for reusable functions when the same config is used many times.
- ✅ Use **snap** for grid-aligned or step-based values.
- ✅ Use **gsap.utils.selector(scope)** in components to scope selectors to a container.

### Do Not

- ❌ Assume **mapRange** / **normalize** handle units; they work on plain numbers.
- ❌ Override or rely on undocumented behavior.

### Learn More

https://gsap.com/docs/v3/GSAP/UtilityMethods/
