import { setOutlet } from '../components/Layout.ts';
import { FilterList } from '../components/FilterList.ts';
import { loadAll, loadByName } from '../library/content.ts';
import { renderMarkdown } from '../library/markdown.ts';
import { renderNotFound } from './NotFound.ts';

export function renderBlogList(): void {
  const wrap = document.createElement('div');
  const title = document.createElement('center');
  const h1 = document.createElement('h1');
  h1.textContent = 'BLOG POSTS';
  title.appendChild(h1);
  wrap.appendChild(title);
  setOutlet(wrap);

  void loadAll('posts').then((posts) => {
    wrap.appendChild(
      FilterList(posts, {
        kind: 'posts',
        listId: 'blog-list',
        allLabel: 'ALL POSTS',
        href: (item) => `#/blog/${item.name}`,
        title: (item) => item.title,
        blurb: (item) => item.description,
      }),
    );
  });
}

export function renderBlogPost(slug: string | null): void {
  if (!slug) {
    renderNotFound();
    return;
  }
  void loadByName('posts', slug).then((post) => {
    if (!post) {
      renderNotFound();
      return;
    }
    const content = document.createElement('content');
    const h1 = document.createElement('h1');
    h1.textContent = post.title;
    const h3 = document.createElement('h3');
    h3.textContent = post.date;
    content.append(h1, h3, renderMarkdown(post.content, 'posts'));
    setOutlet(content);
  });
}
