import type { ContentItem, ContentKind, Frontmatter } from './types.ts';

const EMPTY_FRONTMATTER: Frontmatter = {
  title: '',
  date: '',
  tech: '',
  tags: '',
  photo: '',
  description: '',
  siteURL: '',
  codeURL: '',
  author: '',
  publisher: '',
  publisherURL: '',
  category: '',
};

/** Same split as the old parser.js: first two lines that start with ---. */
export function parseFrontmatter(content: string): { metadata: Frontmatter; body: string } {
  const lines = content.split(/\r?\n/);
  const indices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line !== undefined && /^---/.test(line.trim())) indices.push(i);
    if (indices.length === 2) break;
  }
  if (indices.length < 2 || indices[0] === undefined || indices[1] === undefined) {
    return { metadata: { ...EMPTY_FRONTMATTER }, body: content };
  }

  const metadata: Frontmatter = { ...EMPTY_FRONTMATTER };
  const metaLines = lines.slice(indices[0] + 1, indices[1]);
  for (const line of metaLines) {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1]?.trim();
    const value = match[2]?.trim() ?? '';
    if (!key) continue;
    if (key in metadata) {
      metadata[key as keyof Frontmatter] = value;
    }
  }

  const body = lines.slice(indices[1] + 1).join('\n');
  return { metadata, body };
}

export function slugFromTitle(title: string): string {
  const cleaned = title.toLowerCase().replace(/[^a-z0-9- ]/g, '').replace(/\s+/g, '-');
  return cleaned.length > 0 ? cleaned : 'no-title';
}

export function parseTags(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'No tags given') return [];
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((tag): tag is string => typeof tag === 'string');
    }
  } catch {
    return trimmed.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  }
  return [];
}

export function photoUrl(kind: ContentKind, photo: string): string {
  const trimmed = photo.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const filename = trimmed.split('/').pop()?.trim() ?? '';
  if (!filename) return '';
  const folder = kind === 'posts' ? 'blog' : kind;
  return `assets/${folder}/${filename}`;
}

/** Rewrite old /src/assets/... image paths to dist-relative assets/. */
export function rewriteImagePaths(markdown: string, fallbackKind: ContentKind): string {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_full, alt: string, src: string) => {
    const rewritten = resolveAssetPath(src.trim(), fallbackKind);
    return `![${alt}](${rewritten})`;
  });
}

export function resolveAssetPath(src: string, fallbackKind: ContentKind): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('assets/')) return src;
  const filename = src.split('/').pop()?.trim() ?? '';
  if (!filename) return src;
  let folder: string;
  if (src.includes('/blog/') || src.startsWith('blog/')) folder = 'blog';
  else if (src.includes('/projects/') || src.startsWith('projects/')) folder = 'projects';
  else if (src.includes('/readings/') || src.startsWith('readings/')) folder = 'readings';
  else folder = fallbackKind === 'posts' ? 'blog' : fallbackKind;
  return `assets/${folder}/${filename}`;
}

function excerptFromBody(body: string): string {
  const plain = markdownToPlainText(body);
  const words = plain.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) return '';
  return words.slice(0, 30).join(' ') + ' . . . ';
}

