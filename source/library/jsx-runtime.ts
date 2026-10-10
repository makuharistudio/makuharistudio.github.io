/**
 * Minimal no-dependency TSX runtime.
 * tsconfig "jsx": "react-jsx" with jsxImportSource pointing here.
 * Custom (2026). No React.
 *
 * Hooks (useState, useEffect, useRef, useMemo, useCallback) exist so the
 * ported games can keep their component structure. They run only while a
 * game root created by render() is mounted.
 */

export type JSXChild = Node | string | number | null | undefined | false | JSXChild[];
export type JSXProps = Record<string, unknown> | null;

type AnyFn = (...args: never[]) => unknown;

type StateHook = {
  kind: 'state';
  value: unknown;
  ready: boolean;
};

type RefHook = {
  kind: 'ref';
  current: unknown;
};

type MemoHook = {
  kind: 'memo';
  deps: readonly unknown[];
  value: unknown;
};

type EffectHook = {
  kind: 'effect';
  deps: readonly unknown[] | undefined;
  effect: () => void | (() => void);
  cleanup: void | (() => void);
  pending: boolean;
};

type Hook = StateHook | RefHook | MemoHook | EffectHook;

type ComponentFn = (props: Record<string, unknown>) => Node;

type Fiber = {
  fn: ComponentFn;
  props: Record<string, unknown>;
  hooks: Hook[];
  cursor: number;
  host: HTMLElement;
  scheduled: boolean;
};

const hosts = new Map<Node, Fiber>();
let current: Fiber | null = null;

export function h(
  tag: string | ComponentFn,
  props: JSXProps,
  ...children: JSXChild[]
): Node {
  if (typeof tag === 'function') {
    const flat = children.flat();
    const nextProps: Record<string, unknown> = { ...(props ?? {}) };
    if (!('children' in nextProps)) {
      nextProps.children = flat.length === 1 ? flat[0] : flat;
    }
    return mountComponent(tag, nextProps);
  }

  const element = document.createElement(tag);
  applyProps(element, props);
  appendChildren(element, children);
  return element;
}

function applyProps(element: HTMLElement, props: JSXProps): void {
  if (!props) return;
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'className') {
      element.className = String(value);
    } else if (key === 'htmlFor') {
      element.setAttribute('for', String(value));
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value as EventListener);
    } else if (key === 'children' || key === 'ref' || key === 'key') {
      continue;
    } else if (typeof value === 'boolean') {
      if (value) element.setAttribute(key, '');
    } else {
      element.setAttribute(key, String(value));
    }
  }
  const ref = props.ref;
  if (typeof ref === 'function') {
    (ref as (node: HTMLElement) => void)(element);
  } else if (ref && typeof ref === 'object' && 'current' in ref) {
    (ref as { current: unknown }).current = element;
  }
}

function appendChildren(parent: Node, children: JSXChild[]): void {
  for (const child of children.flat()) appendOne(parent, child);
}

function appendOne(parent: Node, child: JSXChild): void {
  if (child == null || child === false) return;
  if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(String(child)));
    return;
  }
  if (child instanceof Node) {
    parent.appendChild(child);
    return;
  }
  if (Array.isArray(child)) {
    for (const nested of child) appendOne(parent, nested);
  }
}

export function Fragment(props: { children?: JSXChild | JSXChild[] }): DocumentFragment {
  const frag = document.createDocumentFragment();
  const kids = props.children;
  if (kids == null) return frag;
  appendChildren(frag, Array.isArray(kids) ? kids : [kids]);
  return frag;
}

function mountComponent(fn: ComponentFn, props: Record<string, unknown>): HTMLElement {
  const host = document.createElement('span');
  host.style.display = 'contents';
  const fiber: Fiber = {
    fn,
    props,
    hooks: [],
    cursor: 0,
    host,
    scheduled: false,
  };
  hosts.set(host, fiber);
  commit(fiber);
  return host;
}

