import { classifyElement, getComputedBorderRadius, hasMeaningfulText, isLeafElement } from "./classifier";
import { SkeletonNode, SkeletonNodeType, SkeletonRect, WalkOptions } from "../types";

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

function normalizeLongText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parsePx(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

let measureContext: CanvasRenderingContext2D | null | undefined;

function getTextMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") {
    return null;
  }

  if (measureContext !== undefined) {
    return measureContext;
  }

  const canvas = document.createElement("canvas");
  measureContext = canvas.getContext("2d");
  return measureContext;
}

function getNodeId(node: Element, path: string): string {
  const explicitId = node.getAttribute("data-skeleton-id");
  if (explicitId) {
    return explicitId;
  }

  const text = normalizeText(node.textContent ?? "");
  return text.length > 0 ? `${path}:${text}` : path;
}

function resolveTextLikeWidth(node: Element, type: SkeletonNodeType, rect: DOMRect): number {
  if (type !== "text" && type !== "heading") {
    return rect.width;
  }

  const text = normalizeLongText(node.textContent ?? "");
  if (text.length === 0) {
    return rect.width;
  }

  if (typeof window === "undefined") {
    return rect.width;
  }

  const context = getTextMeasureContext();
  if (!context) {
    return rect.width;
  }

  const style = window.getComputedStyle(node);
  const fontStyle = style.fontStyle || "normal";
  const fontVariant = style.fontVariant || "normal";
  const fontWeight = style.fontWeight || "400";
  const fontSize = style.fontSize || "16px";
  const fontFamily = style.fontFamily || "sans-serif";
  context.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;

  const measured = context.measureText(text).width;
  const horizontalPadding = parsePx(style.paddingLeft) + parsePx(style.paddingRight);
  const minWidth = Math.min(rect.width, type === "heading" ? 120 : 42);
  const proposedWidth = measured + horizontalPadding + 6;

  if (proposedWidth <= minWidth) {
    return minWidth;
  }

  return Math.min(rect.width, proposedWidth);
}

function shouldRecordTextNode(node: Element, rect: DOMRect): boolean {
  const text = normalizeLongText(node.textContent ?? "");
  if (text.length === 0) {
    return false;
  }

  if (rect.width < 24 || rect.height < 9) {
    return false;
  }

  // Filter ultra-short labels that produce noisy micro-lines.
  if (text.length <= 2 && rect.width < 80) {
    return false;
  }

  return true;
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
    const textLike = type === "text" || type === "heading";
    const keepTextLike = !textLike || shouldRecordTextNode(node, rect);
    const recordNode =
      (includeRoot || depth > 0) &&
      keepTextLike &&
      (leaf || type !== "block" || hasMeaningfulText(node) || containerSurface);

    if (recordNode) {
      const relativeRect = toRelativeRect(rootRect, rect);
      if (textLike) {
        relativeRect.width = round(resolveTextLikeWidth(node, type, rect));
      }

      nodes.push({
        id: getNodeId(node, path),
        type,
        rect: relativeRect,
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
