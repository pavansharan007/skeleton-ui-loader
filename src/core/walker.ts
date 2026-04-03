import { classifyElement, getComputedBorderRadius, hasMeaningfulText, isLeafElement } from "./classifier";
import { SkeletonNode, SkeletonRect, WalkOptions } from "../types";

const DEFAULT_MAX_DEPTH = 12;
const DEFAULT_MIN_SIZE = 2;
const CONTAINER_TAGS = new Set([
  "DIV",
  "SECTION",
  "ARTICLE",
  "MAIN",
  "ASIDE",
  "HEADER",
  "FOOTER",
  "NAV",
  "FORM",
  "UL",
  "OL",
  "LI",
  "TABLE",
  "TR",
  "TD",
  "TH"
]);

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 30);
}

function getNodeId(node: Element, path: string): string {
  const explicitId = node.getAttribute("data-skeleton-id");
  if (explicitId) {
    return explicitId;
  }

  const text = normalizeText(node.textContent ?? "");
  return text.length > 0 ? `${path}:${text}` : path;
}

function isVisible(node: Element, rect: DOMRect, minWidth: number, minHeight: number): boolean {
  if (rect.width < minWidth || rect.height < minHeight) {
    return false;
  }

  if (typeof window === "undefined") {
    return true;
  }

  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  const opacity = Number.parseFloat(style.opacity || "1");
  if (!Number.isNaN(opacity) && opacity <= 0) {
    return false;
  }

  return true;
}

function toRelativeRect(rootRect: DOMRect, rect: DOMRect): SkeletonRect {
  return {
    top: round(rect.top - rootRect.top),
    left: round(rect.left - rootRect.left),
    width: round(rect.width),
    height: round(rect.height)
  };
}

function isTransparentColor(value: string): boolean {
  const normalized = value.replace(/\s+/g, "").toLowerCase();
  if (normalized === "transparent" || normalized === "rgba(0,0,0,0)" || normalized === "hsla(0,0%,0%,0)") {
    return true;
  }

  if (normalized.startsWith("rgba(")) {
    const parts = normalized.slice(5, -1).split(",");
    const alpha = Number.parseFloat(parts[3] ?? "1");
    return !Number.isNaN(alpha) && alpha <= 0;
  }

  if (normalized.startsWith("hsla(")) {
    const parts = normalized.slice(5, -1).split(",");
    const alpha = Number.parseFloat(parts[3] ?? "1");
    return !Number.isNaN(alpha) && alpha <= 0;
  }

  return false;
}

function isContainerElement(node: Element): boolean {
  return CONTAINER_TAGS.has(node.tagName);
}

function hasVisualSurfaceStyle(node: Element): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const style = window.getComputedStyle(node);
  const hasBackground = !isTransparentColor(style.backgroundColor) || style.backgroundImage !== "none";

  const borderTop = Number.parseFloat(style.borderTopWidth || "0");
  const borderRight = Number.parseFloat(style.borderRightWidth || "0");
  const borderBottom = Number.parseFloat(style.borderBottomWidth || "0");
  const borderLeft = Number.parseFloat(style.borderLeftWidth || "0");

  const hasBorder =
    (borderTop > 0 && !isTransparentColor(style.borderTopColor)) ||
    (borderRight > 0 && !isTransparentColor(style.borderRightColor)) ||
    (borderBottom > 0 && !isTransparentColor(style.borderBottomColor)) ||
    (borderLeft > 0 && !isTransparentColor(style.borderLeftColor));

  const hasShadow = style.boxShadow !== "none";
  return hasBackground || hasBorder || hasShadow;
}

function shouldRecordContainer(node: Element, rect: DOMRect, rootRect: DOMRect, depth: number): boolean {
  if (node.hasAttribute("data-skeleton-container")) {
    return true;
  }

  if (!isContainerElement(node) || !hasVisualSurfaceStyle(node)) {
    return false;
  }

  const rootArea = rootRect.width * rootRect.height;
  if (rootArea <= 0) {
    return true;
  }

  const coverage = (rect.width * rect.height) / rootArea;

  // Skip giant top-level slabs so content detail remains visible.
  if (coverage > 0.94 && depth <= 1) {
    return false;
  }

  return true;
}

export function walk(root: Element, options: WalkOptions = {}): SkeletonNode[] {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const minWidth = options.minWidth ?? DEFAULT_MIN_SIZE;
  const minHeight = options.minHeight ?? DEFAULT_MIN_SIZE;
  const includeRoot = options.includeRoot ?? false;

  const rootRect = root.getBoundingClientRect();
  const nodes: SkeletonNode[] = [];

  const traverse = (node: Element, depth: number, path: string): void => {
    if (depth > maxDepth) {
      return;
    }

    const rect = node.getBoundingClientRect();
    if (!isVisible(node, rect, minWidth, minHeight)) {
      return;
    }

    const type = classifyElement(node, rect);
    const leaf = isLeafElement(node);
    const containerSurface = type === "block" && shouldRecordContainer(node, rect, rootRect, depth);
    const recordNode =
      (includeRoot || depth > 0) &&
      (leaf || type !== "block" || hasMeaningfulText(node) || containerSurface);

    if (recordNode) {
      nodes.push({
        id: getNodeId(node, path),
        type,
        rect: toRelativeRect(rootRect, rect),
        borderRadius: round(getComputedBorderRadius(node, rect))
      });
    }

    if (leaf) {
      return;
    }

    const children = Array.from(node.children);
    for (let index = 0; index < children.length; index += 1) {
      traverse(children[index], depth + 1, `${path}.${index}`);
    }
  };

  traverse(root, 0, "0");

  return nodes;
}
