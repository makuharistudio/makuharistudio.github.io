/**
 * Quiet Precision theme pack. CSS and accents live in light/ and dark/.
 * The page wash is CSS; this pack does not mount Earth or city scenes.
 */
import type { ColorMode } from '../../library/types.ts';
import type { ThemeAccent, ThemePack } from '../../library/theme.ts';
import { bindFilterScroll } from './filter-scroll.ts';
import { bindPreviewExpand } from './preview-expand.ts';

const NAME = 'quietprecision';

function accent(mode: ColorMode, file: string): string {
  return `themes/${NAME}/${mode}/accent/${file}`;
}

function assets(mode: ColorMode): ThemeAccent {
  return {
    about: accent(mode, 'menu-button-about-teal.svg'),
    aboutActive: accent(mode, 'menu-button-about-red.svg'),
    project: accent(mode, 'menu-button-project-teal.svg'),
    projectActive: accent(mode, 'menu-button-project-purple.svg'),
    blog: accent(mode, 'menu-button-blog-teal.svg'),
    blogActive: accent(mode, 'menu-button-blog-purple.svg'),
    reading: accent(mode, 'menu-button-reading-teal.svg'),
    readingActive: accent(mode, 'menu-button-reading-blue.svg'),
    game: accent(mode, 'menu-button-game-teal.svg'),
    gameActive: accent(mode, 'menu-button-game-orange.svg'),
    blank: accent(mode, 'menu-button.svg'),
    toggle: mode === 'dark'
      ? accent('dark', 'theme-toggle-sun.svg')
      : accent('light', 'theme-toggle-moon.svg'),
  };
}

export const quietprecisionTheme: ThemePack = {
  name: NAME,
  stylesheet(mode: ColorMode): string {
    return `themes/${NAME}/${mode}/${NAME}-${mode}.css`;
  },
  assets,
  initialiseBackground(_container: HTMLElement, _mode: ColorMode): () => void {
    const stopFilters = bindFilterScroll();
    const stopPreview = bindPreviewExpand();
    return () => {
      stopFilters();
      stopPreview();
    };
  },
};
