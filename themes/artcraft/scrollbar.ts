/**
 * Custom right-edge vertical ruler scrollbar for the artcraft theme.
 * Fixed dashes every 5% of scroll range. Blue current position dash with glow.
 * Only visible (via CSS) when #menu-header is visible (non-portrait layout).
 * Native scrollbars are hidden by matching CSS rules only in that mode.
 */

const SCROLLBAR_ID = 'artcraft-scrollbar';

let rafId: number | null = null;
let lastProgress = -1;
let dragging = false;
let dragPointerId: number | null = null;
let hovering = false;

function createElement(tag: string, className: string): HTMLElement {
  const el = document.createElement(tag);
  el.className = className;
  return el;
}

function getScrollInfo() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  const scrollH = doc.scrollHeight;
  const clientH = doc.clientHeight;
  const max = Math.max(1, scrollH - clientH);
  const progress = Math.max(0, Math.min(1, scrollTop / max));
  const percent = Math.round(progress * 100);
  return { progress, percent, scrollTop };
}

function getHeaderOffset(): number {
  const header = document.getElementById('menu-header');
  let headerH = 0;
  if (header) {
    headerH = header.getBoundingClientRect().height || header.offsetHeight || 0;
  }
  if (headerH <= 0) {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--menu-header-height')
      .trim();
    if (v) {
      const num = parseFloat(v);
      if (v.endsWith('rem')) headerH = num * 16;
      else if (v.endsWith('vh')) headerH = (num * window.innerHeight) / 100;
      else if (v.endsWith('px')) headerH = num;
      else headerH = num;
    }
  }
  // Small gap so the full "0" label (with its translateY) is visible below header.
  const GAP = 8;
  return Math.max(0, headerH) + GAP;
}

function getDocumentRulerSpan(): number {
  const start = getHeaderOffset();
  const doc = document.documentElement;
  // Bottom gap so the 100 label (with its translateY) is fully visible, symmetric to the top gap for 0.
  const BOTTOM_GAP = 8;
  return Math.max(1, doc.scrollHeight - start - BOTTOM_GAP);
}

function getPreviewListContainer(): HTMLElement | null {
  return (
    document.getElementById('projects-list') ||
    document.getElementById('blog-list') ||
    document.getElementById('readings-list')
  );
}

/** Temporarily force a specific transition duration on the grey markers. */
function setMarkerTransition(root: HTMLElement, durationMs: number): void {
  const ms = `${durationMs}ms`;
  root.querySelectorAll<HTMLElement>('.as-dash, .as-num').forEach((el) => {
    el.style.transition = `top ${ms} cubic-bezier(0.22, 1, 0.36, 1)`;
  });
}

function computeVisibleYear(): { text: string; frac: number } | null {
  const list = getPreviewListContainer();
  if (!list) return null;

  const cards = Array.from(list.querySelectorAll<HTMLAnchorElement>('a'));
  if (cards.length === 0) return null;

  const viewportTop = 0;
  const viewportBottom = window.innerHeight;
  const visible: { docTop: number; year: number }[] = [];

  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    if (rect.bottom > viewportTop && rect.top < viewportBottom) {
      const h5 = card.querySelector('h5');
      const dateStr = (h5 && h5.textContent) || '';
      const m = dateStr.match(/(\d{4})/);
      if (m && m[1]) {
        const y = parseInt(m[1], 10);
        const docTop = rect.top + getCurrentScroll();
        visible.push({ docTop, year: y });
      }
    }
  }

  if (visible.length === 0) return null;

  const years = visible.map((v) => v.year);
  const uniq = [...new Set(years)];
  const displayYear = uniq.length === 1 ? uniq[0] : Math.max(...years);

  // Position based on the topmost visible card mapped into the ruler span.
  visible.sort((a, b) => a.docTop - b.docTop);
  const focusY = visible[0]!.docTop;

  const start = getHeaderOffset();
  const span = getDocumentRulerSpan();
  let frac = (focusY - start) / Math.max(1, span);
  frac = Math.max(0, Math.min(1, frac));

  return { text: String(displayYear), frac };
}

function getVisibleRulerSpan(): number {
  const start = getHeaderOffset();
  return Math.max(1, window.innerHeight - start);
}

/** Small fixed buffer (px) so 0/100 labels remain fully visible when grey markers
 *  are restretched across viewport height during hover. */
const HOVER_LABEL_BUFFER = 10;

function getHoverRulerSpan(): number {
  const start = getHeaderOffset();
  return Math.max(1, window.innerHeight - start - HOVER_LABEL_BUFFER * 2);
}

function hoverTopForFraction(f: number): number {
  const start = getHeaderOffset();
  return start + HOVER_LABEL_BUFFER + f * getHoverRulerSpan();
}

