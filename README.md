# skeleton-ui-loader

Zero-config React skeleton loaders generated from your real component DOM shape.

🌐 **Interactive Demo & Docs:** [https://skeletonuiloader.vercel.app/](https://skeletonuiloader.vercel.app/)

Use one wrapper, keep your real markup, and get an automatic loading state that tracks your actual UI structure.

## Why use this

- No duplicate skeleton markup to maintain.
- Structural skeletons for containers, headings, media, controls, and content blocks.
- Themeable colors, radius, and animation style.
- Snapshot mode for stable repeated layouts.
- SSR-safe fallback behavior.

## Install

```bash
npm i skeleton-ui-loader
```

React peer requirements:

- react >= 17
- react-dom >= 17

## Quick start

```tsx
import { SkeletonAuto } from "skeleton-ui-loader";
import "skeleton-ui-loader/styles.css";

function UserCardLoader({ loading }: { loading: boolean }) {
  return (
    <SkeletonAuto loading={loading}>
      <UserCard />
    </SkeletonAuto>
  );
}
```

Notes:

- The package auto-injects styles at runtime.
- Importing `skeleton-ui-loader/styles.css` is optional but recommended for explicit styling control.

## Component usage

```tsx
<SkeletonAuto
  loading={isLoading}
  baseColor="#2b2f36"
  shimmerColor="#3a404a"
  borderRadius={12}
  animation="shimmer"
  snapshot="user-card-v1"
>
  <UserCard />
</SkeletonAuto>
```

### Animations

Supported values:

- `"shimmer"` (default)
- `"pulse"`
- `"wave"`
- `"none"`

## Snapshot mode

Snapshot mode caches measured skeleton nodes by key.

```tsx
<SkeletonAuto loading={loading} snapshot="billing-card">
  <BillingCard />
</SkeletonAuto>
```

Use snapshot mode when:

- The layout is mostly stable.
- The component is shown frequently.

Skip snapshot mode when:

- The component structure changes often.
- The same key can represent very different layouts.

## Hook API (manual control)

```tsx
import { useSkeletonAuto } from "skeleton-ui-loader";
import "skeleton-ui-loader/styles.css";

function ManualLoader({ loading }: { loading: boolean }) {
  const { skeletonRef, SkeletonOverlay, snap } = useSkeletonAuto({
    animation: "wave",
    baseColor: "#1f2a39",
    shimmerColor: "#32445b",
    borderRadius: 12,
    snapshot: "manual-card"
  });

  return (
    <div style={{ position: "relative" }}>
      <div ref={skeletonRef} style={loading ? { opacity: 0.001, pointerEvents: "none" } : undefined}>
        <CardContent />
      </div>

      {loading ? <SkeletonOverlay /> : null}

      <button type="button" onClick={snap}>
        Re-scan layout
      </button>
    </div>
  );
}
```

## Advanced control attributes

### `data-skeleton-id`

Attach a stable identity to improve snapshot matching.

```tsx
<article data-skeleton-id="user-card-root">...</article>
```

### `data-skeleton-container`

Force a container surface to be represented as a structural skeleton block.

```tsx
<section data-skeleton-container="true">...</section>
```

Useful for card surfaces, panels, or grouped blocks where container shape matters.

## API reference

### `SkeletonAuto` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `loading` | `boolean` | required | Enables skeleton overlay when `true`. |
| `children` | `ReactNode` | required | Real content used for layout measurement. |
| `baseColor` | `string` | `#e0e0e0` | Base skeleton color. |
| `shimmerColor` | `string` | `#f0f0f0` | Highlight color used by shimmer/wave. |
| `animation` | `"shimmer" \| "pulse" \| "wave" \| "none"` | `"shimmer"` | Skeleton animation type. |
| `borderRadius` | `number` | `4` | Fallback corner radius for skeleton nodes. |
| `snapshot` | `string` | `undefined` | Cache key for snapshot mode. |
| `maxDepth` | `number` | `12` | DOM traversal depth limit. |
| `minWidth` | `number` | `2` | Minimum node width to include. |
| `minHeight` | `number` | `2` | Minimum node height to include. |
| `onReady` | `() => void` | `undefined` | Called when nodes are generated. |
| `className` | `string` | `undefined` | Wrapper class name. |
| `style` | `CSSProperties` | `undefined` | Wrapper inline style. |

### `useSkeletonAuto(options)`

Options:

- `baseColor?: string`
- `shimmerColor?: string`
- `borderRadius?: number`
- `animation?: SkeletonAnimation`
- `snapshot?: string`
- `maxDepth?: number`
- `minWidth?: number`
- `minHeight?: number`
- `onReady?: () => void`

Return:

- `skeletonRef: RefObject<HTMLDivElement>`
- `SkeletonOverlay: () => ReactElement | null`
- `snap: () => void`
- `ready: boolean`
- `nodes: SkeletonNode[]`

### Utility exports

- `clearSnapshot(key?: string)`
- `getSnapshot(key: string)`
- `setSnapshot(key: string, nodes: SkeletonNode[])`
- `hasSkeletonDiff(previous, next, tolerance?)`
- `walk(root, options?)`
- `classifyElement(element, rect)`

## Classification behavior (high level)

- Headings (`h1`-`h6`) -> heading skeletons
- Media (`img`, `figure`, `picture`, etc.) -> image skeletons
- Buttons and inputs -> control-shaped skeletons
- Icons and compact symbolic elements -> icon skeletons
- Styled container surfaces -> structural block skeletons
- Text-like nodes -> content bars with estimated line width

## SSR behavior

- On server: renders a generic placeholder fallback.
- On client mount: measures real layout and hydrates into real skeleton nodes.

## Performance tips

- Use `snapshot` for repeated stable UI patterns.
- Use `data-skeleton-id` on key containers for reliable identity.
- Set `maxDepth` lower on very deep trees.
- Raise `minWidth` and `minHeight` to skip micro nodes.

## Troubleshooting

### Skeleton is too noisy

- Increase `minWidth` and `minHeight`.
- Use `data-skeleton-container` only on key structural wrappers.

### Skeleton looks stale with snapshot mode

- Change snapshot key when structure changes.
- Call `clearSnapshot("your-key")` before next render.

### Skeleton does not match a special section

- Add `data-skeleton-id` for stable matching.
- Add `data-skeleton-container` on important visual surfaces.

## Development

```bash
npm run build
npm run typecheck
```

## License

MIT
