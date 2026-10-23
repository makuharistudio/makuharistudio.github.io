/**
 * Per-game backdrop for #bg-space.
 * Each game supplies its own initializer. Layout disposes the previous
 * scene (cleanup, nodes, WebGL) before this runs, and again on leave.
 */
import { getThemeName } from '../library/theme.ts';

function cssVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function fill(painter: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): (container: HTMLElement) => () => void {
  return (container) => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let frame = 0;
    const draw = (): void => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (ctx) {
        ctx.fillStyle = cssVar('--content-background', '#070b14');
        ctx.fillRect(0, 0, w, h);
        painter(ctx, w, h);
      }
    };
    const onResize = (): void => {
      draw();
    };
    draw();
    frame = window.requestAnimationFrame(function tick() {
      draw();
      frame = window.requestAnimationFrame(tick);
    });
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      canvas.remove();
    };
  };
}

/** Quiet Precision uses the theme page wash. Space keeps the drifting grid. */
export function dualNBackBackground(container: HTMLElement): () => void {
  if (getThemeName() === 'quietprecision') {
    return () => {
      /* Theme CSS already paints #bg-space. */
    };
  }
  return fill((ctx, w, h) => {
    ctx.save();
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
    ctx.lineWidth = 1;
    const gap = 48;
    const drift = (Date.now() / 40) % gap;
    for (let x = -gap + drift; x < w; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  })(container);
}

/** Quiet Precision uses the theme page wash. Space keeps the type-case wash. */
export function vocabularyBackground(container: HTMLElement): () => void {
  if (getThemeName() === 'quietprecision') {
    return () => {
      /* Theme CSS already paints #bg-space. */
    };
  }
  return fill((ctx, w, h) => {
    const t = Date.now() / 1000;
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, cssVar('--accent-soft', 'rgba(167, 139, 250, 0.12)'));
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grd;
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t);
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  })(container);
}

/**
 * The rocket and satellite games draw their own WebGL globes inside the page.
 * This initializer only clears the theme scene so two Earths do not run at once.
 */
export function gameSceneBackground(container: HTMLElement): () => void {
  const apply = (): void => {
    container.style.backgroundColor = cssVar('--content-background', '#000');
  };
  apply();
  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => {
    observer.disconnect();
    container.style.backgroundColor = '';
  };
}
