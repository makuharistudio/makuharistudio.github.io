import type { ContentItem, ContentKind } from '../library/types.ts';
import { parseTags, photoUrl } from '../library/markdown.ts';
import { Panel } from './Panel.ts';

export interface CardSpec {
  kind: ContentKind;
  listId: string;
  allLabel: string;
  href: (item: ContentItem) => string;
  title: (item: ContentItem) => string;
  blurb: (item: ContentItem) => string;
}

const ACTIVE_STYLE = 'color: var(--button-font-color-hover); border: 1px solid var(--button-font-color-hover);';

export function FilterList(items: ContentItem[], spec: CardSpec): HTMLElement {
  const root = document.createElement('div');
  let selected: string | null = null;

  const filter = document.createElement('div');
  filter.className = 'filter';
  const list = document.createElement('div');
  list.id = spec.listId;

  const tags = [...new Set(items.flatMap((item) => parseTags(item.tags)))].sort((a, b) => a.localeCompare(b));

  function paint(): void {
    filter.replaceChildren();
    const all = document.createElement('button');
    all.type = 'button';
    all.textContent = spec.allLabel;
    if (selected === null) all.setAttribute('style', ACTIVE_STYLE);
    all.addEventListener('click', () => {
      selected = null;
      paint();
    });
    filter.appendChild(all);

    for (const tag of tags) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = tag;
      if (selected === tag) button.setAttribute('style', ACTIVE_STYLE);
      button.addEventListener('click', () => {
        selected = tag;
        paint();
      });
      filter.appendChild(button);
    }

    const shown = selected === null ? items : items.filter((item) => parseTags(item.tags).includes(selected as string));
    list.replaceChildren();
    for (const item of shown) {
      const a = document.createElement('a');
      a.href = spec.href(item);
      const body = document.createElement('div');
      const h4 = document.createElement('h4');
      h4.textContent = spec.title(item);
      const h5 = document.createElement('h5');
      h5.textContent = item.date;
      const img = document.createElement('img');
      img.src = photoUrl(spec.kind, item.photo);
      img.alt = item.title;
      img.loading = 'lazy';
      const p = document.createElement('p');
      p.textContent = spec.blurb(item);
      body.append(h4, h5, img, p);
      a.appendChild(Panel(body));
      list.appendChild(a);
    }
  }

  paint();
  root.append(filter, list);
  return root;
}