export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function itemFromMarkdown(kind: ContentKind, filename: string, raw: string): ContentItem | null {
  const { metadata, body } = parseFrontmatter(raw);
  if (!metadata.title && !metadata.date) return null;
  const timestamp = Date.parse(metadata.date);
  const id = Number.isFinite(timestamp) ? Math.floor(timestamp / 1000) : 0;
  const description = metadata.description || (kind === 'posts' ? excerptFromBody(body) : '');
  return {
    id,
    title: metadata.title || 'No title given',
    name: slugFromTitle(metadata.title),
    date: metadata.date || 'No date given',
    content: body,
    photo: metadata.photo,
    tags: metadata.tags || 'No tags given',
    tech: metadata.tech || 'No tech given',
    description: description || 'No description given',
    siteURL: metadata.siteURL || 'No site URL given',
    codeURL: metadata.codeURL || 'No code URL given',
    author: metadata.author || 'No author given',
    publisher: metadata.publisher || 'No publisher given',
    publisherURL: metadata.publisherURL || 'No URL given',
    category: metadata.category || 'No category given',
    file: filename,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface InlineToken {
  type: 'text' | 'code' | 'em' | 'strong' | 'link' | 'image';
  text?: string;
  href?: string;
  children?: InlineToken[];
}

function isWhitespace(ch: string | undefined): boolean {
  return ch !== undefined && /\s/.test(ch);
}

function isPunctuation(ch: string | undefined): boolean {
  return ch !== undefined && /[!"#$%&'()*+,\-./:;<=>?@[\\\]^`{|}~]/.test(ch);
}

/**
 * Left-flanking: can open emphasis.
 * A run of the other emphasis marker counts as punctuation, so _**term**_
 * and **"quoted"** both open. A letter or digit still blocks an intra-word _.
 */
function canOpen(source: string, index: number, length: number, marker: '*' | '_'): boolean {
  const after = source[index + length];
  if (after === undefined || isWhitespace(after)) return false;
  if (marker === '*') return true;
  const before = source[index - 1];
  return before === undefined || isWhitespace(before) || isPunctuation(before) || before === '*';
}

/** Right-flanking: can close emphasis. Same exception for the other marker. */
function canClose(source: string, closerStart: number, used: number, marker: '*' | '_'): boolean {
  const before = source[closerStart - 1];
  if (before === undefined || isWhitespace(before)) return false;
  if (marker === '*') return true;
  const after = source[closerStart + used];
  return after === undefined || isWhitespace(after) || isPunctuation(after) || after === '*';
}

function findCloser(source: string, from: number, marker: '*' | '_', need: number): number {
  for (let j = from; j < source.length; j++) {
    if (source[j] === '\\') {
      j++;
      continue;
    }
    if (source[j] === '`') {
      const end = source.indexOf('`', j + 1);
      j = end === -1 ? source.length : end;
      continue;
    }
    if (source[j] !== marker) continue;
    let length = 0;
    while (source[j + length] === marker) length++;
    if (length >= need && canClose(source, j, need, marker)) return j;
    j += length - 1;
  }
  return -1;
}

/**
 * Emphasis used by the posts: * / _ italic, ** / __ bold, *** both,
 * and mixed wrappers such as _**bold italic**_.
 * Markers inside code spans stay literal. HTML is escaped later.
 */
function tokenizeInline(source: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let text = '';
  let i = 0;

  const flush = (): void => {
    if (text.length === 0) return;
    tokens.push({ type: 'text', text });
    text = '';
  };

  while (i < source.length) {
    const ch = source[i] ?? '';

    if (ch === '\\' && i + 1 < source.length) {
      text += source[i + 1];
      i += 2;
      continue;
    }

    if (ch === '`') {
      const end = source.indexOf('`', i + 1);
      if (end !== -1) {
        flush();
        tokens.push({ type: 'code', text: source.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (ch === '!') {
      const image = /^!\[([^\]]*)\]\(([^)\s]+)\)/.exec(source.slice(i));
      if (image) {
        flush();
        tokens.push({ type: 'image', text: image[1] ?? '', href: image[2] ?? '' });
        i += image[0].length;
        continue;
      }
    }

    if (ch === '[') {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(source.slice(i));
      if (link) {
        flush();
        tokens.push({
          type: 'link',
          href: link[2] ?? '',
          children: tokenizeInline(link[1] ?? ''),
        });
        i += link[0].length;
        continue;
      }
    }

    if (ch === '*' || ch === '_') {
      const marker = ch;
      let length = 0;
      while (source[i + length] === marker) length++;
      const openLen = Math.min(length, 3);
      const closeAt = canOpen(source, i, openLen, marker)
        ? findCloser(source, i + openLen, marker, openLen)
        : -1;
      if (closeAt !== -1) {
        flush();
        const children = tokenizeInline(source.slice(i + openLen, closeAt));
        if (openLen === 3) tokens.push({ type: 'em', children: [{ type: 'strong', children }] });
        else if (openLen === 2) tokens.push({ type: 'strong', children });
        else tokens.push({ type: 'em', children });
        i = closeAt + openLen;
        continue;
      }
      text += source.slice(i, i + length);
      i += length;
      continue;
    }

    text += ch;
    i++;
  }

  flush();
  return tokens;
}

function renderInlineTokens(tokens: InlineToken[]): string {
  return tokens.map((token) => {
    if (token.type === 'text') return escapeHtml(token.text ?? '');
    if (token.type === 'code') return `<code>${escapeHtml(token.text ?? '')}</code>`;
    if (token.type === 'image') {
      return `<img alt="${escapeHtml(token.text ?? '')}" src="${escapeHtml(token.href ?? '')}" loading="lazy">`;
    }
    const inner = renderInlineTokens(token.children ?? []);
    if (token.type === 'em') return `<em>${inner}</em>`;
    if (token.type === 'strong') return `<strong>${inner}</strong>`;
    const href = escapeHtml(token.href ?? '');
    const external = href.startsWith('http://') || href.startsWith('https://');
    const attrs = external ? ' target="_blank" rel="noreferrer"' : '';
    return `<a href="${href}"${attrs}>${inner}</a>`;
  }).join('');
}

function inlineMarkdown(text: string): string {
  return renderInlineTokens(tokenizeInline(text));
}

interface ListItem {
  text: string;
  blocks: Block[];
}

interface Block {
  type: 'h' | 'p' | 'ul' | 'ol' | 'pre' | 'hr';
  level?: number;
  text?: string;
  items?: ListItem[];
  lang?: string;
  ordered?: boolean;
  marker?: string;
}

const BULLET_RE = /^(\s*)([-*]|\d+\.)\s+(\S.*)$/;
const FENCE_RE = /^(\s*)```(.*)$/;

function indentOf(line: string): number {
  return /^(\s*)/.exec(line)?.[1]?.length ?? 0;
}

function parseBlocks(source: string, baseIndent = 0): { blocks: Block[]; next: number } {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  return parseBlockLines(lines, 0, lines.length, baseIndent);
}

function parseBlockLines(
  lines: string[],
  start: number,
  end: number,
  baseIndent: number,
): { blocks: Block[]; next: number } {
  const blocks: Block[] = [];
  let i = start;

  while (i < end) {
    const line = lines[i] ?? '';
    if (line.trim() === '') {
      i++;
      continue;
    }
    if (indentOf(line) < baseIndent) break;

    const fence = FENCE_RE.exec(line);
    if (fence && (fence[1]?.length ?? 0) >= baseIndent) {
      const code: string[] = [];
      i++;
      while (i < end && !/^\s*```/.test(lines[i] ?? '')) {
        code.push(lines[i] ?? '');
        i++;
      }
      if (i < end) i++;
      blocks.push({ type: 'pre', text: code.join('\n'), lang: (fence[2] ?? '').trim() });
      continue;
    }

    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line) && indentOf(line) <= baseIndent) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    const heading = /^(\s*)(#{1,6})\s+(.*)$/.exec(line);
    if (heading && (heading[1]?.length ?? 0) <= baseIndent) {
      blocks.push({ type: 'h', level: heading[2]?.length ?? 1, text: heading[3] ?? '' });
      i++;
      continue;
    }

    const marker = BULLET_RE.exec(line);
    if (marker && (marker[1]?.length ?? 0) >= baseIndent) {
      const parsed = parseList(lines, i, end, marker[1]?.length ?? 0);
      blocks.push(parsed.block);
      i = parsed.next;
      continue;
    }

    const para: string[] = [line.trim()];
    i++;
    while (i < end) {
      const next = lines[i] ?? '';
      if (next.trim() === '' || indentOf(next) < baseIndent) break;
      if (
        FENCE_RE.test(next) ||
        /^\s*#{1,6}\s+/.test(next) ||
        BULLET_RE.test(next) ||
        /^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(next)
      ) {
        break;
      }
      para.push(next.trim());
      i++;
    }
    blocks.push({ type: 'p', text: para.join(' ') });
  }

  return { blocks, next: i };
}

