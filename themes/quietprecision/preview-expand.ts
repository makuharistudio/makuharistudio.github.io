/**
 * After a 3s hover on a project, blog, or game preview, expand its image
 * to the largest size that fits the current viewport while keeping aspect
 * ratio. The overlay is position:fixed, so it stays centred even if the
 * page is scrolled. Click or tap the enlarged image to close it.
 */

const HOVER_MS = 3000;
const CARD_SELECTOR = '#projects-list > a, #blog-list > a, #games-list > a';
const OVERLAY_CLASS = 'qp-preview-expand';

function bindCard(card: HTMLElement, open: (img: HTMLImageElement) => void): () => void {
  let timer = 0;

  const clear = (): void => {
    if (timer === 0) return;
    window.clearTimeout(timer);
    timer = 0;
  };

  const onEnter = (): void => {
    if (document.querySelector(`.${OVERLAY_CLASS}`)) return;
    clear();
    timer = window.setTimeout(() => {
      timer = 0;
      const img = card.querySelector('img');
      if (!(img instanceof HTMLImageElement)) return;
      if (!(img.currentSrc || img.src)) return;
      open(img);
    }, HOVER_MS);
  };

  card.addEventListener('pointerenter', onEnter);
  card.addEventListener('pointerleave', clear);

  return () => {
    clear();
    card.removeEventListener('pointerenter', onEnter);
    card.removeEventListener('pointerleave', clear);
  };
}

/** Watch project, blog, and game cards for a long hover. Returns a disposer. */
export function bindPreviewExpand(): () => void {
  const cleanups = new Map<HTMLElement, () => void>();
  let overlay: HTMLElement | null = null;
  let previousOverflow = '';
  let stopFit: (() => void) | null = null;

  const closeOverlay = (): void => {
    if (stopFit) {
      stopFit();
      stopFit = null;
    }
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.body.style.overflow = previousOverflow;
  };

  const fitImage = (img: HTMLImageElement): void => {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;
    const scale = Math.min(window.innerWidth / nw, window.innerHeight / nh);
    img.style.width = `${nw * scale}px`;
    img.style.height = `${nh * scale}px`;
  };

  const openOverlay = (source: HTMLImageElement): void => {
    closeOverlay();
    previousOverflow = document.body.style.overflow;
    overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Expanded preview');
    const img = document.createElement('img');
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    const onFit = (): void => {
      fitImage(img);
    };
    img.addEventListener('load', onFit);
    img.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeOverlay();
    });
    window.addEventListener('resize', onFit);
    stopFit = () => {
      window.removeEventListener('resize', onFit);
      img.removeEventListener('load', onFit);
    };
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    if (img.complete) fitImage(img);
  };

  const attachIn = (root: ParentNode): void => {
    const nodes = root.querySelectorAll(CARD_SELECTOR);
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue;
      if (cleanups.has(node)) continue;
      cleanups.set(node, bindCard(node, openOverlay));
    }
  };

  const detachIn = (root: HTMLElement): void => {
    const list: HTMLElement[] = [];
    if (root.matches(CARD_SELECTOR)) list.push(root);
    const nested = root.querySelectorAll(CARD_SELECTOR);
    for (const node of nested) {
      if (node instanceof HTMLElement) list.push(node);
    }
    for (const node of list) {
      const stop = cleanups.get(node);
      if (!stop) continue;
      stop();
      cleanups.delete(node);
    }
  };

  const body = document.body;
  if (!body) {
    return () => {
      /* no-op */
    };
  }

  attachIn(document);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const added of record.addedNodes) {
        if (added instanceof HTMLElement) {
          if (added.matches(CARD_SELECTOR) && !cleanups.has(added)) {
            cleanups.set(added, bindCard(added, openOverlay));
          }
          attachIn(added);
        }
      }
      for (const removed of record.removedNodes) {
        if (removed instanceof HTMLElement) detachIn(removed);
      }
    }
  });
  observer.observe(body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    closeOverlay();
    for (const stop of cleanups.values()) stop();
    cleanups.clear();
  };
}
