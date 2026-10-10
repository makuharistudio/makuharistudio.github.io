import type { MenuLink } from '../library/types.ts';
import { getAccent, type ThemeAccent } from '../library/theme.ts';

interface MenuSpec {
  hash: string;
  label: string;
  match: (path: string) => boolean;
  icon: (accent: ThemeAccent) => string;
  iconActive: (accent: ThemeAccent) => string;
  footerLight: string;
  footerLightActive: string;
}

const MENU_SPECS: MenuSpec[] = [
  {
    hash: '#/',
    label: 'ABOUT',
    match: (path) => path === '/' || path === '',
    icon: (accent) => accent.about,
    iconActive: (accent) => accent.aboutActive,
    footerLight: 'menu-footer-light-highlight-teal',
    footerLightActive: 'menu-footer-light-highlight-red',
  },
  {
    hash: '#/projects',
    label: 'PROJECT',
    match: (path) => path.includes('/project'),
    icon: (accent) => accent.project,
    iconActive: (accent) => accent.projectActive,
    footerLight: 'menu-footer-light-highlight-teal',
    footerLightActive: 'menu-footer-light-highlight-purple',
  },
  {
    hash: '#/blog',
    label: 'BLOG',
    match: (path) => path.includes('/blog'),
    icon: (accent) => accent.blog,
    iconActive: (accent) => accent.blogActive,
    footerLight: 'menu-footer-light-highlight-teal',
    footerLightActive: 'menu-footer-light-highlight-purple',
  },
  {
    hash: '#/readings',
    label: 'READING',
    match: (path) => path.includes('/reading'),
    icon: (accent) => accent.reading,
    iconActive: (accent) => accent.readingActive,
    footerLight: 'menu-footer-light-highlight-teal',
    footerLightActive: 'menu-footer-light-highlight-blue',
  },
  {
    hash: '#/games',
    label: 'GAME',
    match: (path) => path.includes('/game'),
    icon: (accent) => accent.game,
    iconActive: (accent) => accent.gameActive,
    footerLight: 'menu-footer-light-highlight-teal',
    footerLightActive: 'menu-footer-light-highlight-orange',
  },
];

function links(): MenuLink[] {
  const accent = getAccent();
  return MENU_SPECS.map((spec) => ({
    hash: spec.hash,
    label: spec.label,
    match: spec.match,
    icon: spec.icon(accent),
    iconActive: spec.iconActive(accent),
    footerLight: spec.footerLight,
    footerLightActive: spec.footerLightActive,
  }));
}

function currentPath(): string {
  const hash = window.location.hash || '#/';
  const path = hash.startsWith('#') ? hash.slice(1) : hash;
  return path.split('?')[0] ?? '/';
}

export function MenuHeader(): HTMLElement {
  const nav = document.createElement('nav');
  nav.id = 'menu-header';

  for (const link of links()) {
    const a = document.createElement('a');
    a.href = link.hash;
    const active = link.match(currentPath());

    const button = document.createElement('div');
    button.className = 'menu-header-button';
    const img = document.createElement('img');
    img.src = active ? link.iconActive : link.icon;
    img.alt = link.label;
    button.appendChild(img);

    const label = document.createElement('div');
    label.className = 'menu-header-label';
    const h3 = document.createElement('h3');
    if (active) h3.className = 'menu-header';
    h3.textContent = link.label;
    label.appendChild(h3);

    a.append(button, label);
    nav.appendChild(a);
  }
  return nav;
}

export function MenuFooter(): HTMLElement {
  const nav = document.createElement('nav');
  nav.id = 'menu-footer';
  const path = currentPath();

  const entries: Array<MenuLink | null> = [...links(), null];
  for (const link of entries) {
    const a = document.createElement('a');
    if (link) {
      a.href = link.hash;
      const active = link.match(path);

      const button = document.createElement('div');
      button.className = 'menu-footer-button';
      const img = document.createElement('img');
      img.src = active ? link.iconActive : link.icon;
      img.alt = link.label;
      button.appendChild(img);

      const light = document.createElement('div');
      light.className = `menu-footer-light ${active ? link.footerLightActive : link.footerLight}`;

      const label = document.createElement('div');
      label.className = 'menu-footer-label';
      const h6 = document.createElement('h6');
      if (active) h6.className = 'menu-footer';
      h6.textContent = link.label;
      label.appendChild(h6);

      a.append(button, light, label);
    } else {
      a.href = '#/';
      const button = document.createElement('div');
      button.className = 'menu-footer-button';
      const img = document.createElement('img');
      img.src = getAccent().blank;
      img.alt = '';
      button.appendChild(img);
      const light = document.createElement('div');
      light.className = 'menu-footer-light menu-footer-light-highlight-white';
      const label = document.createElement('div');
      label.className = 'menu-footer-label';
      const h6 = document.createElement('h6');
      h6.textContent = '- - - - -';
      label.appendChild(h6);
      a.append(button, light, label);
    }
    nav.appendChild(a);
  }
  return nav;
}
