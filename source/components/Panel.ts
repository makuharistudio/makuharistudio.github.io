/** Decorative panel. Corner and line art come from the active theme stylesheet. */
export function Panel(children: Node | string): HTMLElement {
  const corners = document.createElement('div');
  corners.className = 'panel-corners';

  for (const name of ['top-left', 'top-right', 'bottom-right', 'bottom-left']) {
    const corner = document.createElement('div');
    corner.className = `panel-corner panel-corner-${name}`;
    corners.appendChild(corner);
  }

  const background = document.createElement('div');
  background.className = 'panel-background';
  const content = document.createElement('div');
  content.className = 'panel-content';
  if (typeof children === 'string') content.textContent = children;
  else content.appendChild(children);
  background.appendChild(content);
  corners.appendChild(background);
  return corners;
}
