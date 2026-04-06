# skeleton-ui-loader

**Zero-config React skeleton loaders generated automatically from your real component DOM.**

Stop writing skeleton markup. Wrap your component → instant, perfect skeleton. No duplication. No maintenance.

[![npm](https://img.shields.io/npm/v/skeleton-ui-loader)](https://npmjs.org/skeleton-ui-loader)
[![downloads](https://img.shields.io/npm/dm/skeleton-ui-loader)](https://npmjs.org/skeleton-ui-loader)
[![license](https://img.shields.io/npm/l/skeleton-ui-loader)](LICENSE)

---

## The Problem

Every React app needs skeleton loaders. But building them sucks:

```tsx
// ❌ You write this for every component
const UserCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
    <div className="h-4 w-20 bg-gray-200 mt-2"></div>
    <div className="h-3 w-32 bg-gray-200 mt-1"></div>
  </div>
);
```

- **Duplicate markup** everywhere
- **Fragile** — breaks when you refactor
- **Time-wasting** — hours per project
- **Inconsistent** — different devs build skeletons differently

---

## The Solution

Just wrap **ANY component or HTML element**:

```tsx
import { SkeletonAuto } from "skeleton-ui-loader";
import "skeleton-ui-loader/styles.css";

// ✅ Works with React components
function UserCard({ loading }) {
  return (
    <SkeletonAuto loading={loading}>
      <YourComponent />
    </SkeletonAuto>
  );
}

// ✅ Works with any HTML structure
function Article({ loading }) {
  return (
    <SkeletonAuto loading={loading}>
      <div className="article">
        <h1>Title</h1>
        <img src="..." alt="cover" />
        <p>Content paragraph...</p>
        <button>Read More</button>
      </div>
    </SkeletonAuto>
  );
}

// ✅ Works with simple divs
<SkeletonAuto loading={isLoading}>
  <div>
    <div className="avatar"></div>
    <div className="name">John Doe</div>
  </div>
</SkeletonAuto>
```

Perfect skeleton, **zero maintenance**. Works with any div, any HTML structure.

---

## Works With ANYTHING

```tsx
// ✅ React components
<SkeletonAuto loading={loading}><MyComponent /></SkeletonAuto>

// ✅ HTML divs
<SkeletonAuto loading={loading}><div>...</div></SkeletonAuto>

// ✅ Nested structures
<SkeletonAuto loading={loading}>
  <article>
    <h1>Title</h1>
    <img />
    <p>Content</p>
  </article>
</SkeletonAuto>

// ✅ Complex layouts
<SkeletonAuto loading={loading}>
  <section className="card">
    <header>
      <img className="avatar" />
      <h2>Name</h2>
    </header>
    <body>
      <p>Description</p>
    </body>
    <footer>
      <button>Action</button>
    </footer>
  </section>
</SkeletonAuto>
```

**One wrapper.** Any content inside. Perfect skeleton.

---

## Why skeleton-ui-loader

✨ **Works with ANY HTML** — React components, divs, complex layouts, anything  
🤖 **Auto-generated** — Scans real DOM, creates perfect skeleton  
🎨 **Themeable** — Colors, radius, animations fully customizable  
⚡ **Performant** — Snapshot mode caches layouts for repeat renders  
🔄 **SSR-safe** — Works with Next.js, Remix, any React framework  
⌨️ **TypeScript** — Full type safety & IntelliSense  

---

## Install

```bash
npm i skeleton-ui-loader
```

**Requires:**
- React ≥ 17
- react-dom ≥ 17

---

## 30-Second Setup

Wrap **any component or HTML element**. Skeleton generates automatically.

```tsx
import { SkeletonAuto } from "skeleton-ui-loader";
import "skeleton-ui-loader/styles.css";

export function MyComponent() {
  const [loading, setLoading] = useState(true);

  return (
    <SkeletonAuto loading={loading} animation="shimmer">
      {/* Works with React components, divs, any HTML */}
      <YourComponent />
    </SkeletonAuto>
  );
}
```

**That's all.** Skeleton auto-generates from ANY div or HTML element inside.

---

## API

### `<SkeletonAuto />`

Wrap any component. Skeleton generates automatically.

```tsx
<SkeletonAuto
  loading={isLoading}
  baseColor="#2b2f36"        // Skeleton background
  shimmerColor="#3a404a"     // Animation highlight
  borderRadius={12}          // Corner radius
  animation="shimmer"        // shimmer | pulse | wave | none
  snapshot="user-card-v1"    // Optional: cache layout
>
  <YourComponent />
</SkeletonAuto>
```

| Prop | Type | Default | What it does |
|------|------|---------|---|
| `loading` | `boolean` | required | Show skeleton when true |
| `children` | `ReactNode` | required | Component to scan |
| `baseColor` | `string` | `#e0e0e0` | Skeleton color |
| `shimmerColor` | `string` | `#f0f0f0` | Animation highlight |
| `animation` | `"shimmer" \| "pulse" \| "wave" \| "none"` | `"shimmer"` | Animation style |
| `borderRadius` | `number` | `4` | Corner radius |
| `snapshot` | `string` | — | Cache key (optional) |
| `maxDepth` | `number` | `12` | DOM traversal depth |
| `minWidth` | `number` | `2` | Skip elements narrower than this |
| `minHeight` | `number` | `2` | Skip elements shorter than this |

---

### `useSkeletonAuto()` — For Custom Control

```tsx
import { useSkeletonAuto } from "skeleton-ui-loader";

function ManualMode() {
  const { skeletonRef, SkeletonOverlay, snap } = useSkeletonAuto({
    animation: "wave",
    baseColor: "#1f2a39",
    shimmerColor: "#32445b",
    borderRadius: 12
  });

  return (
    <div style={{ position: "relative" }}>
      <div ref={skeletonRef} style={loading ? { opacity: 0.001 } : {}}>
        <YourContent />
      </div>
      {loading && <SkeletonOverlay />}
      <button onClick={snap}>Refresh layout</button>
    </div>
  );
}
```

---

## How It Works

**The Magic:**

1. **Scans** your real component's DOM
2. **Classifies** elements (headings, images, text, buttons)
3. **Generates** a perfect skeleton matching that structure
4. **Animates** with shimmer, pulse, wave, or static
5. **Caches** layouts (optional) for performance

**Classification:**

| Element Type | Skeleton |
|---|---|
| `<h1>` ... `<h6>` | Heading bar |
| `<img>`, `<picture>` | Image placeholder |
| `<button>`, `<input>` | Control shape |
| Text nodes | Content bars |
| Containers | Structural blocks |

---

## Advanced Features

### Snapshot Mode (Caching)

Use `snapshot` to cache layouts for components shown repeatedly:

```tsx
<SkeletonAuto loading={loading} snapshot="product-card-v1">
  <ProductCard />
</SkeletonAuto>
```

**When to use:**
- Component layout is stable
- Shows frequently (list of 100 items)

**When to skip:**
- Layout changes often
- Dynamic content structure

---

### Fine-Tune with Data Attributes

**Mark key elements:**

```tsx
<article data-skeleton-id="user-card-root">
  <div data-skeleton-container="true">
    {/* Mark container surfaces for better skeletons */}
  </div>
</article>
```

| Attribute | Purpose |
|---|---|
| `data-skeleton-id` | Stable identity for snapshot matching |
| `data-skeleton-container` | Force container to be structural block |

---

### Customize Depth & Granularity

```tsx
<SkeletonAuto
  maxDepth={8}      // Stop at 8 levels deep
  minWidth={10}     // Skip elements <10px wide
  minHeight={3}     // Skip elements <3px tall
>
  <Component />
</SkeletonAuto>
```

**Fix noisy skeletons:** Increase `minWidth` and `minHeight`.

---

## Animation Styles

4 built-in animations:

| Animation | Effect |
|---|---|
| `shimmer` | ✨ Light wave across skeleton (default) |
| `pulse` | 💫 Fade in/out smoothly |
| `wave` | 〰️ Directional highlight sweep |
| `none` | ⏸️ Static (no animation) |

```tsx
<SkeletonAuto animation="pulse">
  <Component />
</SkeletonAuto>
```

---

## Common Patterns

### Loading a List

```tsx
<ScrollRevealList>
  {items.map((item) => (
    <SkeletonAuto key={item.id} loading={loading}>
      <Card item={item} />
    </SkeletonAuto>
  ))}
</ScrollRevealList>
```

### Dark Mode Support

```tsx
<SkeletonAuto
  loading={loading}
  baseColor={isDark ? "#1a1a1a" : "#e0e0e0"}
  shimmerColor={isDark ? "#333" : "#f0f0f0"}
>
  <Component />
</SkeletonAuto>
```

### Custom Styling

```tsx
<SkeletonAuto
  loading={loading}
  className="my-skeleton"
  style={{ borderRadius: "16px" }}
>
  <Component />
</SkeletonAuto>
```

---

## Troubleshooting

### "Skeleton looks wrong / too noisy"

**Solution:** Increase `minWidth` and `minHeight`

```tsx
<SkeletonAuto minWidth={12} minHeight={8}>
  <Component />
</SkeletonAuto>
```

### "Snapshot looks stale"

**Solution:** Change snapshot key when structure changes

```tsx
// Old: snapshot="card-v1"
// New: snapshot="card-v2"  ← Different key = fresh cache
```

Or clear snapshot:

```tsx
import { clearSnapshot } from "skeleton-ui-loader";

clearSnapshot("card-v1");  // Clear one
clearSnapshot();           // Clear all
```

### "Skeleton doesn't match special sections"

**Solution:** Use `data-skeleton-id` and `data-skeleton-container`

```tsx
<section data-skeleton-id="hero-section" data-skeleton-container="true">
  <Component />
</section>
```

---


## Performance Tips

💡 **Use `snapshot`** for stable layouts shown 5+ times  
💡 **Set `maxDepth` lower** on very deep component trees  
💡 **Raise `minWidth`/`minHeight`** to skip micro-elements  
💡 **Use `data-skeleton-id`** on key containers for reliable matching

**Bundle size:** Only 3KB. Zero runtime dependencies.

---

## Utility Exports

Advanced use cases:

```tsx
import {
  clearSnapshot,        // Clear cache
  getSnapshot,         // Read cached layout
  setSnapshot,         // Set custom layout
  hasSkeletonDiff,     // Detect layout changes
  walk,               // Traverse DOM tree
  classifyElement     // Classify single element
} from "skeleton-ui-loader";
```

---

## License

MIT — Use freely in personal & commercial projects.

---

## Next Steps

- 🎮 **[Try Live Demo](https://skeletonuiloader.vercel.app/)**
- 💬 **[GitHub Issues](https://github.com/pavansharan007/skeleton-ui-loader/issues)** for bugs or ideas
- ⭐ **[Star on GitHub](https://github.com/pavansharan007/skeleton-ui-loader)** if this saved you time

---

Made by [Pavan](https://github.com/pavansharan007)  
