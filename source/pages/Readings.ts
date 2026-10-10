import { setOutlet } from '../components/Layout.ts';
import { FilterList } from '../components/FilterList.ts';
import { loadAll, loadByName } from '../library/content.ts';
import { renderMarkdown } from '../library/markdown.ts';
import { renderNotFound } from './NotFound.ts';

export function renderReadingsList(): void {
  const wrap = document.createElement('div');
  const title = document.createElement('center');
  const h1 = document.createElement('h1');
  h1.textContent = 'READINGS';
  const h3 = document.createElement('h3');
  h3.textContent = 'This is a non-exhaustive list of books I have read along with summaries of lessons learned.';
  title.append(h1, h3);
  wrap.appendChild(title);
  setOutlet(wrap);

  void loadAll('readings').then((readings) => {
    wrap.appendChild(
      FilterList(readings, {
        kind: 'readings',
        listId: 'readings-list',
        allLabel: 'ALL BOOKS',
        href: (item) => `#/reading/${item.name}`,
        title: (item) => `${item.title} by ${item.author}`,
        blurb: (item) => item.description,
      }),
    );
  });
}

export function renderReading(slug: string | null): void {
  if (!slug) {
    renderNotFound();
    return;
  }
  void loadByName('readings', slug).then((reading) => {
    if (!reading) {
      renderNotFound();
      return;
    }
    const content = document.createElement('content');
    const h3 = document.createElement('h3');
    h3.textContent = reading.date;
    const h1 = document.createElement('h1');
    h1.textContent = `${reading.title} by ${reading.author}`;
    content.append(h3, h1, renderMarkdown(reading.content, 'readings'));
    setOutlet(content);
  });
}
