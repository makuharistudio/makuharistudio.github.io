import { getTheme, getAccent, toggleTheme, onThemeChange } from '../library/theme.ts';

export function ThemeToggle(): HTMLElement {
  const btn = document.createElement('button');
  btn.id = 'theme-toggle';
  btn.type = 'button';

  const img = document.createElement('img');
  img.alt = '';
  btn.appendChild(img);

  const paint = (): void => {
    const dark = getTheme() === 'dark';
    img.src = getAccent().toggle;
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  paint();

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    toggleTheme();
  });
  onThemeChange(paint);
  return btn;
}
