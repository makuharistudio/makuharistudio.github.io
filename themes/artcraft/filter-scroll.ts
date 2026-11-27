/**
 * Pointer-drag scrolling for .filter rows. Touch keeps native overflow pan.
 * Capture starts only after the pointer has moved, so a still click reaches the button.
 */

const DRAG_THRESHOLD_PX = 6;

function bindOne(el: HTMLElement): () => void {
  let pointerId: number | null = null;
  let startX = 0;
  let startScroll = 0;
  let dragged = false;

  const onMove = (event: PointerEvent): void => {
    if (pointerId === null || event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    if (!dragged) {
      if (Math.abs(dx) <= DRAG_THRESHOLD_PX) return;
      dragged = true;
      el.classList.add('is-dragging');
    }
    el.scrollLeft = startScroll - dx;
  };

  const onUp = (event: PointerEvent): void => {
    if (pointerId === null || event.pointerId !== pointerId) return;
    pointerId = null;
    el.classList.remove('is-dragging');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
  };

  const onDown = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScroll = el.scrollLeft;
    dragged = false;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const onClick = (event: Event): void => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  };

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('click', onClick, true);

  return () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('click', onClick, true);
    el.classList.remove('is-dragging');
  };
}

/** Watch the page for .filter rows and bind drag-scroll. Returns a disposer. */
export function bindFilterScroll(): () => void {
  const cleanups = new Map<HTMLElement, () => void>();

  const attachIn = (root: ParentNode): void => {
    const nodes = root.querySelectorAll('.filter');
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue;
      if (cleanups.has(node)) continue;
      cleanups.set(node, bindOne(node));
    }
  };

  const detachIn = (root: HTMLElement): void => {
    const list: HTMLElement[] = [];
    if (root.classList.contains('filter')) list.push(root);
    const nested = root.querySelectorAll('.filter');
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
          if (added.classList.contains('filter') && !cleanups.has(added)) {
            cleanups.set(added, bindOne(added));
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
    for (const stop of cleanups.values()) stop();
    cleanups.clear();
  };
}
