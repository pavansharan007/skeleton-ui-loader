export type SkeletonNodeType =
  | "text"
  | "heading"
  | "image"
  | "button"
  | "input"
  | "icon"
  | "block";

export type SkeletonAnimation = "shimmer" | "pulse" | "wave" | "none";

export interface SkeletonRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface SkeletonNode {
  id: string;
  type: SkeletonNodeType;
  rect: SkeletonRect;
  borderRadius: number;
}

export interface WalkOptions {
  maxDepth?: number;
  minWidth?: number;
  minHeight?: number;
  includeRoot?: boolean;
}

export interface SkeletonTheme {
  baseColor?: string;
  shimmerColor?: string;
  borderRadius?: number;
  animation?: SkeletonAnimation;
}
