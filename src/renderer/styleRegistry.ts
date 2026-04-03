const STYLE_ID = "skeleton-ui-loader-style";

const STYLE_TEXT = `
.skeleton-auto-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.skeleton-auto-node {
  position: absolute;
  display: block;
  overflow: hidden;
  background: var(--skeleton-base, #e0e0e0);
}

.skeleton-auto-node::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    var(--skeleton-highlight, #f0f0f0) 50%,
    transparent 100%
  );
}

.skeleton-auto-node--shimmer::after {
  animation: skeleton-auto-shimmer 1.4s ease-in-out infinite;
}

.skeleton-auto-node--wave::after {
  animation: skeleton-auto-wave 1.8s linear infinite;
}

.skeleton-auto-node--pulse {
  animation: skeleton-auto-pulse 1.5s ease-in-out infinite;
}

.skeleton-auto-node--pulse::after,
.skeleton-auto-node--none::after {
  display: none;
}

@keyframes skeleton-auto-shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes skeleton-auto-wave {
  0% {
    transform: translateX(-120%);
  }

  100% {
    transform: translateX(120%);
  }
}

@keyframes skeleton-auto-pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-auto-node--shimmer::after,
  .skeleton-auto-node--wave::after,
  .skeleton-auto-node--pulse {
    animation: none !important;
    transform: none !important;
  }
}
`;

export function ensureSkeletonStyles(): void {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLE_TEXT;
  document.head.appendChild(style);
}
