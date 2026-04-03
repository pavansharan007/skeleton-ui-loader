import { CSSProperties, ReactElement } from "react";
import { SkeletonAnimation, SkeletonNode } from "../types";
import { ensureSkeletonStyles } from "./styleRegistry";

export interface SkeletonOverlayProps {
  nodes: SkeletonNode[];
  baseColor: string;
  shimmerColor: string;
  borderRadius: number;
  animation: SkeletonAnimation;
}

function animationClass(animation: SkeletonAnimation): string {
  switch (animation) {
    case "pulse":
      return "skeleton-auto-node--pulse";
    case "wave":
      return "skeleton-auto-node--wave";
    case "none":
      return "skeleton-auto-node--none";
    case "shimmer":
    default:
      return "skeleton-auto-node--shimmer";
  }
}

function resolveRadius(node: SkeletonNode, fallbackRadius: number): number {
  if (node.type === "button") {
    return Math.max(fallbackRadius, node.rect.height / 2);
  }

  if (node.type === "icon") {
    return Math.max(fallbackRadius, Math.min(node.rect.width, node.rect.height) / 2);
  }

  if (node.type === "image") {
    const ratio = Math.min(node.rect.width, node.rect.height) / Math.max(node.rect.width, node.rect.height);
    if (ratio >= 0.9) {
      return Math.max(fallbackRadius, Math.min(node.rect.width, node.rect.height) / 2);
    }
  }

  return node.borderRadius > 0 ? node.borderRadius : fallbackRadius;
}

function nodePriority(node: SkeletonNode): number {
  return node.type === "block" ? 0 : 1;
}

export function SkeletonOverlay({
  nodes,
  baseColor,
  shimmerColor,
  borderRadius,
  animation
}: SkeletonOverlayProps): ReactElement | null {
  ensureSkeletonStyles();

  if (nodes.length === 0) {
    return null;
  }

  const nodeClass = animationClass(animation);
  const orderedNodes = [...nodes].sort((a, b) => nodePriority(a) - nodePriority(b));

  return (
    <div className="skeleton-auto-overlay" aria-hidden="true">
      {orderedNodes.map((node) => {
        const style = {
          top: `${node.rect.top}px`,
          left: `${node.rect.left}px`,
          width: `${node.rect.width}px`,
          height: `${node.rect.height}px`,
          borderRadius: `${resolveRadius(node, borderRadius)}px`,
          zIndex: node.type === "block" ? 0 : 1,
          "--skeleton-base": baseColor,
          "--skeleton-highlight": shimmerColor
        } as CSSProperties;

        return (
          <span
            key={node.id}
            className={`skeleton-auto-node skeleton-auto-node--type-${node.type} ${nodeClass}`}
            style={style}
          />
        );
      })}
    </div>
  );
}
