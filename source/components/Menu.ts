import type { MenuLink } from '../library/types.ts';
import { getAccent, getMenuSpecs } from '../library/theme.ts';

function links(): MenuLink[] {
  const accent = getAccent();
  const specs = getMenuSpecs();
  return specs.map((spec) => {
    const icon = (spec.iconKey === 'about') ? accent.about :
                 (spec.iconKey === 'project') ? accent.project :
                 (spec.iconKey === 'blog') ? accent.blog :
                 (spec.iconKey === 'reading') ? accent.reading :
                 accent.game;
    const iconActive = (spec.iconKey === 'about') ? accent.aboutActive :
                       (spec.iconKey === 'project') ? accent.projectActive :
                       (spec.iconKey === 'blog') ? accent.blogActive :
                       (spec.iconKey === 'reading') ? accent.readingActive :
                       accent.gameActive;
    return {
      hash: spec.hash,
      label: spec.label,
      match: spec.match,
      icon,
      iconActive,
      footerLight: spec.footerLight,
      footerLightActive: spec.footerLightActive,
    };
  });
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
