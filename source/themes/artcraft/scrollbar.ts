/**
 * Custom right-edge vertical ruler scrollbar for the artcraft theme.
 * Fixed dashes every 5% of scroll range. Blue current position dash with glow.
 * Only visible (via CSS) when #menu-header is visible (non-portrait layout).
 * Native scrollbars are hidden by matching CSS rules only in that mode.
 */

const SCROLLBAR_ID = 'artcraft-scrollbar';

let rafId: number | null = null;
let lastProgress = -1;

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

function updateGreyRuler(root: HTMLElement, scrollTop: number): void {
  root.querySelectorAll<HTMLElement>('.as-dash, .as-num').forEach((el) => {
    const fStr = el.dataset.f;
    if (fStr == null) return;
    const f = parseFloat(fStr);
    if (isNaN(f)) return;
    el.style.top = `${documentTopForFraction(f) - scrollTop}px`;
  });
}

/** Build the 5% ruler: long dashes + labels at 0,5,10,...,100; short dashes at 2.5,7.5,...
 *  Positions are computed in document space (so 0-100 span the full scroll range after header offset).
 *  When attached, they are placed relative to the current scroll so the ruler travels with the content.
 */
function buildRuler(container: HTMLElement): void {
  // Remove any previous ruler marks (dashes, numbers) so we can rebuild on resize/content change.
  container.querySelectorAll('.as-dash, .as-num').forEach((el) => el.remove());

  const scrollTop = getCurrentScroll();

  // Long dashes and numbers every 5%
  for (let p = 0; p <= 100; p += 5) {
    const f = p / 100;
    const dash = createElement('div', 'as-dash as-dash-long');
    dash.dataset.f = String(f);
    dash.style.top = `${documentTopForFraction(f) - scrollTop}px`;
    container.appendChild(dash);

    const num = createElement('div', 'as-num');
    num.dataset.f = String(f);
    num.style.top = `${documentTopForFraction(f) - scrollTop}px`;
    num.textContent = String(p);
    container.appendChild(num);
  }

  // Short dashes (half length) at the intermediate 2.5% offsets
  for (let p = 2.5; p < 100; p += 5) {
    const f = p / 100;
    const dash = createElement('div', 'as-dash as-dash-short');
    dash.dataset.f = String(f);
    dash.style.top = `${documentTopForFraction(f) - scrollTop}px`;
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
  yl.style.top = `${visibleTopForFraction(y.frac)}px`;
}

function update(root: HTMLElement): void {
  const info = getScrollInfo();
  const progress = info.progress;
  const fits = contentFitsViewport();
  const displayProgress = fits ? 1 : progress;

  // Grey ruler marks must move with the document content on every scroll update.
  updateGreyRuler(root, info.scrollTop);

  // Year label is dynamic and must track scroll even when blue progress is stable.
  updateYearLabel(root);

  if (Math.abs(displayProgress - lastProgress) < 0.0005) {
    return;
  }
  lastProgress = displayProgress;

  // Blue current and % always use the visible viewport ruler span so they stay inside the fixed container.
  const topPx = `${visibleTopForFraction(displayProgress)}px`;

  // Current position blue dash
  const current = root.querySelector<HTMLElement>('.as-current');
  if (current) {
    current.style.top = topPx;
  }

  // Percentage directly beneath the blue dash: 009%
  const pctEl = root.querySelector<HTMLElement>('.as-percent');
  if (pctEl) {
    pctEl.style.top = topPx;
    pctEl.style.transform = 'translateY(7px)';
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
    // Primary button for mouse; all events for touch/pen.
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const clientY = e.clientY;
    const start = getHeaderOffset();
    const visSpan = getVisibleRulerSpan();
    let f = (clientY - start) / Math.max(1, visSpan);
    f = Math.max(0, Math.min(1, f));

    // Map visible-ruler fraction (the area used for blue line and %) to scroll progress.
    // This makes a click at the visual 40% position on the ruler scroll to 40%.
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - doc.clientHeight);
    const targetScrollTop = f * maxScroll;

    window.scrollTo(0, targetScrollTop);

    // Force immediate correct visuals for blue line, glow position, percentage,
    // and ruler marks so feedback matches the clicked position without waiting
    // for the scroll position to be reflected in subsequent rAF/scroll events.
    lastProgress = f;

    updateGreyRuler(root, targetScrollTop);
    updateYearLabel(root);

    const topPx = `${visibleTopForFraction(f)}px`;

    const currentEl = root.querySelector<HTMLElement>('.as-current');
    if (currentEl) {
      currentEl.style.top = topPx;
    }

    const pctEl = root.querySelector<HTMLElement>('.as-percent');
    if (pctEl) {
      pctEl.style.top = topPx;
      pctEl.style.transform = 'translateY(7px)';
      const num = String(Math.round(f * 100)).padStart(3, '0');
      pctEl.textContent = num + '%';
    }
  };

  // Initial paint
  update(root);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  root.addEventListener('pointerdown', onPointerDown);

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
    mo.disconnect();
    root.remove();
    lastProgress = -1;
  };
}