function skipFence(lines: string[], index: number, end: number): number {
  let i = index + 1;
  while (i < end && !/^\s*```/.test(lines[i] ?? '')) i++;
  return i < end ? i + 1 : i;
}

function nextSignificant(lines: string[], index: number, end: number): number {
  let i = index;
  while (i < end && (lines[i] ?? '').trim() === '') i++;
  return i;
}

/** A blank line or unindented fence still belongs to the item when a deeper marker follows it. */
function followingBelongsToItem(lines: string[], index: number, end: number, listIndent: number): boolean {
  const at = nextSignificant(lines, index, end);
  if (at >= end) return false;
  const line = lines[at] ?? '';
  const indent = indentOf(line);
  if (indent < listIndent) return false;
  if (FENCE_RE.test(line)) {
    return followingBelongsToItem(lines, skipFence(lines, at, end), end, listIndent);
  }
  const marker = BULLET_RE.exec(line);
  if (marker) return (marker[1]?.length ?? 0) > listIndent;
  if (/^\s*#{1,6}\s+/.test(line)) return false;
  return indent > listIndent;
}

function lineBelongsToItem(lines: string[], index: number, end: number, listIndent: number): boolean {
  if (index >= end) return false;
  const line = lines[index] ?? '';
  if (line.trim() === '') return followingBelongsToItem(lines, index + 1, end, listIndent);
  if (FENCE_RE.test(line) && indentOf(line) <= listIndent) {
    return followingBelongsToItem(lines, skipFence(lines, index, end), end, listIndent);
  }
  if (indentOf(line) < listIndent) return false;
  const marker = BULLET_RE.exec(line);
  if (marker && (marker[1]?.length ?? 0) <= listIndent) return false;
  if (/^\s*#{1,6}\s+/.test(line) && indentOf(line) <= listIndent) return false;
  if (indentOf(line) === listIndent && !FENCE_RE.test(line)) return false;
  return true;
}

function parseList(
  lines: string[],
  start: number,
  end: number,
  listIndent: number,
): { block: Block; next: number } {
  const first = BULLET_RE.exec(lines[start] ?? '');
  const ordered = /^\d+\.$/.test(first?.[2] ?? '');
  const items: ListItem[] = [];
  let i = start;

  while (i < end) {
    while (i < end && (lines[i] ?? '').trim() === '') i++;
    if (i >= end) break;

    const marker = BULLET_RE.exec(lines[i] ?? '');
    const markerIndent = marker?.[1]?.length ?? -1;
    if (!marker || markerIndent !== listIndent) break;
    if (/^\d+\.$/.test(marker[2] ?? '') !== ordered) break;

    const itemLines = [`${' '.repeat(listIndent)}${marker[3] ?? ''}`];
    i++;
    while (i < end && lineBelongsToItem(lines, i, end, listIndent)) {
      const next = lines[i] ?? '';
      if (FENCE_RE.test(next)) {
        const after = skipFence(lines, i, end);
        while (i < after) {
          itemLines.push(lines[i] ?? '');
          i++;
        }
        continue;
      }
      itemLines.push(next);
      i++;
    }

    const nested = parseBlockLines(itemLines, 0, itemLines.length, listIndent);
    const [firstBlock, ...rest] = nested.blocks;
    items.push({
      text: firstBlock?.type === 'p' ? firstBlock.text ?? '' : '',
      blocks: firstBlock?.type === 'p' ? rest : nested.blocks,
    });
  }

  return {
    block: { type: ordered ? 'ol' : 'ul', items, ordered, marker: first?.[2] ?? '' },
    next: i,
  };
}

function appendBlocks(parent: HTMLElement, blocks: Block[]): void {
  for (const block of blocks) {
    parent.appendChild(renderBlock(block));
  }
}

function renderBlock(block: Block): HTMLElement {
  if (block.type === 'hr') return document.createElement('hr');

  if (block.type === 'h') {
    const level = Math.min(6, Math.max(1, block.level ?? 1));
    const el = document.createElement(`h${level}`);
    el.innerHTML = inlineMarkdown(block.text ?? '');
    return el;
  }

  if (block.type === 'pre') {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = block.text ?? '';
    pre.appendChild(code);
    return pre;
  }

  if (block.type === 'ul' || block.type === 'ol') {
    const list = document.createElement(block.type);
    if (block.marker === '-') list.className = 'md-dash';
    for (const item of block.items ?? []) {
      const li = document.createElement('li');
      if (item.text) {
        const span = document.createElement('span');
        span.innerHTML = inlineMarkdown(item.text);
        li.appendChild(span);
      }
      appendBlocks(li, item.blocks);
      list.appendChild(li);
    }
    return list;
  }

  const text = block.text ?? '';
  const imageOnly = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(text.trim());
  if (imageOnly) {
    const img = document.createElement('img');
    img.alt = imageOnly[1] ?? '';
    img.src = imageOnly[2] ?? '';
    img.loading = 'lazy';
    return img;
  }
  const p = document.createElement('p');
  p.innerHTML = inlineMarkdown(text);
  return p;
}

/** Render markdown used by the old posts: headings, p, strong/em, links, images, fenced code, lists, hr. HTML is escaped. */
export function renderMarkdown(body: string, fallbackKind: ContentKind): HTMLElement {
  const rewritten = rewriteImagePaths(body, fallbackKind);
  const root = document.createElement('div');
  root.className = 'markdown-body';
  appendBlocks(root, parseBlocks(rewritten).blocks);
  return root;
}
