import { setOutlet } from '../components/Layout.ts';

export function renderNotFound(): void {
  const wrap = document.createElement('div');
  wrap.append(document.createElement('br'), document.createElement('br'), document.createElement('br'));
  const center = document.createElement('center');
  const h2 = document.createElement('h2');
  h2.textContent = 'Page not found';
  const h4 = document.createElement('h4');
  h4.append('Please double-check the URL or return to the ');
  const u = document.createElement('u');
  const a = document.createElement('a');
  a.href = '#/';
  a.textContent = 'main page';
  u.appendChild(a);
  h4.append(u, '.');
  center.append(h2, h4);
  wrap.appendChild(center);
  setOutlet(wrap);
}
