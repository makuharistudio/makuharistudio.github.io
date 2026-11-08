/**
 * Scroll-triggered fade + blur animation for preview/list pages only.
 * Applies exclusively on exact allowed listing routes while artcraft theme is active.
 * Uses IntersectionObserver + MutationObserver (patterned after filter-scroll / preview-expand).
 * Respects prefers-reduced-motion.
 */

const SCROLL_FADE = 'scroll-fade';
const VISIBLE = 'is-visible';

/**
 * Target panel-content elements (and the cards that contain them) on the
 * allowed listing/preview pages. This is the core requirement:
 * the fade + blur must affect the panel-content and the content inside it.
 *
 * We target both:
 *   - the direct <a> cards (so the whole visual card participates), and
 *   - the .panel-content nodes themselves (so the inner content area is affected).
 *
 * Descendant rules in CSS ensure children of .panel-content also receive the effect.
 */
const TARGET_SELECTOR = [
  // Outer card containers (the visual preview items)
  '#projects-list > a',
  '#blog-list > a',
  '#games-list > a',
  '#readings-list > a',
  '#certification-list > a',
  // The actual panel-content blocks (explicitly requested)
  '#projects-list .panel-content',
  '#blog-list .panel-content',
  '#games-list .panel-content',
  '#readings-list .panel-content',
  '#certification-list .panel-content',
  // Home / About page major panels
  'content.content-no-bg .panel-content',
  'content.content-no-bg .panel-corners',
  '#about',
].join(', ');

function isAllowedRoute(): boolean {
  const hash = window.location.hash || '';
  if (hash === '' || hash === '#' || hash === '#/' || hash === '#/') return true;
  if (hash === '#/projects' || hash === '#/blog' || hash === '#/readings' || hash === '#/games') return true;
  return false;
}

