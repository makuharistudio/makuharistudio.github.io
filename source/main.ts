import { loadTheme, setActiveTheme } from './library/theme.ts';
import { initRouter } from './library/router.ts';
import type { ThemeName } from './library/types.ts';

/** Maintainer setting. Change this const to swap the active theme folder. */
const ACTIVE_THEME: ThemeName = 'space';

function main(): void {
  setActiveTheme(ACTIVE_THEME);
  loadTheme();
  initRouter();
}

main();
