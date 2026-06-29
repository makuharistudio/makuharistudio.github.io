# Memory Bank: makuharistudio.github.io

**Purpose of this document**: Reverse-engineered guidelines, architecture, naming, and design conventions extracted from the codebase (as of 2026). Use this to maintain consistency when editing styles (especially App.css), adding pages/components, assets, content, or the theme system.

---

## Site Purpose & Identity

- Personal portfolio + technical blog site for **makuharistudio** (the creator's handle/brand).
- Showcases:
  - Data visualization / BI projects (Power BI, Deneb, Excel, Tableau, Python, etc.).
  - Technical blog posts (tutorials on Power Query, DAX, etc.).
  - Readings (book notes/reviews).
  - Certifications.
  - Experimental "games" / interactive demos.
- Aesthetic: Retro-futuristic / space / sci-fi tech. 
  - Light theme = clean technical (blue/cyan accents on white).
  - Dark theme = immersive space (black + cyan/white, planetary/earth backgrounds).
- Uses decorative "panel" cards with custom corner SVGs and patterned backgrounds that swap on theme + hover.
- Content-driven: most text lives in Markdown; generated JSON feeds lists and detail pages.
- Deployed to GitHub Pages (https://makuharistudio.github.io) using hash routing.

---

## Tech Stack & Tooling

- **React 19** + **Vite** (replaced CRA).
- **react-router-dom** (v7) with `createHashRouter` (required for GitHub Pages).
- **react-markdown** + **marked** for rendering MD content.
- **three.js** for animated procedural backgrounds.
- **react-router-hash-link** for in-page nav.
- Build output: `dist/`.
- Custom Node script: `npm run parser` (scans markdown → writes data/*.json).
- Theme: pure CSS + JS (no external UI libs for main site). Some experimental pages may use raw Tailwind-like class names (but Tailwind not installed; main styles are custom).
- Deployment: manual `npm run build` then gh-pages / GitHub Actions (see README for details).

Key files:
- `src/index.jsx`: root render, ThemeProvider, hash router + Layout wrapper.
- `package.json` scripts: `dev`, `build`, `parser`.
- `vite.config.js`: minimal React plugin.

---

## Architecture & Routing

- Single Layout wraps everything: `<ThemeToggle /> + <MenuHeader /> + <Outlet /> + <MenuFooter /> + #bg-space container`.
- Routes (children of Layout):
  - `/` → About (with certifications + credits)
  - `/projects`, `/project/:name`
  - `/blog`, `/blog/:name`
  - `/readings`, `/reading/:name`
  - `/games`, `/game/:name`
  - `/test` (special debug bg)
- 404 → NotFound.
- Content pages (Project, BlogPost, Reading) load from JSON by `name` (slug), render `<content>` + ReactMarkdown.
- Dynamic image resolution in MD: regex-replace `![alt](/src/assets/...)` → `new URL(..., import.meta.url)`.
- `useScrollToTop` hook (delay scroll + comment about fade).

---

## Theming System (Critical)

**Two themes**: `light` (default) and `dark`. Controlled by `data-theme` attribute on `<html>` (documentElement).

**Implementation**:
- `ThemeProvider` + `useTheme` hook live inside `src/components/ThemeToggle.jsx` (after merge).
- On toggle: sets `document.documentElement.setAttribute('data-theme', theme)` + persists to `localStorage` key `'theme'`.
- Initial sync also in `index.html` `<head>` script (before React) to avoid flash.
- CSS vars are the primary mechanism (see App.css section below).
- **Asset swapping**:
  - `src/scripts/themeControl.js`: central registry exporting `themeAssets`, `getPanelAssets(theme)`, `getPanelStyleVars(theme)`.
  - Panels import SVGs per variant (light/dark) and inject as `--panel-*` CSS vars via inline `style`.
  - Menu icons: separate default (teal) vs active (color-coded per section: red/about, purple/projects+blog, etc.).
- Backgrounds chosen in `Layout.jsx` via `themeBackgroundMap` (in `data/assets.js`):
  - Light: `bg-light-grid.js`
  - Dark: `bg-space-earth.js` (default), `bg-dark-solid.js` (games)
  - Special: `/test` always `bg-avatarsummon.js`; games often blank/solid.
- Background scripts export: `export function initialiseBackground(container) { ... return cleanupFn; }`

**Adding new theme assets**:
1. Add light/dark pair SVGs to `src/assets/theme/accent/images/`.
2. Register in `themeControl.js`.
3. Consume via `get*` helpers or import directly.

---

## Styling & Naming Conventions (App.css Focus)

**Global structure in App.css (678 lines)**:
- Top: 5 `@font-face` (Anta, Audiowide, Cambay, Orbitron, Saira — all woff2 from `theme/font/`).
- `:root` + shared vars (fonts, sizes, scrollbar, mobile vs landscape menu dims).
- `[data-theme="light"]` (and bare `:root`) + `[data-theme="dark"]` blocks for color vars.
- Base reset + typography (html/body use `--content-font`, etc.).
- Heavy use of **CSS custom properties** everywhere for theming (no hard-coded colors outside the two blocks).
- Custom elements + IDs for layout skeleton:
  - `<content>` tag (lowercase custom element) = bordered main content container. Styled directly (`content { ... }`).
  - `.content-no-bg` variant.
  - `#root`, `#outlet`, `#bg-space`, `#theme-toggle`, `#menu-header`, `#menu-footer`.
- Menu system:
  - `#menu-header`: fixed top-right 3-col grid (desktop only).
  - `#menu-footer`: fixed bottom 6-col (mobile/portrait only).
  - `.menu-header-button`, `.menu-header-label`.
  - `.menu-footer-button`, `.menu-footer-light` + per-color `*-highlight-*` animated gradient glows (teal/purple/red/blue/yellow/orange/white).
  - Active state: swap icon + add class for glow color + `menu-footer`/`menu-header` class on label.
- Lists/grids: `#projects-list`, `#blog-list`, `#readings-list`, `#certification-list` (CSS grids, often `repeat(auto-fill, minmax(...))`).
- Panels: `.panel-corners`, `.panel-background`, `.panel-content`, `.panel-corner*` (defined in `accent.css`; vars from themeControl).
- Filters: `.filter` + buttons (inline style for active using CSS vars).
- Typography hierarchy uses title fonts on h1–h6.
- Code blocks, images, links all themed via vars.
- Animations: only `menu-footer-light-glow` keyframe (gradient sweep).
- Scrollbars custom-themed.
- **Responsive**: NOT standard width breakpoints. Uses:
  - `@media (max-aspect-ratio: 17/20)` → "portrait mobile": smaller font, 1-col grids, show footer, hide header, adjust paddings/avatar.
  - `@media (min-aspect-ratio: 17/20)` → everything else: show header, hide footer, multi-col grids, min-heights on titles for alignment.

**Naming conventions (strictly followed)**:
- **IDs** (unique structural): kebab-case or descriptive (`#menu-header`, `#about-desc`, `#projects-list`, `#avatar-image`, `#theme-toggle`, `#bg-space`, `#outlet`, `#link-list`, `#certification-list`).
- **Classes**: kebab-case, descriptive/prefixed:
  - `menu-*` (header/footer/button/label/light/glow variants)
  - `panel-*` (corners, background, content, corner-*)
  - `filter`, `content-no-bg`
- **CSS vars**: `--kebab-descriptive` (`--content-font-color`, `--panel-border-color-hover`, `--menu-footer-button-width`, `--text-background`).
- **Component files**: PascalCase.jsx (`ThemeToggle.jsx`, `MenuHeader.jsx`, `ProjectsList.jsx`).
- **List components**: `*List.jsx` pattern.
- **Page files**: match route name (`About.jsx`, `BlogPost.jsx` for `/blog/:name`).
- **Theme assets**:
  - Menu: `menu-button-{section}-{color}.svg` + `menu-button-{section}-active-color.svg` (or teal default).
  - Panels: `panel-{theme}-backgroundlines{,-hover}.svg` + `panel-{theme}-corneredge{,-hover}.svg`.
- **Data/JSON**: slugs in `name` field (title lowercased, special chars stripped, spaces → `-`).
- **Markdown frontmatter**: YAML-ish between `---` lines (title, date, tags as JSON array string, tech, photo, description, siteURL, etc.).
- In JSX: mix of `className`, raw `style={{}}` for active (using `var(--...)`), and `<center>` for some headings (legacy but consistent).
- Image loading in lists: `loading='lazy'`.

**App.css patterns to preserve**:
- All color changes go through the two `[data-theme]` var blocks.
- Layout uses `position: fixed` + viewport units + calc for navs.
- Grids for responsive card lists + subgrid tricks for title alignment.
- Min-heights on headings inside lists (for visual consistency across cards).
- Direct tag selector for `content` + `a:hover .panel-*` for hover states.

---

## Asset Organization (src/assets/)

- `theme/` is the single source of truth for design assets:
  - `accent/`: decorative (panels + menu buttons + accent.css + Panel.jsx impl)
  - `avatar/`: profile + title images (y-a/b/c for "makuhari"?)
  - `background/images/space/`: planetary mosaics, moon, stars.
  - `background/scripts/`: each bg is a self-contained three.js initializer.
  - `font/`, `logo/`.
- Other image folders: `blog/`, `projects/`, `readings/` (flat; referenced by filename in MD/JSON).
- `games/SatelliteCoverageOptimiser.jsx` (special interactive).
- Import patterns:
  - Static in `data/assets.js` (exported for use in components).
  - Runtime `new URL('../assets/xxx', import.meta.url).href` inside list components and detail pages.
- Never hardcode full public URLs for internal assets when possible.

---

## Content Management Workflow

1. Create/edit `.md` in `src/markdown/{posts|projects|readings}/`.
2. Use frontmatter:
   ```md
   ---
   title: ...
   date: 26 September 2021
   tags: ["Power BI", "Power Query"]
   photo: ../assets/blog/...
   description: ...
   tech: logo-...
   ---
   ```
3. Run `npm run parser` → regenerates `data/posts.json`, `projects.json`, `readings.json`.
4. Slugs derived automatically; `name` field used for routes.
5. Detail pages (e.g. `/blog/:name`) find by name and render MD (with image fixup).
6. Lists use the JSON + optional tag filters (parsed from JSON strings).
7. Projects/readings have extra fields (desc, siteURL, codeURL, author, etc.).

**Parser details** (src/scripts/parser.js):
- Splits on first two `^---` lines.
- `parseMetadata` takes lines between them (simple `key: value`).
- Sorts by id (timestamp from date) descending.
- Preserves full content including blank lines.

---

## Component & Page Patterns

- **Layout pages** (About, Projects, etc.): minimal wrapper + `<center><hN>Title</hN></center>` + List component.
- **List components**: 
  - Tag filter row (`.filter` + buttons, active via inline style matching hover color).
  - `<div id='xxx-list'>` grid.
  - Each item: `<Link><Panel><h4>title</h4><h5>date</h5><img/><p>desc/excerpt</p></Panel></Link>`.
- **Panel usage**: wrap card content. Provides themed decorative frame. Always used for lists/certifications.
- **Detail pages**: `<content><h1>...</h1><ReactMarkdown>...</></content>`.
- Menus: config array of objects (to, label, isActive logic via pathname includes, iconDefault/Active, light* class names).
- Active detection is string-based (exact `/` or `.includes('/project')` etc.).
- No prop drilling for theme; use `useTheme()` hook.
- Re-exports from ThemeToggle for panel helpers (convenience).

---

## Background System Details

- Each bg script:
  - Creates scene/camera/renderer.
  - Appends `renderer.domElement` to passed container.
  - Returns cleanup: remove listeners, dispose, remove DOM node.
- Layout clears previous children + calls new initializer on theme or route change.
- Theme drives map choice; path can override (games, test).
- Low-power settings on some (antialias:false, pixelRatio:1).

---

## Responsive & Layout Gotchas

- Aspect-ratio media queries instead of widths (historical design choice for "portrait mobile vs everything").
- On wide screens: header visible, footer hidden, content width `min(90vw, 75ch)`.
- Portrait: header hidden, footer visible, larger touch targets, 1-col lists.
- Fixed elements + z-index layering (theme-toggle/menu 9999, bg -1, panels 2-4).
- Viewport units + calc() used extensively.
- Scrollbar width reserved in sizing calcs.

---

## Development Workflow & Commands

- `npm run dev`
- Edit styles → changes hot.
- `npm run parser` (after new MD or metadata changes).
- `npm run build`
- For deploys: see extensive README (GitHub Desktop / Actions / toolbox notes for Linux).
- Assets added to `theme/` should be imported in `data/assets.js` or `themeControl.js` so Vite bundles them.
- When moving files (e.g. ThemeContext → ThemeToggle), update all relative imports (index, Layout, Panel, etc.).

---

## Key Conventions & Gotchas for AI Agents

- **Do not** introduce Tailwind or other CSS frameworks to core site without explicit change.
- **Prefer** extending CSS vars + data-theme for any new colors/states.
- **Use** `<Panel>` for list items and callout boxes.
- **Use** `<content>` (not `<main>` or `<div class="content">`) for routed article-like pages.
- Keep menu active logic, glow classes, and icon swapping consistent.
- When adding sections, mirror naming: id for the grid container, `*-list` suffix, filter if tags present.
- Parser is brittle on frontmatter — keep `---` exact, simple key: value.
- Theme assets live under accent/images for panels/menus; register centrally.
- Backgrounds are dynamic-imported; keep the cleanup contract.
- Image paths in MD start with `../assets/...` or `/src/assets/...` (parser/pages normalize).
- File organization is intentional (Panel under assets/theme is historical; don't "fix" without reason).
- Maintain the aspect-ratio responsive split.
- The site values decorative, hand-crafted panel aesthetics over clean modern minimalism.

---

**Last reverse-engineered**: 2026-06-26 (from full source exploration).

Update this file when major refactors, new theme patterns, or CSS conventions are introduced.
