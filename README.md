# skeleton-ui-loader

Zero-config React skeleton loaders that are automatically generated from your real component DOM shape.

## Install

```bash
npm install skeleton-ui-loader
```

## Quick Start

```tsx
import { SkeletonAuto } from "skeleton-ui-loader";

function UserCardLoader({ isLoading }: { isLoading: boolean }) {
  return (
    <SkeletonAuto loading={isLoading}>
      <UserCard />
    </SkeletonAuto>
  );
}
```

## Theming

```tsx
<SkeletonAuto
  loading={isLoading}
  baseColor="#e0e0e0"
  shimmerColor="#f5f5f5"
  borderRadius={8}
  animation="shimmer"
>
  <UserCard />
</SkeletonAuto>
```

## Snapshot Mode

```tsx
<SkeletonAuto loading={isLoading} snapshot="user-card">
  <UserCard />
</SkeletonAuto>
```

When a snapshot key exists, the cached skeleton shape is reused.

## Hook API

```tsx
import { useSkeletonAuto } from "skeleton-ui-loader";

function ManualLoader({ loading }: { loading: boolean }) {
  const { skeletonRef, SkeletonOverlay, snap } = useSkeletonAuto({
    animation: "wave",
    borderRadius: 10
  });

  useEffect(() => {
    snap();
  }, [snap]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={skeletonRef} style={loading ? { visibility: "hidden" } : undefined}>
        <UserCard />
      </div>
      {loading ? <SkeletonOverlay /> : null}
    </div>
  );
}
```

## API

### SkeletonAuto props

- loading: boolean (required)
- children: ReactNode (required)
- baseColor?: string (default #e0e0e0)
- shimmerColor?: string (default #f0f0f0)
- animation?: "shimmer" | "pulse" | "wave" | "none" (default shimmer)
- borderRadius?: number (default 4)
- snapshot?: string
- maxDepth?: number
- minWidth?: number
- minHeight?: number
- onReady?: () => void

## Notes

- Works with React 17+.
- SSR safe: renders a generic placeholder on server and hydrates with measured skeletons on client.
- No network calls are made.
- Styling is injected automatically. Optional static stylesheet is available at skeleton-ui-loader/styles.css.

## Development

```bash
npm run build
npm run typecheck
```
