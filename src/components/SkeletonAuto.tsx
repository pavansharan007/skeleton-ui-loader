import { CSSProperties, ReactElement, ReactNode } from "react";
import { useSkeletonAuto, UseSkeletonAutoOptions } from "../hooks/useSkeletonAuto";
import { isServerEnvironment } from "../utils/ssr";

const DEFAULT_BASE_COLOR = "#e0e0e0";
const DEFAULT_BORDER_RADIUS = 4;

export interface SkeletonAutoProps extends UseSkeletonAutoOptions {
  loading: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface GenericPlaceholderProps {
  baseColor: string;
  borderRadius: number;
}

function GenericPlaceholder({ baseColor, borderRadius }: GenericPlaceholderProps): ReactElement {
  const blockStyle: CSSProperties = {
    position: "absolute",
    display: "block",
    backgroundColor: baseColor,
    borderRadius
  };

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.85 }}>
      <span style={{ ...blockStyle, top: "12%", left: 0, width: "62%", height: 16 }} />
      <span style={{ ...blockStyle, top: "34%", left: 0, width: "96%", height: 14 }} />
      <span style={{ ...blockStyle, top: "52%", left: 0, width: "88%", height: 14 }} />
      <span style={{ ...blockStyle, top: "74%", left: 0, width: "44%", height: 14 }} />
    </div>
  );
}

export function SkeletonAuto({
  loading,
  children,
  className,
  style,
  baseColor = DEFAULT_BASE_COLOR,
  borderRadius = DEFAULT_BORDER_RADIUS,
  shimmerColor,
  animation,
  snapshot,
  maxDepth,
  minWidth,
  minHeight,
  onReady
}: SkeletonAutoProps): ReactElement {
  const { skeletonRef, SkeletonOverlay, ready } = useSkeletonAuto({
    baseColor,
    borderRadius,
    shimmerColor,
    animation,
    snapshot,
    maxDepth,
    minWidth,
    minHeight,
    onReady
  });

  const hostStyle: CSSProperties = {
    position: "relative",
    ...style
  };

  const contentStyle: CSSProperties | undefined = loading
    ? {
        // Keep DOM measurable while visually hidden so the walker can collect rects.
        opacity: 0.001,
        pointerEvents: "none"
      }
    : undefined;

  const showGenericPlaceholder = loading && (isServerEnvironment() || !ready);

  return (
    <div className={className} style={hostStyle}>
      <div ref={skeletonRef} style={contentStyle} aria-busy={loading || undefined}>
        {children}
      </div>
      {loading ? showGenericPlaceholder ? <GenericPlaceholder baseColor={baseColor} borderRadius={borderRadius} /> : <SkeletonOverlay /> : null}
    </div>
  );
}
