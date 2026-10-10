import { Panel } from '../components/Panel.ts';
import { LinkList } from '../components/LinkList.ts';
import { CertificationList } from '../components/CertificationList.ts';
import { setOutlet } from '../components/Layout.ts';
import { loadAll } from '../library/content.ts';

export function renderAbout(): void {
  const content = document.createElement('content');
  content.className = 'content-no-bg';

  const title = document.createElement('center');
  const h2 = document.createElement('h2');
  h2.textContent = 'ABOUT ME';
  title.appendChild(h2);
  content.appendChild(title);

  const about = document.createElement('div');
  about.id = 'about';

  const avatar = document.createElement('div');
  avatar.id = 'avatar-image';
  const img = document.createElement('img');
  img.src = 'assets/theme/avatar/avatar-vertical-transparent-bg.png';
  img.alt = 'avatar';
  avatar.appendChild(img);

  const desc = document.createElement('div');
  desc.id = 'about-desc';
  const p1 = document.createElement('p');
  p1.textContent = 'Consultant with 12+ years in client services for software and pathology industries.';
  const p2 = document.createElement('p');
  p2.textContent = 'Technical generalist with extensive problem-solving and data analysis experience.';
  const ul = document.createElement('ul');
  const projectsLi = document.createElement('li');
  projectsLi.textContent = 'side projects since October 2021';
  const postsLi = document.createElement('li');
  postsLi.textContent = 'blog posts since Sep 2021';
  ul.append(projectsLi, postsLi);
  desc.append(p1, p2, ul, LinkList());
  about.append(avatar, desc);
  content.appendChild(Panel(about));
  content.appendChild(document.createElement('br'));
  content.appendChild(CertificationList());
  content.appendChild(document.createElement('br'));

  const creditsTitle = document.createElement('center');
  const creditsH = document.createElement('h2');
  creditsH.textContent = 'SITE CREDITS';
  creditsTitle.appendChild(creditsH);
  content.appendChild(creditsTitle);

  const credits = document.createElement('div');
  const intro = document.createElement('p');
  intro.textContent = 'I designed this site and incorporated code from:';
  const list = document.createElement('ul');
  list.append(
    creditItem(
      'https://www.linkedin.com/learning/react-creating-and-hosting-a-full-stack-site-24928483/defining-environment-variables',
      'Creating a React site with URL path management by Shaun Wassell.',
    ),
    creditItem(
      'https://www.youtube.com/watch?v=gT1v33oA1gI&list=PLASldBPN_pkBfRXOkBOaeCJYzCnISw5-Z',
      'JavaScript that renders multiple page data from markdown by Will Ward.',
    ),
    creditItem(
      'https://www.youtube.com/watch?v=FntV9iEJ0tU',
      'Three.js code for a rotating Earth by Robot Bobby.',
    ),
  );
  const readme = document.createElement('p');
  const readmeLink = document.createElement('a');
  readmeLink.href = 'https://github.com/makuharistudio/makuharistudio.github.io';
  readmeLink.target = '_blank';
  readmeLink.rel = 'noreferrer';
  readmeLink.textContent = "Visit this site's README on GitHub.";
  readme.appendChild(readmeLink);
  credits.append(intro, list, readme);
  content.appendChild(Panel(credits));

  setOutlet(content);

  void loadAll('projects').then((projects) => {
    projectsLi.textContent = `${projects.length} side projects since October 2021`;
  });
  void loadAll('posts').then((posts) => {
    postsLi.textContent = `${posts.length} blog posts since Sep 2021`;
  });
}

function creditItem(href: string, text: string): HTMLElement {
  const li = document.createElement('li');
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noreferrer';
  a.textContent = text;
  p.appendChild(a);
  li.appendChild(p);
  return li;
}
