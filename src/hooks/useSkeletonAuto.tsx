import { ReactElement, RefObject, useCallback, useEffect, useRef, useState } from "react";
import { getSnapshot, hasSkeletonDiff, setSnapshot } from "../core/differ";
import { walk } from "../core/walker";
import { SkeletonOverlay as SkeletonOverlayRenderer } from "../renderer/SkeletonOverlay";
import { SkeletonAnimation, SkeletonNode } from "../types";
import { isServerEnvironment, useSafeLayoutEffect } from "../utils/ssr";

const DEFAULT_BASE_COLOR = "#e0e0e0";
const DEFAULT_SHIMMER_COLOR = "#f0f0f0";
const DEFAULT_BORDER_RADIUS = 4;

export interface UseSkeletonAutoOptions {
  baseColor?: string;
  shimmerColor?: string;
  borderRadius?: number;
  animation?: SkeletonAnimation;
  snapshot?: string;
  maxDepth?: number;
  minWidth?: number;
  minHeight?: number;
  onReady?: () => void;
}

export interface UseSkeletonAutoResult {
  skeletonRef: RefObject<HTMLDivElement>;
  SkeletonOverlay: () => ReactElement | null;
  snap: () => void;
  ready: boolean;
  nodes: SkeletonNode[];
}

export function useSkeletonAuto(options: UseSkeletonAutoOptions = {}): UseSkeletonAutoResult {
  const {
    baseColor = DEFAULT_BASE_COLOR,
    shimmerColor = DEFAULT_SHIMMER_COLOR,
    borderRadius = DEFAULT_BORDER_RADIUS,
    animation = "shimmer",
    snapshot,
    maxDepth,
    minWidth,
    minHeight,
    onReady
  } = options;

  const skeletonRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<SkeletonNode[]>([]);
  const [ready, setReady] = useState(false);

  const markReady = useCallback(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);

  const generateNodes = useCallback(
    (forceRefresh: boolean) => {
      if (isServerEnvironment()) {
        return;
      }

      const root = skeletonRef.current;
      if (!root) {
        return;
      }

      let cachedSnapshot: SkeletonNode[] | undefined;
      if (snapshot && !forceRefresh) {
        cachedSnapshot = getSnapshot(snapshot);
        if (cachedSnapshot && cachedSnapshot.length > 0) {
          setNodes(cachedSnapshot);
        }
      }

      const nextNodes = walk(root, {
        maxDepth,
        minWidth,
        minHeight
      });

      if (snapshot) {
        const previous = cachedSnapshot ?? getSnapshot(snapshot);
        if (!previous || hasSkeletonDiff(previous, nextNodes)) {
          setSnapshot(snapshot, nextNodes);
        }
      }

      if (!cachedSnapshot || hasSkeletonDiff(cachedSnapshot, nextNodes)) {
        setNodes(nextNodes);
      }

      markReady();
    },
    [markReady, maxDepth, minHeight, minWidth, snapshot]
  );

  const snap = useCallback(() => {
    generateNodes(true);
  }, [generateNodes]);

  useSafeLayoutEffect(() => {
    if (isServerEnvironment()) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      generateNodes(false);
    });

    const settle = () => {
      generateNodes(true);
    };

    let settleTimer = 0;
    if (snapshot) {
      settleTimer = window.setTimeout(settle, 220);
      window.addEventListener("load", settle);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      if (settleTimer) {
        window.clearTimeout(settleTimer);
      }
      if (snapshot) {
        window.removeEventListener("load", settle);
      }
    };
  }, [generateNodes, snapshot]);

  useEffect(() => {
    if (isServerEnvironment()) {
      return;
    }

    const root = skeletonRef.current;
    if (!root || snapshot) {
      return;
    }

    let frameId = 0;
    const schedule = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        generateNodes(true);
      });
    };

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : undefined;
    observer?.observe(root);

    window.addEventListener("resize", schedule);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [generateNodes, snapshot]);

  const Overlay = useCallback(() => {
    return (
      <SkeletonOverlayRenderer
        nodes={nodes}
        baseColor={baseColor}
        shimmerColor={shimmerColor}
        borderRadius={borderRadius}
        animation={animation}
      />
    );
  }, [animation, baseColor, borderRadius, nodes, shimmerColor]);

  return {
    skeletonRef,
    SkeletonOverlay: Overlay,
    snap,
    ready,
    nodes
  };
}