function prefersReducedMotion(): boolean {
  if (!window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldEnable(): boolean {
  if (prefersReducedMotion()) return false;
  return isAllowedRoute();
}

function getTargets(root: ParentNode): HTMLElement[] {
  const nodes = root.querySelectorAll(TARGET_SELECTOR);
  const out: HTMLElement[] = [];
  for (const n of nodes) {
    if (n instanceof HTMLElement) out.push(n);
  }
  return out;
}

function elementIntersectsViewport(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return !(r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw);
}

export function bindScrollFade(): () => void {
  const managed = new Set<HTMLElement>();
  let io: IntersectionObserver | null = null;
  let mo: MutationObserver | null = null;
  let mq: MediaQueryList | null = null;

  function ensureObserver(): void {
    if (io) return;
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (!managed.has(el)) continue;

          // Pure, simple rule:
          // When the element enters the observed region → become clear (add .is-visible).
          // When the element leaves the observed region → become blurred again (remove .is-visible).
          // This produces the exact requested behavior for off-viewport panel-content:
          //   start blurred → user scrolls it into view → fades in clear.
          if (entry.isIntersecting) {
            el.classList.add(VISIBLE);
          } else {
            el.classList.remove(VISIBLE);
          }
        }
      },
      {
        root: null,
        // The element must be scrolled a reasonable distance into the viewport
        // before we report "entered". This keeps list items that are still
        // mostly below the fold in the initial blurred state.
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.06,
      }
    );
  }

  /**
   * Attach the scroll-fade effect.
   * Every managed element (list cards + .panel-content + panel frames on allowed routes)
   * is given the base .scroll-fade class and starts WITHOUT .is-visible.
   *
   * The IntersectionObserver is the only thing allowed to add .is-visible.
   * We also explicitly push the classes down to .panel-content so the interior
   * content (titles, images, descriptions, etc.) participates, as requested.
   */
  function attachOne(el: HTMLElement): void {
    if (managed.has(el)) return;
    managed.add(el);

    // Start in the off-viewport / awaiting-scroll state.
    el.classList.add(SCROLL_FADE);
    el.classList.remove(VISIBLE);

    if (io) io.observe(el);

    // Propagate to panel structure so .panel-content and its descendants
    // (the actual visual content) are the things that blur and then fade in.
    if (el.tagName === 'A' || el.classList.contains('panel-corners') || el.id === 'about') {
      const corners = el.querySelector('.panel-corners') ||
                      (el.classList.contains('panel-corners') ? el : null);
      if (corners instanceof HTMLElement && !managed.has(corners)) {
        managed.add(corners);
        corners.classList.add(SCROLL_FADE);
        corners.classList.remove(VISIBLE);
        if (io) io.observe(corners);
      }

      el.querySelectorAll('.panel-content').forEach((inner) => {
        if (!(inner instanceof HTMLElement) || managed.has(inner)) return;
        managed.add(inner);
        inner.classList.add(SCROLL_FADE);
        inner.classList.remove(VISIBLE);
        if (io) io.observe(inner);
      });
    }
  }

  /**
   * After we attach targets (or after the user navigates to another allowed
   * listing page), walk the managed set and strip .is-visible from anything
   * that is not the absolute top sliver of the page.
   *
   * This guarantees that panel-content elements that are below the initial
   * viewport start blurred. When the user scrolls them into view the
   * IntersectionObserver adds .is-visible and the CSS transition runs
   * (fade + unblur). Scrolling them out reverses it.
   */
  function enforceInitialViewportStates(): void {
    const vh = window.innerHeight || document.documentElement.clientHeight || 900;
    for (const el of managed) {
      if (!el.isConnected) continue;
      const r = el.getBoundingClientRect();

      // Anything whose top is below a generous top band (well below the header)
      // must start (or be reset to) the blurred state.
      if (r.top > 130) {
        el.classList.remove(VISIBLE);
      }
      if (r.bottom < 0) {
        el.classList.remove(VISIBLE);
      }
    }
  }

  function attachIn(root: ParentNode): void {
    if (!shouldEnable()) return;
    ensureObserver();
    const targets = getTargets(root);
    for (const el of targets) {
      attachOne(el);
    }
    // After attaching the batch, make sure anything that is currently
    // off the viewport is explicitly without .is-visible so the blur
    // state is active until the user scrolls it in.
    enforceInitialViewportStates();
  }

  function detachIn(root: HTMLElement): void {
    const toRemove: HTMLElement[] = [];
    // If the removed root itself is (or contains) a managed target, collect them.
    if (root.matches && root.matches(TARGET_SELECTOR) && managed.has(root)) {
      toRemove.push(root);
    }
    const nested = root.querySelectorAll(TARGET_SELECTOR);
    for (const n of nested) {
      if (n instanceof HTMLElement && managed.has(n)) toRemove.push(n);
    }
    for (const el of toRemove) {
      if (io) io.unobserve(el);
      el.classList.remove(SCROLL_FADE, VISIBLE);
      managed.delete(el);
    }
  }

  function cleanupAll(): void {
    for (const el of managed) {
      if (io) io.unobserve(el);
      el.classList.remove(SCROLL_FADE, VISIBLE);
    }
    managed.clear();
  }

  /**
   * Re-apply the effect after navigation or content change.
   * We detach any stale elements, attach any new targets, and for elements
   * that remain we remove the visible flag and let the fresh IntersectionObserver
   * report the current viewport status (so panels that are now off-screen
   * correctly start blurred again).
   */
  function refresh(): void {
    if (!shouldEnable()) {
      cleanupAll();
      return;
    }

    // Drop elements that no longer exist in the document
    for (const el of Array.from(managed)) {
      if (!el.isConnected || !document.contains(el)) {
        if (io) io.unobserve(el);
        el.classList.remove(SCROLL_FADE, VISIBLE);
        managed.delete(el);
      }
    }

    // Attach any new targets that appeared (route content swap)
    attachIn(document);

    // For still-managed elements, reset to the base (blurred) state
    // and re-observe so the observer will immediately report whether
    // they are currently intersecting. This makes returning to a listing
    // page behave correctly for offscreen vs onscreen panels.
    for (const el of Array.from(managed)) {
      if (!el.isConnected) continue;
      el.classList.remove(VISIBLE);
      // Ensure base class
      if (!el.classList.contains(SCROLL_FADE)) {
        el.classList.add(SCROLL_FADE);
      }
      if (io) {
        io.unobserve(el);
        io.observe(el);
      }
    }
  }

  const body = document.body;
  if (!body) {
    return () => {
      /* no-op */
    };
  }

  // Initial attach only if enabled
  if (shouldEnable()) {
    ensureObserver();
    attachIn(document);
  }

  // Watch for content swaps (hash routing)
  mo = new MutationObserver((records) => {
    if (!shouldEnable()) {
      if (managed.size > 0) cleanupAll();
      return;
    }
    for (const record of records) {
      for (const added of record.addedNodes) {
        if (added instanceof HTMLElement) {
          attachIn(added);
        }
      }
      for (const removed of record.removedNodes) {
        if (removed instanceof HTMLElement) {
          detachIn(removed);
        }
      }
    }
  });
  mo.observe(body, { childList: true, subtree: true });

  // Route changes
  const onHash = (): void => {
    refresh();
  };
  window.addEventListener('hashchange', onHash);

  // React to reduced-motion preference changes
  if (window.matchMedia) {
    mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (): void => refresh();
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else if ((mq as any).addListener) {
      (mq as any).addListener(handler);
    }
    // store for removal
    (mq as any).__sf_handler = handler;
  }

  return () => {
    window.removeEventListener('hashchange', onHash);
    if (mo) {
      mo.disconnect();
      mo = null;
    }
    if (io) {
      io.disconnect();
      io = null;
    }
    if (mq) {
      const h = (mq as any).__sf_handler;
      if (h) {
        if (mq.removeEventListener) mq.removeEventListener('change', h);
        else if ((mq as any).removeListener) (mq as any).removeListener(h);
      }
      mq = null;
    }
    cleanupAll();
  };
}
