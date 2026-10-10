import { ThemeToggle } from './ThemeToggle.ts';
import { MenuHeader, MenuFooter } from './Menu.ts';
import { getTheme, initThemeBackground, onThemeChange } from '../library/theme.ts';
import type { ColorMode } from '../library/types.ts';

let outlet: HTMLElement | null = null;
let bgCleanup: (() => void) | null = null;
let mountedTheme: ColorMode | null = null;
let gameBackground: ((container: HTMLElement) => () => void) | null = null;
let scrollTimer = 0;

export function mountLayout(root: HTMLElement): HTMLElement {
  root.replaceChildren();

  const bg = document.createElement('div');
  bg.id = 'bg-space';

  outlet = document.createElement('div');
  outlet.id = 'outlet';
  const spacerA = document.createElement('br');
  const spacerB = document.createElement('br');
  outlet.append(spacerA, spacerB);

  root.append(ThemeToggle(), MenuHeader(), outlet, MenuFooter(), bg);
  mountBackground(bg, getTheme());

  onThemeChange(() => {
    const header = document.getElementById('menu-header');
    const footer = document.getElementById('menu-footer');
    header?.replaceWith(MenuHeader());
    footer?.replaceWith(MenuFooter());
    // A running game owns #bg-space. Remount that scene so the theme Earth
    // does not start underneath it, and so the previous scene is disposed.
    mountBackground(bg, getTheme());
  });

  return outlet;
}

function mountBackground(container: HTMLElement, mode: ColorMode): void {
  if (!gameBackground && mountedTheme === mode && bgCleanup) return;
  disposeBackground(container);
  if (gameBackground) {
    bgCleanup = gameBackground(container);
    mountedTheme = null;
    return;
  }
  bgCleanup = initThemeBackground(container);
  mountedTheme = mode;
}

/** Replace the theme scene with a game scene. Pass null to restore the theme. */
export function setGameBackground(init: ((container: HTMLElement) => () => void) | null): void {
  gameBackground = init;
  const bg = document.getElementById('bg-space');
  if (bg) mountBackground(bg, getTheme());
}

export function disposeBackground(container?: HTMLElement): void {
  if (bgCleanup) {
    bgCleanup();
    bgCleanup = null;
  }
  mountedTheme = null;
  const node = container ?? document.getElementById('bg-space');
  if (!node) return;
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function setOutlet(node: Node): void {
  if (!outlet) return;
  // Keep the two leading <br> spacers the old Layout rendered above <Outlet>.
  const spacers = [outlet.firstChild, outlet.childNodes[1]].filter((n): n is ChildNode => n instanceof HTMLBRElement);
  outlet.replaceChildren(...spacers, node);
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => {
    window.scrollTo(0, 0);
  }, 500);
}

export function refreshMenus(): void {
  document.getElementById('menu-header')?.replaceWith(MenuHeader());
  document.getElementById('menu-footer')?.replaceWith(MenuFooter());
}