/** Map fraction [0,1] to a top pixel value inside the scrollbar container.
 *  Non-hover: returns position relative to current document scroll (markers move with content).
 *  Hover: returns fixed position on the viewport-height ruler (buffered). */
function rulerTopForFraction(f: number, scrollTop: number): number {
  if (hovering) {
    return hoverTopForFraction(f);
  }
  return documentTopForFraction(f) - scrollTop;
}

function documentTopForFraction(f: number): number {
  return getHeaderOffset() + f * getDocumentRulerSpan();
}

function visibleTopForFraction(f: number): number {
  return getHeaderOffset() + f * getVisibleRulerSpan();
}

function contentFitsViewport(): boolean {
  const doc = document.documentElement;
  return doc.scrollHeight <= doc.clientHeight + 1;
}

function getCurrentScroll(): number {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function getViewportFraction(): number {
  const doc = document.documentElement;
  const scrollH = doc.scrollHeight;
  const clientH = doc.clientHeight;
  const max = Math.max(1, scrollH - clientH);
  return Math.max(0, Math.min(1, clientH / max));
}

function applyScrollToFraction(root: HTMLElement, f: number): void {
  f = Math.max(0, Math.min(1, f));

  const doc = document.documentElement;
  const maxScroll = Math.max(1, doc.scrollHeight - doc.clientHeight);
  const targetScrollTop = f * maxScroll;

  window.scrollTo(0, targetScrollTop);

  lastProgress = f;

  updateGreyRuler(root, targetScrollTop);
  updateYearLabel(root);

  // Blue/percent follow the same ruler logic as grey marks when hovered.
  const topPx = hovering
    ? `${hoverTopForFraction(f)}px`
    : `${visibleTopForFraction(f)}px`;

  const currentEl = root.querySelector<HTMLElement>('.as-current');
  if (currentEl) {
    currentEl.style.top = topPx;
  }

  const pctEl = root.querySelector<HTMLElement>('.as-percent');
  if (pctEl) {
    pctEl.style.top = topPx;
    pctEl.style.transform = 'translateY(0.4375rem)';
    const num = String(Math.round(f * 100)).padStart(3, '0');
    pctEl.textContent = num + '%';
  }

  updateRange(root);
}

function updateGreyRuler(root: HTMLElement, scrollTop: number): void {
  // While hovered the grey markers are fixed on the viewport ruler (restretched).
  // Do not move them with scroll during hover.
  if (hovering) return;

  root.querySelectorAll<HTMLElement>('.as-dash, .as-num').forEach((el) => {
    const fStr = el.dataset.f;
    if (fStr == null) return;
    const f = parseFloat(fStr);
    if (isNaN(f)) return;
    el.style.top = `${rulerTopForFraction(f, scrollTop)}px`;
  });
}

/** Build the 5% ruler: long dashes + labels at 0,5,10,...,100; short dashes at 2.5,7.5,...
 *  Non-hover: positions are document-space relative to scroll (markers travel with content).
 *  Hover: positions are computed against the viewport-height ruler (restretched 0-100).
 */
function buildRuler(container: HTMLElement): void {
  container.querySelectorAll('.as-dash, .as-num').forEach((el) => el.remove());

  const scrollTop = getCurrentScroll();

  for (let p = 0; p <= 100; p += 5) {
    const f = p / 100;
    const dash = createElement('div', 'as-dash as-dash-long');
    dash.dataset.f = String(f);
    dash.style.top = `${rulerTopForFraction(f, scrollTop)}px`;
    container.appendChild(dash);

    const num = createElement('div', 'as-num');
    num.dataset.f = String(f);
    num.style.top = `${rulerTopForFraction(f, scrollTop)}px`;
    num.textContent = String(p);
    container.appendChild(num);
  }

  for (let p = 2.5; p < 100; p += 5) {
    const f = p / 100;
    const dash = createElement('div', 'as-dash as-dash-short');
    dash.dataset.f = String(f);
    dash.style.top = `${rulerTopForFraction(f, scrollTop)}px`;
    container.appendChild(dash);
  }
}

function updateYearLabel(root: HTMLElement): void {
  const yl = root.querySelector<HTMLElement>('.as-year');
  if (!yl) return;

  const y = computeVisibleYear();
  if (!y) {
    yl.textContent = '';
    yl.style.top = '';
    return;
  }
  yl.textContent = y.text;
  // Year label follows the same ruler as blue/range: viewport ruler on hover.
  yl.style.top = hovering
    ? `${hoverTopForFraction(y.frac)}px`
    : `${visibleTopForFraction(y.frac)}px`;
}

function updateRange(root: HTMLElement): void {
  const fill = root.querySelector<HTMLElement>('.as-range-fill');
  const topL = root.querySelector<HTMLElement>('.as-range-top');
  const botL = root.querySelector<HTMLElement>('.as-range-bottom');
  if (!fill || !topL || !botL) return;

  const info = getScrollInfo();
  const fits = contentFitsViewport();
  const progress = fits ? 1 : info.progress;
  let vFrac = fits ? 1 : getViewportFraction();

  let topF: number;
  let botF: number;

  if (fits) {
    topF = 0;
    botF = 1;
  } else {
    topF = progress - vFrac / 2;
    botF = progress + vFrac / 2;

    if (topF < 0) {
      const shift = -topF;
      topF = 0;
      botF = Math.min(1, botF + shift);
    }
    if (botF > 1) {
      const shift = botF - 1;
      botF = 1;
      topF = Math.max(0, topF - shift);
    }
  }

  // When hovered, the grey markers occupy a viewport-height ruler (buffered).
  // The range (3 lines + fill) must be placed inside that same ruler.
  const topPx = hovering
    ? `${hoverTopForFraction(topF)}px`
    : `${visibleTopForFraction(topF)}px`;
  const botPx = hovering
    ? `${hoverTopForFraction(botF)}px`
    : `${visibleTopForFraction(botF)}px`;

  const topVal = hovering ? hoverTopForFraction(topF) : visibleTopForFraction(topF);
  const botVal = hovering ? hoverTopForFraction(botF) : visibleTopForFraction(botF);
  const h = Math.max(1, botVal - topVal);
  const heightPx = `${h}px`;

  topL.style.top = topPx;
  botL.style.top = botPx;
  fill.style.top = topPx;
  fill.style.height = heightPx;
}

function update(root: HTMLElement): void {
  const info = getScrollInfo();
  const progress = info.progress;
  const fits = contentFitsViewport();
  const displayProgress = fits ? 1 : progress;

  // Grey ruler marks: non-hover move with content; hover restretches across viewport ruler.
  updateGreyRuler(root, info.scrollTop);

  updateYearLabel(root);
  updateRange(root);

  if (Math.abs(displayProgress - lastProgress) < 0.0005) {
    return;
  }
  lastProgress = displayProgress;

  // Blue current and percent use the same ruler as the grey markers when hovered.
  const topPx = hovering
    ? `${hoverTopForFraction(displayProgress)}px`
    : `${visibleTopForFraction(displayProgress)}px`;

  const current = root.querySelector<HTMLElement>('.as-current');
  if (current) {
    current.style.top = topPx;
  }

  const pctEl = root.querySelector<HTMLElement>('.as-percent');
  if (pctEl) {
    pctEl.style.top = topPx;
    pctEl.style.transform = 'translateY(0.4375rem)';
    const num = String(info.percent).padStart(3, '0');
    pctEl.textContent = num + '%';
  }
}

function scheduleUpdate(root: HTMLElement): void {
  if (rafId !== null) return;
  rafId = window.requestAnimationFrame(() => {
    rafId = null;
    update(root);
  });
}

export function bindArtcraftScrollbar(): () => void {
  if (document.getElementById(SCROLLBAR_ID)) {
    return () => {
      /* noop */
    };
  }

  const root = createElement('div', 'artcraft-scrollbar');
  root.id = SCROLLBAR_ID;
  root.setAttribute('aria-hidden', 'true');

  buildRuler(root);

  // Blue current indicator (dash + animated glow above/below)
  const current = createElement('div', 'as-current');
  const glow = createElement('div', 'as-glow');
  const curDash = createElement('div', 'as-dash-current');
  current.append(glow, curDash);
  root.appendChild(current);

  // Current scroll percentage (placed beneath blue dash by update)
  const percent = createElement('div', 'as-percent');
  percent.textContent = '000%';
  root.appendChild(percent);

  // Year label (dynamic, only on project/blog/reading preview lists)
  const yearLabel = createElement('div', 'as-year');
  yearLabel.textContent = '';
  root.appendChild(yearLabel);

  // Hover-activated viewport range decoration: translucent fill + top/bottom boundary lines.
  // Only visible on hover over the scrollbar area. Positioned/updated in updateRange.
  const rangeFill = createElement('div', 'as-range-fill');
  const rangeTop = createElement('div', 'as-range-top');
  const rangeBottom = createElement('div', 'as-range-bottom');
  root.append(rangeFill, rangeTop, rangeBottom);

  document.body.appendChild(root);

  // Enable clicks/taps on the ruler area (CSS defaults to none so it does not
  // intercept normal content interaction). Wheel/scroll over the area remains
  // non-interfering because the element itself does not scroll.
  root.style.pointerEvents = 'auto';

  const onScroll = (): void => {
    scheduleUpdate(root);
  };
  const onResize = (): void => {
    buildRuler(root);
    scheduleUpdate(root);
  };

  const onPointerDown = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // Disable slow transition so range lines track the blue line immediately during drag.
    const rangeEls = root.querySelectorAll<HTMLElement>('.as-range-fill, .as-range-top, .as-range-bottom');
    rangeEls.forEach((el) => {
      el.style.transition = 'none';
    });

    const start = getHeaderOffset();
    const visSpan = getVisibleRulerSpan();
    let f = (e.clientY - start) / Math.max(1, visSpan);
    f = Math.max(0, Math.min(1, f));

    applyScrollToFraction(root, f);

    dragging = true;
    dragPointerId = e.pointerId;
    root.setPointerCapture(e.pointerId);

    if (!hovering) {
      hovering = true;
      root.classList.add('is-hovering');
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!dragging || dragPointerId !== e.pointerId) return;

    const start = getHeaderOffset();
    const visSpan = getVisibleRulerSpan();
    let f = (e.clientY - start) / Math.max(1, visSpan);
    f = Math.max(0, Math.min(1, f));

    applyScrollToFraction(root, f);
  };

  const onPointerUp = (e: PointerEvent): void => {
    if (!dragging || dragPointerId !== e.pointerId) return;

    dragging = false;
    dragPointerId = null;
    try {
      root.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    // Restore the slow transition for hover enter/leave animations.
    const rangeEls = root.querySelectorAll<HTMLElement>('.as-range-fill, .as-range-top, .as-range-bottom');
    rangeEls.forEach((el) => {
      el.style.transition = '';
    });
  };

  const onPointerLeave = (e: PointerEvent): void => {
    // End drag if pointer leaves while dragging (touch or mouse).
    if (dragging && dragPointerId === e.pointerId) {
      dragging = false;
      dragPointerId = null;
      try {
        root.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  const onPointerEnter = (): void => {
    hovering = true;
    root.classList.add('is-hovering');

    // Apply the 2500ms transition to the existing markers.
    setMarkerTransition(root, 2500);

    // Update existing markers in place (do not rebuild).
    const scrollTop = getCurrentScroll();
    root.querySelectorAll<HTMLElement>('.as-dash, .as-num').forEach((el) => {
      const fStr = el.dataset.f;
      if (fStr == null) return;
      const f = parseFloat(fStr);
      if (isNaN(f)) return;
      el.style.top = `${rulerTopForFraction(f, scrollTop)}px`;
    });

    const info = getScrollInfo();
    const fits = contentFitsViewport();
    const displayF = fits ? 1 : info.progress;

    const topPx = `${hoverTopForFraction(displayF)}px`;
    const currentEl = root.querySelector<HTMLElement>('.as-current');
    if (currentEl) currentEl.style.top = topPx;
    const pctEl = root.querySelector<HTMLElement>('.as-percent');
    if (pctEl) {
      pctEl.style.top = topPx;
      pctEl.style.transform = 'translateY(0.4375rem)';
      const num = String(info.percent).padStart(3, '0');
      pctEl.textContent = num + '%';
    }

    updateRange(root);
  };

  const onPointerLeaveHover = (): void => {
    // Apply the 3000ms transition before changing positions.
    setMarkerTransition(root, 2500);

    // Update existing markers in place so they animate back out.
    const scrollTop = getCurrentScroll();
    root.querySelectorAll<HTMLElement>('.as-dash, .as-num').forEach((el) => {
      const fStr = el.dataset.f;
      if (fStr == null) return;
      const f = parseFloat(fStr);
      if (isNaN(f)) return;
      el.style.top = `${rulerTopForFraction(f, scrollTop)}px`;
    });

    setTimeout(() => {
      hovering = false;
      root.classList.remove('is-hovering');
      root.querySelectorAll<HTMLElement>('.as-dash, .as-num').forEach((el) => {
        el.style.transition = '';
      });
      scheduleUpdate(root);
    }, 2500);
  };

  // Initial paint
  update(root);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointerleave', onPointerLeave);
  root.addEventListener('pointerenter', onPointerEnter);
  root.addEventListener('pointerleave', onPointerLeaveHover);

  const outlet = document.getElementById('outlet') || document.body;
  const mo = new MutationObserver(() => {
    buildRuler(root);
    scheduleUpdate(root);
  });
  mo.observe(outlet, { childList: true, subtree: true });

  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    root.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('pointermove', onPointerMove);
    root.removeEventListener('pointerup', onPointerUp);
    root.removeEventListener('pointerleave', onPointerLeave);
    root.removeEventListener('pointerenter', onPointerEnter);
    root.removeEventListener('pointerleave', onPointerLeaveHover);
    mo.disconnect();
    root.remove();
    dragging = false;
    dragPointerId = null;
    hovering = false;
    lastProgress = -1;
  };
}
