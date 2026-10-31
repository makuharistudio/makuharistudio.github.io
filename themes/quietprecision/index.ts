/**
 * Quiet Precision theme pack. CSS and accents live in light/ and dark/.
 * The page wash is CSS; this pack does not mount Earth or city scenes.
 *
 * Menu visuals use only two images (names reflect content):
 *   menu-button.svg (base)
 *   menu-button-hover.svg (plain circle - used for idle)
 *   menu-button-active.svg (circle with centre dot - used for active)
 * All menu items share the same two images. Footer classes are provided here
 * so components stay agnostic to any theme's naming.
 */
import type { ColorMode } from '../../library/types.ts';
import type { ThemeAccent, ThemePack } from '../../library/theme.ts';
import type { MenuSpec } from '../../library/types.ts';
import { bindFilterScroll } from './filter-scroll.ts';
import { bindPreviewExpand } from './preview-expand.ts';

const NAME = 'quietprecision';

function accent(mode: ColorMode, file: string): string {
  return `themes/${NAME}/${mode}/accent/${file}`;
}

function assets(mode: ColorMode): ThemeAccent {
  // Uniform images for all sections. Filenames describe visual content (object-colour).
  // menu-button-circle-navy.svg: plain circle (idle)
  // menu-button-circle-navy-active.svg: circle with centre dot (active/selected)
  const idle = accent(mode, 'menu-button-circle-navy.svg');
  const active = accent(mode, 'menu-button-circle-navy-active.svg');
  return {
    about: idle,
    aboutActive: active,
    project: idle,
    projectActive: active,
    blog: idle,
    blogActive: active,
    reading: idle,
    readingActive: active,
    game: idle,
    gameActive: active,
    blank: accent(mode, 'menu-button.svg'),
    toggle: mode === 'dark'
      ? accent('dark', 'theme-toggle-sun.svg')
      : accent('light', 'theme-toggle-moon.svg'),
  };
}

/** Intermediary menu config for this theme. Components receive only icon keys + footer classes from here. */
function menuSpecs(_mode: ColorMode): MenuSpec[] {
  return [
    {
      hash: '#/',
      label: 'ABOUT',
      match: (path) => path === '/' || path === '',
      iconKey: 'about',
      footerLight: 'menu-footer-light-highlight-teal',
      footerLightActive: 'menu-footer-light-highlight-red',
    },
    {
      hash: '#/projects',
      label: 'PROJECT',
      match: (path) => path.includes('/project'),
      iconKey: 'project',
      footerLight: 'menu-footer-light-highlight-teal',
      footerLightActive: 'menu-footer-light-highlight-purple',
    },
    {
      hash: '#/blog',
      label: 'BLOG',
      match: (path) => path.includes('/blog'),
      iconKey: 'blog',
      footerLight: 'menu-footer-light-highlight-teal',
      footerLightActive: 'menu-footer-light-highlight-purple',
    },
    {
      hash: '#/readings',
      label: 'READING',
      match: (path) => path.includes('/reading'),
      iconKey: 'reading',
      footerLight: 'menu-footer-light-highlight-teal',
      footerLightActive: 'menu-footer-light-highlight-blue',
    },
    {
      hash: '#/games',
      label: 'GAME',
      match: (path) => path.includes('/game'),
      iconKey: 'game',
      footerLight: 'menu-footer-light-highlight-teal',
      footerLightActive: 'menu-footer-light-highlight-orange',
    },
  ];
}

export const quietprecisionTheme: ThemePack = {
  name: NAME,
  stylesheet(mode: ColorMode): string {
    return `themes/${NAME}/${mode}/${NAME}-${mode}.css`;
  },
  assets,
  menuSpecs,
  initialiseBackground(_container: HTMLElement, _mode: ColorMode): () => void {
    const stopFilters = bindFilterScroll();
    const stopPreview = bindPreviewExpand();
    return () => {
      stopFilters();
      stopPreview();
    };
  },
};
