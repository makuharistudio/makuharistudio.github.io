/**
 * Space theme pack. The only module that knows this theme's folder layout.
 * The loader selects it from the ACTIVE_THEME const in main.ts.
 */
import type { ColorMode } from '../../library/types.ts';
import type { ThemeAccent, ThemePack } from '../../library/theme.ts';
import { initialiseBackground as initCity } from './light/background/scripts/bg-futuristic-city.ts';
import { initialiseBackground as initEarth } from './dark/background/scripts/bg-space-earth.ts';

const NAME = 'space';

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

export const spaceTheme: ThemePack = {
  name: NAME,
  stylesheet(mode: ColorMode): string {
    return `themes/${NAME}/${mode}/${NAME}-${mode}.css`;
  },
  assets,
  initialiseBackground(container: HTMLElement, mode: ColorMode): () => void {
    if (mode === 'light') {
      return initCity(container, `themes/${NAME}/light/background/images`);
    }
    return initEarth(container, `themes/${NAME}/dark/background/images`);
  },
};
