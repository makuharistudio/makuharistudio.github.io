import type { Route } from './types.ts';
import { renderAbout } from '../pages/About.ts';
import { renderBlogList, renderBlogPost } from '../pages/Blog.ts';
import { renderProjectsList, renderProject } from '../pages/Projects.ts';
import { renderReadingsList, renderReading } from '../pages/Readings.ts';
import { renderGames, renderGame } from '../pages/Games.ts';
import { renderNotFound } from '../pages/NotFound.ts';
import { mountLayout, refreshMenus } from '../components/Layout.ts';

const routes: Route[] = [
  { pattern: /^\/$/, handler: () => renderAbout() },
  { pattern: /^\/about$/, handler: () => renderAbout() },
  { pattern: /^\/blog$/, handler: () => renderBlogList() },
  { pattern: /^\/blog\/([^/]+)$/, handler: (slug) => renderBlogPost(slug) },
  { pattern: /^\/projects$/, handler: () => renderProjectsList() },
  { pattern: /^\/project\/([^/]+)$/, handler: (slug) => renderProject(slug) },
  { pattern: /^\/readings$/, handler: () => renderReadingsList() },
  { pattern: /^\/reading\/([^/]+)$/, handler: (slug) => renderReading(slug) },
  { pattern: /^\/games$/, handler: () => renderGames() },
  { pattern: /^\/game\/([^/]+)$/, handler: (slug) => renderGame(slug) },
];

function pathFromHash(): string {
  const hash = window.location.hash || '#/';
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const path = raw.split('?')[0] ?? '/';
  return path.startsWith('/') ? path : `/${path}`;
}

let leaveRoute: (() => void) | null = null;

function dispatch(): void {
  if (leaveRoute) {
    const finish = leaveRoute;
    leaveRoute = null;
    finish();
  }
  const path = pathFromHash();
  refreshMenus();
  for (const route of routes) {
    const match = path.match(route.pattern);
    if (!match) continue;
    const cleanup = route.handler(match[1] ?? null);
    leaveRoute = typeof cleanup === 'function' ? cleanup : null;
    return;
  }
  renderNotFound();
}

export function initRouter(): void {
  const root = document.getElementById('root');
  if (!root) return;
  mountLayout(root);
  window.addEventListener('hashchange', dispatch);
  if (!window.location.hash) {
    window.location.hash = '#/';
    return;
  }
  dispatch();
}

export function navigateTo(path: string): void {
  window.location.hash = path;
}
