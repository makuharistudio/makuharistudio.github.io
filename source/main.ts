import { loadTheme } from './library/theme.ts';
import { initRouter } from './library/router.ts';

function main(): void {
  loadTheme();
  initRouter();
}

main();
