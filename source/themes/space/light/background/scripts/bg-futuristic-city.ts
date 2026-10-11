/**
 * Light-theme scrolling city. Ported from the old bg-futuristic-city.js.
 */
const CITY_FILE = 'bg-xAI-futuristic-city-593738ab.jpg';
const IMAGE_ASPECT = 1600 / 720;
const SCROLL_SPEED = 25;
const GRID_SCROLL_RATIO = 0.5;
const GRID_LINE_OPACITY = 0.45;
const LANDSCAPE_LAYER_WIDTH_RATIO = 0.4;
const FRAME_GAP_RATIO = 0.025;
const GRID_CELL_RATIO = 0.05;
const FRAME_FADE_RATIO = 0.03;

const GRID_LINE_COLOR = `rgba(255, 255, 255, ${GRID_LINE_OPACITY})`;
const GRID_BACKGROUND = `linear-gradient(to right, ${GRID_LINE_COLOR} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE_COLOR} 1px, transparent 1px)`;

interface MiniMetrics {
  left: number;
  top: number;
  width: number;
  height: number;
  cellSize: number;
  fadeSize: number;
}

function getMiniViewportMetrics(viewportWidth: number, viewportHeight: number): MiniMetrics {
  const isLandscape = viewportWidth > viewportHeight;
  if (isLandscape) {
    const gap = viewportWidth * FRAME_GAP_RATIO;
    return {
      gap,
      fadeSize: viewportWidth * FRAME_FADE_RATIO,
      cellSize: viewportWidth * GRID_CELL_RATIO,
      left: gap,
      top: gap,
      width: viewportWidth * LANDSCAPE_LAYER_WIDTH_RATIO,
      height: viewportHeight - 2 * gap,
    } as MiniMetrics;
  }
  const gap = viewportHeight * FRAME_GAP_RATIO;
  return {
    fadeSize: viewportHeight * FRAME_FADE_RATIO,
    cellSize: viewportHeight * GRID_CELL_RATIO,
    left: gap,
    top: gap,
    width: viewportWidth - 2 * gap,
    height: viewportHeight - 2 * gap,
  };
}

function applyGridEdgeFade(gridLayer: HTMLElement, fadeSize: number): void {
  if (fadeSize <= 0) {
    gridLayer.style.maskImage = '';
    return;
  }
  const fade = `${fadeSize}px`;
  const mask = `linear-gradient(to right, transparent 0, black ${fade}, black calc(100% - ${fade}), transparent 100%), linear-gradient(to bottom, transparent 0, black ${fade}, black calc(100% - ${fade}), transparent 100%)`;
  gridLayer.style.maskImage = mask;
  gridLayer.style.setProperty('-webkit-mask-image', mask);
  gridLayer.style.maskComposite = 'intersect';
  gridLayer.style.setProperty('-webkit-mask-composite', 'source-in');
}

/** A few pixels means the stylesheet has not given #bg-space its viewport size yet. */
const MIN_LAID_OUT = 50;

function viewportSize(container: HTMLElement): { width: number; height: number; ready: boolean } {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const ready = width >= MIN_LAID_OUT && height >= MIN_LAID_OUT;
  return {
    ready,
    width: ready ? width : Math.max(window.innerWidth, 1),
    height: ready ? height : Math.max(window.innerHeight, 1),
  };
}

function applyMiniViewportLayout(container: HTMLElement, miniViewport: HTMLElement, gridLayer: HTMLElement): number {
  const viewport = viewportSize(container);
  const metrics = getMiniViewportMetrics(viewport.width, viewport.height);
  miniViewport.style.left = `${metrics.left}px`;
  miniViewport.style.top = `${metrics.top}px`;
  miniViewport.style.width = `${Math.max(0, metrics.width)}px`;
  miniViewport.style.height = `${Math.max(0, metrics.height)}px`;
  gridLayer.style.backgroundSize = `${metrics.cellSize}px ${metrics.cellSize}px`;
  applyGridEdgeFade(gridLayer, metrics.fadeSize);
  return metrics.cellSize;
}

