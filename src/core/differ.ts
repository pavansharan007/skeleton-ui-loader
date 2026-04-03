import { SkeletonNode } from "../types";

const snapshotStore = new Map<string, SkeletonNode[]>();

function cloneNodes(nodes: SkeletonNode[]): SkeletonNode[] {
  return nodes.map((node) => ({
    ...node,
    rect: { ...node.rect }
  }));
}

function sortNodes(nodes: SkeletonNode[]): SkeletonNode[] {
  return [...nodes].sort((a, b) => a.id.localeCompare(b.id));
}

export function getSnapshot(key: string): SkeletonNode[] | undefined {
  const cached = snapshotStore.get(key);
  return cached ? cloneNodes(cached) : undefined;
}

export function setSnapshot(key: string, nodes: SkeletonNode[]): void {
  snapshotStore.set(key, cloneNodes(nodes));
}

export function clearSnapshot(key?: string): void {
  if (!key) {
    snapshotStore.clear();
    return;
  }

  snapshotStore.delete(key);
}

export function hasSkeletonDiff(previous: SkeletonNode[], next: SkeletonNode[], tolerance = 1): boolean {
  if (previous.length !== next.length) {
    return true;
  }

  const sortedPrevious = sortNodes(previous);
  const sortedNext = sortNodes(next);

  for (let index = 0; index < sortedPrevious.length; index += 1) {
    const a = sortedPrevious[index];
    const b = sortedNext[index];

    if (a.id !== b.id || a.type !== b.type) {
      return true;
    }

    const widthDiff = Math.abs(a.rect.width - b.rect.width);
    const heightDiff = Math.abs(a.rect.height - b.rect.height);
    const leftDiff = Math.abs(a.rect.left - b.rect.left);
    const topDiff = Math.abs(a.rect.top - b.rect.top);

    if (widthDiff > tolerance || heightDiff > tolerance || leftDiff > tolerance || topDiff > tolerance) {
      return true;
    }
  }

  return false;
}
