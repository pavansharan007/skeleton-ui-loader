export { SkeletonAuto } from "./components/SkeletonAuto";
export type { SkeletonAutoProps } from "./components/SkeletonAuto";

export { useSkeletonAuto } from "./hooks/useSkeletonAuto";
export type { UseSkeletonAutoOptions, UseSkeletonAutoResult } from "./hooks/useSkeletonAuto";

export { walk } from "./core/walker";
export { classifyElement } from "./core/classifier";

export { clearSnapshot, getSnapshot, hasSkeletonDiff, setSnapshot } from "./core/differ";

export type { SkeletonAnimation, SkeletonNode, SkeletonNodeType, SkeletonRect, WalkOptions } from "./types";