function commit(fiber: Fiber): void {
  const parent = current;
  current = fiber;
  fiber.cursor = 0;
  let node: Node;
  try {
    node = fiber.fn(fiber.props);
  } finally {
    current = parent;
  }
  fiber.host.replaceChildren(node);
  const effects = fiber.hooks.filter((hook): hook is EffectHook => hook.kind === 'effect' && hook.pending);
  if (effects.length === 0) return;
  queueMicrotask(() => {
    if (!fiber.host.isConnected) return;
    for (const hook of effects) {
      if (!hook.pending) continue;
      if (hook.cleanup) hook.cleanup();
      hook.cleanup = hook.effect() ?? undefined;
      hook.pending = false;
    }
  });
}

function schedule(fiber: Fiber): void {
  if (fiber.scheduled) return;
  fiber.scheduled = true;
  queueMicrotask(() => {
    fiber.scheduled = false;
    if (!fiber.host.isConnected) return;
    commit(fiber);
  });
}

function readHook(): Hook {
  if (!current) throw new Error('hook called outside a game component');
  const index = current.cursor;
  current.cursor += 1;
  const existing = current.hooks[index];
  if (existing) return existing;
  const created: StateHook = { kind: 'state', value: undefined, ready: false };
  current.hooks[index] = created;
  return created;
}

export function useState<T>(initial: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void] {
  const fiber = current;
  const hook = readHook();
  if (hook.kind !== 'state') throw new Error('hook order changed');
  if (!hook.ready) {
    hook.value = typeof initial === 'function' ? (initial as () => T)() : initial;
    hook.ready = true;
  }
  const setState = (next: T | ((prev: T) => T)): void => {
    const value = hook.value as T;
    const resolved = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
    if (Object.is(resolved, hook.value)) return;
    hook.value = resolved;
    if (fiber) schedule(fiber);
  };
  return [hook.value as T, setState];
}

export function useRef<T>(initial: T): { current: T } {
  const hook = readHook();
  if (hook.kind === 'state') {
    const ref: RefHook = { kind: 'ref', current: initial };
    if (current) current.hooks[current.cursor - 1] = ref;
    return ref as { current: T };
  }
  if (hook.kind !== 'ref') throw new Error('hook order changed');
  return hook as { current: T };
}

export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T {
  const hook = readHook();
  if (hook.kind === 'state') {
    const memo: MemoHook = { kind: 'memo', deps, value: factory() };
    if (current) current.hooks[current.cursor - 1] = memo;
    return memo.value as T;
  }
  if (hook.kind !== 'memo') throw new Error('hook order changed');
  if (!sameDeps(hook.deps, deps)) {
    hook.deps = deps;
    hook.value = factory();
  }
  return hook.value as T;
}

export function useCallback<T extends AnyFn>(fn: T, deps: readonly unknown[]): T {
  return useMemo(() => fn, deps);
}

export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void {
  const hook = readHook();
  if (hook.kind === 'state') {
    const created: EffectHook = {
      kind: 'effect',
      deps,
      effect,
      cleanup: undefined,
      pending: true,
    };
    if (current) current.hooks[current.cursor - 1] = created;
    return;
  }
  if (hook.kind !== 'effect') throw new Error('hook order changed');
  if (!sameDeps(hook.deps, deps)) {
    hook.deps = deps;
    hook.effect = effect;
    hook.pending = true;
  }
}

function sameDeps(prev: readonly unknown[] | undefined, next: readonly unknown[] | undefined): boolean {
  if (prev === undefined || next === undefined) return false;
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i += 1) {
    if (!Object.is(prev[i], next[i])) return false;
  }
  return true;
}

function disposeNode(node: Node): void {
  const fiber = hosts.get(node);
  if (fiber) {
    hosts.delete(node);
    for (const hook of fiber.hooks) {
      if (hook.kind === 'effect' && hook.cleanup) hook.cleanup();
    }
  }
  for (const child of Array.from(node.childNodes)) disposeNode(child);
}

/** Mount a game component. The returned function runs effect cleanups and removes the tree. */
export function render(component: ComponentFn, container: HTMLElement, props: Record<string, unknown> = {}): () => void {
  const host = mountComponent(component, props);
  container.appendChild(host);
  return () => {
    disposeNode(host);
    host.remove();
  };
}

export const jsx = h;
export const jsxs = h;
export const jsxDEV = h;
