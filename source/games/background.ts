/**
 * Per-game backdrop for #bg-space.
 * Each game supplies its own initializer. Layout disposes the previous
 * scene (cleanup, nodes, WebGL) before this runs, and again on leave.
 */

function fill(color: string, painter: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): (container: HTMLElement) => () => void {
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
        ctx.fillStyle = color;
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

/** Quiet grid. The game itself is DOM; this only replaces the theme Earth/city. */
export function dualNBackBackground(container: HTMLElement): () => void {
  return fill('#070b14', (ctx, w, h) => {
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
  })(container);
}

/** Soft type-case wash behind the quiz cards. */
export function vocabularyBackground(container: HTMLElement): () => void {
  return fill('#12081c', (ctx, w, h) => {
    const t = Date.now() / 1000;
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, `rgba(167, 139, 250, ${0.08 + 0.04 * Math.sin(t)})`);
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  })(container);
}

/**
 * The rocket and satellite games draw their own WebGL globes inside the page.
 * This initializer only clears the theme scene so two Earths do not run at once.
 */
export function gameSceneBackground(container: HTMLElement): () => void {
  container.style.backgroundColor = '#000';
  return () => {
    container.style.backgroundColor = '';
  };
}
