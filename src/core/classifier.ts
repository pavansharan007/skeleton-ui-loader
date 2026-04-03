import { SkeletonNodeType } from "../types";

const TEXT_TAGS = new Set([
  "P",
  "SPAN",
  "LABEL",
  "SMALL",
  "STRONG",
  "EM",
  "A",
  "LI",
  "TD",
  "TH"
]);

const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
const IMAGE_TAGS = new Set(["IMG", "PICTURE", "FIGURE", "VIDEO", "CANVAS"]);
const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const LEAF_TAGS = new Set([
  "IMG",
  "PICTURE",
  "FIGURE",
  "VIDEO",
  "CANVAS",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "BUTTON",
  "SVG",
  "PATH",
  "CIRCLE",
  "RECT"
]);

function parseBorderRadiusValue(value: string, referenceSize: number): number {
  const firstValue = value.trim().split(" ")[0] ?? "0";

  if (firstValue.endsWith("%")) {
    const percentage = Number.parseFloat(firstValue);
    if (Number.isNaN(percentage)) {
      return 0;
    }
    return (referenceSize * percentage) / 100;
  }

  const pxValue = Number.parseFloat(firstValue);
  return Number.isNaN(pxValue) ? 0 : pxValue;
}

function hasIconClassHint(el: Element): boolean {
  const className = (el.getAttribute("class") ?? "").toLowerCase();
  return className.includes("icon") || className.includes("avatar") || className.includes("symbol");
}

function hasDirectTextContent(el: Element): boolean {
  return Array.from(el.childNodes).some((node) => {
    return node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim().length > 0;
  });
}

export function hasMeaningfulText(el: Element): boolean {
  if (hasDirectTextContent(el)) {
    return true;
  }

  const text = (el.textContent ?? "").trim();
  return el.children.length === 0 && text.length > 0;
}

export function isLeafElement(el: Element): boolean {
  const tag = el.tagName;
  if (LEAF_TAGS.has(tag)) {
    return true;
  }

  return el.children.length === 0;
}

function isLikelyIcon(el: Element, rect: DOMRect): boolean {
  const tag = el.tagName;
  const isIconTag = tag === "SVG" || tag === "I" || tag === "USE" || hasIconClassHint(el);
  if (!isIconTag) {
    return false;
  }

  const shortestSide = Math.min(rect.width, rect.height);
  const longestSide = Math.max(rect.width, rect.height);
  if (longestSide === 0) {
    return false;
  }

  const ratio = shortestSide / longestSide;
  return longestSide <= 40 && ratio >= 0.7;
}

export function getComputedBorderRadius(el: Element, rect: DOMRect): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const style = window.getComputedStyle(el);
  const referenceSize = Math.min(rect.width, rect.height);
  return parseBorderRadiusValue(style.borderRadius, referenceSize);
}

export function classifyElement(el: Element, rect: DOMRect): SkeletonNodeType {
  const tag = el.tagName;
  const role = (el.getAttribute("role") ?? "").toLowerCase();

  if (HEADING_TAGS.has(tag)) {
    return "heading";
  }

  if (IMAGE_TAGS.has(tag) || role === "img") {
    return "image";
  }

  if (tag === "BUTTON" || role === "button") {
    return "button";
  }

  if (INPUT_TAGS.has(tag)) {
    return "input";
  }

  if (isLikelyIcon(el, rect)) {
    return "icon";
  }

  if (TEXT_TAGS.has(tag) || hasMeaningfulText(el)) {
    return "text";
  }

  return "block";
}
