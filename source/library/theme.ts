import type { ColorMode, ThemeName } from './types.ts';
import { themeRegistry } from './theme-registry.ts';

const THEME_KEY = 'theme';
const STYLESHEET_ID = 'theme-stylesheet';
const PACK_ATTR = 'data-theme-pack';

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

function packNamed(name: string): ThemePack | undefined {
  if (Object.prototype.hasOwnProperty.call(themeRegistry, name)) {
    return themeRegistry[name as ThemeName];
  }
  return undefined;
}

function fallbackPack(): ThemePack {
  const space = packNamed('space');
  if (space) return space;
  const first = Object.values(themeRegistry)[0];
  if (!first) {
    throw new Error('No theme packs registered');
  }
  return first;
}

/** Pack name from index.html: data-theme-pack, then the no-flash stylesheet href. */
function readPackName(): ThemeName {
  const attr = document.documentElement.getAttribute(PACK_ATTR);
  const fromAttr = attr ? packNamed(attr) : undefined;
  if (fromAttr) return fromAttr.name;

  const link = document.getElementById(STYLESHEET_ID);
  if (link instanceof HTMLLinkElement) {
    const href = link.getAttribute('href') ?? '';
    const match = /(?:^|\/)themes\/([^/]+)\//.exec(href);
    const fromHref = match?.[1] ? packNamed(match[1]) : undefined;
    if (fromHref) return fromHref.name;
  }
  return fallbackPack().name;
}

let activeTheme: ThemePack = fallbackPack();
let currentTheme: ColorMode = 'dark';
const listeners = new Set<(mode: ColorMode) => void>();

export function setActiveTheme(name: ThemeName): void {
  const pack = packNamed(name);
  if (pack) activeTheme = pack;
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
  setActiveTheme(readPackName());
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

/** Globe mosaics for rocket/satellite games. Files live on the space pack. */
export function getEarthTextureBase(): string {
  return 'themes/space/dark/background/images';
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
