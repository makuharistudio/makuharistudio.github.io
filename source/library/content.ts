import type { ContentItem, ContentKind } from './types.ts';
import { catalog } from './catalog.ts';
import { itemFromMarkdown } from './markdown.ts';
import { rawFiles } from './markdown-raw.ts';

const cache = new Map<ContentKind, ContentItem[]>();

export async function loadAll(kind: ContentKind): Promise<ContentItem[]> {
  const cached = cache.get(kind);
  if (cached) return cached;

  const files = catalog[kind];
  const items: ContentItem[] = [];
  for (const filename of files) {
    const raw = rawFiles[`${kind}/${filename}`];
    if (raw === undefined) continue;
    const item = itemFromMarkdown(kind, filename, raw);
    if (item) items.push(item);
  }
  items.sort((a, b) => b.id - a.id);
  cache.set(kind, items);
  return items;
}

export async function loadByName(kind: ContentKind, name: string): Promise<ContentItem | null> {
  const items = await loadAll(kind);
  return items.find((item) => item.name === name) ?? null;
}
