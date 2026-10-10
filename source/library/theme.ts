import type { ColorMode, ThemeName } from './types.ts';
import { spaceTheme } from '../themes/space/index.ts';

const THEME_KEY = 'theme';
const STYLESHEET_ID = 'theme-stylesheet';

export interface ThemeAccent {
  about: string;
  aboutActive: string;
  project: string;
  projectActive: string;
  blog: string;
  blogActive: string;
  reading: string;
  readingActive: string;
  game: string;
  gameActive: string;
  blank: string;
  toggle: string;
}

export interface ThemePack {
  name: ThemeName;
  stylesheet: (mode: ColorMode) => string;
  assets: (mode: ColorMode) => ThemeAccent;
  initialiseBackground: (container: HTMLElement, mode: ColorMode) => () => void;
}

const registry: Record<ThemeName, ThemePack> = {
  space: spaceTheme,
};

let activeTheme: ThemePack = spaceTheme;
let currentTheme: ColorMode = 'dark';
const listeners = new Set<(mode: ColorMode) => void>();

export function setActiveTheme(name: ThemeName): void {
  activeTheme = registry[name];
}

export function getTheme(): ColorMode {
  return currentTheme;
}

export function getThemeName(): ThemeName {
  return activeTheme.name;
}

export function getAccent(): ThemeAccent {
  return activeTheme.assets(currentTheme);
}

export function onThemeChange(listener: (mode: ColorMode) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function applyTheme(mode: ColorMode): void {
  currentTheme = mode;
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem(THEME_KEY, mode);
  ensureStylesheet(mode);
  for (const listener of listeners) listener(mode);
}

export function loadTheme(): void {
  const saved = localStorage.getItem(THEME_KEY);
  const attr = document.documentElement.getAttribute('data-theme');
  let initial: ColorMode;
  if (saved === 'light' || saved === 'dark') {
    initial = saved;
  } else if (attr === 'light' || attr === 'dark') {
    initial = attr;
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    initial = prefersDark ? 'dark' : 'light';
  }
  applyTheme(initial);
}

export function toggleTheme(): void {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

/** Earth mosaic folder for games that draw their own globe. Path comes from the active theme. */
export function getEarthTextureBase(): string {
  return `themes/${activeTheme.name}/dark/background/images`;
}

/** Mount the active theme's background. Caller must run the cleanup before the next mount. */
export function initThemeBackground(container: HTMLElement): () => void {
  clearContainer(container);
  try {
    return activeTheme.initialiseBackground(container, currentTheme);
  } catch (error) {
    console.error('Failed to load background:', error);
    return () => {
      clearContainer(container);
    };
  }
}

function ensureStylesheet(mode: ColorMode): void {
  const href = activeTheme.stylesheet(mode);
  const existing = document.getElementById(STYLESHEET_ID);
  const link = existing instanceof HTMLLinkElement ? existing : document.createElement('link');
  if (!(existing instanceof HTMLLinkElement)) {
    link.id = STYLESHEET_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.getAttribute('href') !== href) link.href = href;
}

function clearContainer(container: HTMLElement): void {
  container.style.backgroundColor = '';
  container.style.backgroundImage = '';
  while (container.firstChild) container.removeChild(container.firstChild);
}
