export type ThemeName = 'space';
export type ColorMode = 'light' | 'dark';
export type ContentKind = 'posts' | 'projects' | 'readings';

export interface Frontmatter {
  title: string;
  date: string;
  tech: string;
  tags: string;
  photo: string;
  description: string;
  siteURL: string;
  codeURL: string;
  author: string;
  publisher: string;
  publisherURL: string;
  category: string;
}

export interface ContentItem {
  id: number;
  title: string;
  name: string;
  date: string;
  content: string;
  photo: string;
  tags: string;
  tech: string;
  description: string;
  siteURL: string;
  codeURL: string;
  author: string;
  publisher: string;
  publisherURL: string;
  category: string;
  file: string;
}

export interface Route {
  pattern: RegExp;
  handler: (param: string | null) => void | (() => void);
}

export interface GameMeta {
  slug: string;
  title: string;
  description: string;
  photo: string;
}

export interface GameModule {
  meta: GameMeta;
  /** Mount the game into a container. The return value disposes timers, listeners, and WebGL. */
  mount: (container: HTMLElement) => () => void;
  /** Optional full-screen scene. When omitted, the game paints its own backdrop in the page. */
  initialiseBackground?: (container: HTMLElement) => () => void;
}

export interface MenuLink {
  hash: string;
  label: string;
  match: (path: string) => boolean;
  icon: string;
  iconActive: string;
  footerLight: string;
  footerLightActive: string;
}
