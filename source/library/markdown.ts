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

function inlineMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  const withImages = escaped.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img alt="$1" src="$2" loading="lazy">',
  );
  return withImages
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
      const safeHref = href.replace(/"/g, '%22');
      const external = safeHref.startsWith('http://') || safeHref.startsWith('https://');
      const attrs = external ? ' target="_blank" rel="noreferrer"' : '';
      return `<a href="${safeHref}"${attrs}>${label}</a>`;
    });
}

interface Block {
  type: 'h' | 'p' | 'ul' | 'ol' | 'pre' | 'hr' | 'blank';
  level?: number;
  text?: string;
  items?: string[];
  lang?: string;
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? '').startsWith('```')) {
        code.push(lines[i] ?? '');
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: 'pre', text: code.join('\n'), lang });
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ type: 'h', level: heading[1]?.length ?? 1, text: heading[2] ?? '' });
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? '')) {
        const raw = lines[i] ?? '';
        const nested = /^\s{2,}[-*]\s+/.test(raw);
        const text = raw.replace(/^\s*[-*]\s+/, '');
        if (nested && items.length > 0) {
          const last = items[items.length - 1] ?? '';
          items[items.length - 1] = `${last}<br>• ${text}`;
        } else {
          items.push(text);
        }
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    const para: string[] = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i] ?? '';
      if (
        next.trim() === '' ||
        next.startsWith('```') ||
        next.startsWith('#') ||
        /^\s*[-*]\s+/.test(next) ||
        /^\s*\d+\.\s+/.test(next) ||
        /^(-{3,}|\*{3,}|_{3,})\s*$/.test(next)
      ) {
        break;
      }
      para.push(next);
      i++;
    }
    blocks.push({ type: 'p', text: para.join(' ') });
  }

  return blocks;
}

/** Render markdown used by the old posts: headings, p, strong/em, links, images, fenced code, lists, hr. HTML is escaped. */
export function renderMarkdown(body: string, fallbackKind: ContentKind): HTMLElement {
  const rewritten = rewriteImagePaths(body, fallbackKind);
  const root = document.createElement('div');
  root.className = 'markdown-body';

  for (const block of parseBlocks(rewritten)) {
    if (block.type === 'hr') {
      root.appendChild(document.createElement('hr'));
      continue;
    }
    if (block.type === 'h') {
      const level = Math.min(6, Math.max(1, block.level ?? 1));
      const el = document.createElement(`h${level}`);
      el.innerHTML = inlineMarkdown(block.text ?? '');
      root.appendChild(el);
      continue;
    }
    if (block.type === 'pre') {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = block.text ?? '';
      pre.appendChild(code);
      root.appendChild(pre);
      continue;
    }
    if (block.type === 'ul' || block.type === 'ol') {
      const list = document.createElement(block.type);
      for (const item of block.items ?? []) {
        const li = document.createElement('li');
        li.innerHTML = inlineMarkdown(item);
        list.appendChild(li);
      }
      root.appendChild(list);
      continue;
    }
    if (block.type === 'p') {
      const text = block.text ?? '';
      const imageOnly = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(text.trim());
      if (imageOnly) {
        const img = document.createElement('img');
        img.alt = imageOnly[1] ?? '';
        img.src = imageOnly[2] ?? '';
        img.loading = 'lazy';
        root.appendChild(img);
      } else {
        const p = document.createElement('p');
        p.innerHTML = inlineMarkdown(text);
        root.appendChild(p);
      }
    }
  }

  return root;
}