export function initialiseBackground(container: HTMLElement, imageBase: string): () => void {
  const cityLayer = document.createElement('div');
  cityLayer.style.position = 'absolute';
  cityLayer.style.inset = '0';
  cityLayer.style.backgroundImage = `url(${imageBase}/${CITY_FILE})`;
  cityLayer.style.backgroundRepeat = 'repeat-x';
  cityLayer.style.backgroundPosition = '0 0';
  container.appendChild(cityLayer);

  const overlayLayer = document.createElement('div');
  overlayLayer.style.position = 'absolute';
  overlayLayer.style.inset = '0';
  overlayLayer.style.backgroundColor = '#eef6fc';
  overlayLayer.style.opacity = '0.8';
  overlayLayer.style.pointerEvents = 'none';
  container.appendChild(overlayLayer);

  const miniViewport = document.createElement('div');
  miniViewport.style.position = 'absolute';
  miniViewport.style.overflow = 'hidden';
  miniViewport.style.pointerEvents = 'none';
  container.appendChild(miniViewport);

  const gridLayer = document.createElement('div');
  gridLayer.style.position = 'absolute';
  gridLayer.style.inset = '0';
  gridLayer.style.backgroundImage = GRID_BACKGROUND;
  gridLayer.style.backgroundRepeat = 'repeat';
  gridLayer.style.backgroundColor = 'transparent';
  miniViewport.appendChild(gridLayer);

  let cellSize = 0;
  let tileWidth = 0;
  let laidOutWidth = -1;
  let laidOutHeight = -1;
  let cityOffset = 0;
  let gridOffsetX = 0;
  let gridOffsetY = 0;
  let lastTime = 0;
  let animationId = 0;
  let stopped = false;
  const gridSpeed = SCROLL_SPEED * GRID_SCROLL_RATIO;

  const updateCityBackgroundSize = (): void => {
    const viewport = viewportSize(container);
    tileWidth = Math.max(10, viewport.height * IMAGE_ASPECT);
    // A percentage height is resolved against the element's own height, which
    // is still 0 when a new tab paints this layer. A pixel height matches the
    // container, so the tile is correct on the first frame.
    cityLayer.style.backgroundSize = `${tileWidth}px ${viewport.height}px`;
  };

  const layout = (): void => {
    const viewport = viewportSize(container);
    if (viewport.ready && viewport.width === laidOutWidth && viewport.height === laidOutHeight) return;
    // Do not lock a fallback size. The next frame replaces it once the
    // container actually has the viewport size.
    laidOutWidth = viewport.ready ? viewport.width : -1;
    laidOutHeight = viewport.ready ? viewport.height : -1;
    cellSize = applyMiniViewportLayout(container, miniViewport, gridLayer);
    updateCityBackgroundSize();
  };
  layout();

  const animate = (time: number): void => {
    if (stopped) return;
    // The first frames of a new tab can report a tiny container. Measuring
    // again here corrects the tile before those strips stay on screen.
    layout();
    if (lastTime === 0) lastTime = time;
    const delta = (time - lastTime) * 0.001;
    lastTime = time;
    cityOffset += SCROLL_SPEED * delta;
    cityLayer.style.backgroundPosition = `${-cityOffset}px 0`;
    if (cellSize > 0) {
      const gridDelta = gridSpeed * delta;
      gridOffsetX = (gridOffsetX + gridDelta) % cellSize;
      gridOffsetY = (gridOffsetY + gridDelta) % cellSize;
      gridLayer.style.backgroundPosition = `${gridOffsetX}px ${gridOffsetY}px`;
    }
    animationId = requestAnimationFrame(animate);
  };

  const handleResize = (): void => {
    layout();
  };

  // A new tab can run this before the theme stylesheet gives #bg-space a
  // height. Measuring then locks a few-pixel tile, which paints as vertical
  // strips. ResizeObserver and the first visible frame measure again.
  const resizeObserver = new ResizeObserver(() => {
    layout();
  });
  resizeObserver.observe(container);

  const handleVisibility = (): void => {
    if (document.visibilityState === 'visible') layout();
  };

  animationId = requestAnimationFrame(animate);
  window.addEventListener('resize', handleResize);
  document.addEventListener('visibilitychange', handleVisibility);
  requestAnimationFrame(() => {
    layout();
  });

  return () => {
    stopped = true;
    resizeObserver.disconnect();
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibility);
    cancelAnimationFrame(animationId);
    for (const el of [miniViewport, overlayLayer, cityLayer]) {
      if (el.parentNode === container) container.removeChild(el);
    }
  };
}
