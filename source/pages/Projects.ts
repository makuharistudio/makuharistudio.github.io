import { setOutlet } from '../components/Layout.ts';
import { FilterList } from '../components/FilterList.ts';
import { loadAll, loadByName } from '../library/content.ts';
import { renderMarkdown } from '../library/markdown.ts';
import { renderNotFound } from './NotFound.ts';

export function renderProjectsList(): void {
  const wrap = document.createElement('div');
  const title = document.createElement('center');
  const h1 = document.createElement('h1');
  h1.textContent = 'PROJECTS';
  const h3 = document.createElement('h3');
  h3.textContent = 'These are projects I created whilst exploring different technologies.';
  title.append(h1, h3);
  wrap.appendChild(title);
  setOutlet(wrap);

  void loadAll('projects').then((projects) => {
    wrap.appendChild(
      FilterList(projects, {
        kind: 'projects',
        listId: 'projects-list',
        allLabel: 'ALL PROJECTS',
        href: (item) => `#/project/${item.name}`,
        title: (item) => item.title,
        blurb: (item) => item.description,
      }),
    );
  });
}

export function renderProject(slug: string | null): void {
  if (!slug) {
    renderNotFound();
    return;
  }
  void loadByName('projects', slug).then((project) => {
    if (!project) {
      renderNotFound();
      return;
    }
    const content = document.createElement('content');
    const h3 = document.createElement('h3');
    h3.textContent = project.date;
    const h1 = document.createElement('h1');
    h1.textContent = project.title;
    const h2 = document.createElement('h2');
    h2.textContent = project.description;
    content.append(h3, h1, h2, renderMarkdown(project.content, 'projects'));
    setOutlet(content);
  });
}
