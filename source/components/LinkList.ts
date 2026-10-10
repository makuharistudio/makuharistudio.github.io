import { getTheme, onThemeChange } from '../library/theme.ts';

interface LinkItem {
  name: string;
  href: string;
  light: string;
  lightActive: string;
  dark: string;
  darkActive: string;
}

const LOGO = 'assets/theme/logo';

// LinkedIn is commented out in the original data.js so it stays easy to toggle.
const LINKS: LinkItem[] = [
  {
    name: '𝕏',
    href: 'https://x.com/makuhari_studio',
    light: `${LOGO}/x-black.svg`,
    lightActive: `${LOGO}/x-blue.svg`,
    dark: `${LOGO}/x-white.svg`,
    darkActive: `${LOGO}/x-teal.svg`,
  },
  {
    name: 'GITHUB',
    href: 'https://github.com/makuharistudio',
    light: `${LOGO}/github-black.svg`,
    lightActive: `${LOGO}/github-blue.svg`,
    dark: `${LOGO}/github-white.svg`,
    darkActive: `${LOGO}/github-teal.svg`,
  },
  // {
  //   name: 'LINKEDIN',
  //   href: 'https://www.linkedin.com/in/MAKUHARI',
  //   light: `${LOGO}/linkedin-black.svg`,
  //   lightActive: `${LOGO}/linkedin-blue.svg`,
  //   dark: `${LOGO}/linkedin-white.svg`,
  //   darkActive: `${LOGO}/linkedin-teal.svg`,
  // },
];

export function LinkList(): HTMLElement {
  const nav = document.createElement('nav');
  nav.id = 'link-list';

  for (const item of LINKS) {
    const a = document.createElement('a');
    a.href = item.href;
    a.target = '_blank';
    a.rel = 'noreferrer';

    const img = document.createElement('img');
    img.className = 'link-icon';
    img.alt = item.name;
    img.loading = 'lazy';

    const label = document.createElement('h6');
    label.textContent = item.name;

    const paint = (active: boolean): void => {
      const dark = getTheme() === 'dark';
      img.src = active ? (dark ? item.darkActive : item.lightActive) : dark ? item.dark : item.light;
    };
    paint(false);
    a.addEventListener('mouseenter', () => paint(true));
    a.addEventListener('mouseleave', () => paint(false));
    onThemeChange(() => paint(false));

    a.append(img, label);
    nav.appendChild(a);
  }
  return nav;
}
