# Memory bank

## Restrictions
- Work exclusively in /home/guardian/Projects/makuharistudio.
- Old React site (/home/guardian/Projects/makuharistudio.github.io) is reference only — read it, do not modify, move, or commit to it.
- Framework-free: only HTML, CSS, TypeScript. No React, no Tailwind, no runtime npm dependencies, no Vite-as-framework.
- Ship only plain JS to browser (dev-only tsc allowed).
- Vendored libs (if needed, e.g. Three.js) go in /source/library/ with version/origin note.
- Hash routing only for GitHub Pages compatibility.
- Strict TypeScript in every file ("strict": true, no any unless commented, DOM null checks).
- One responsibility per module.
- Ask before any product decision, content model, routing scheme, markdown dialect, theme API, asset-discovery method, game metadata changes, or missing markdown feature.
- Do not delete old content you do not understand.
- After scaffold, stop and show folder tree + questions before porting all games and all posts.
- Update this file before feature work and as each item is completed.

## Hierarchy
- /source/assets/blog, /projects, /readings
- /source/assets/theme — shared only: fonts, logos, avatars, favicon. No accent, no background.
- /source/games (TS modules + assets)
- /source/markdown/posts, /projects, /readings
- /source/library/ (shared: markdown parser/renderer, router, theme loader, types, catalog generator)
- /source/themes/<themeName>/(light|dark)/(<themeName>-(light|dark).css, accent/, background/{images/,scripts/})
- /source/pages/
- /source/components/ (plain TS DOM rendering; TSX transform allowed per decision)
- /dist (build output folder — final static site for GitHub Pages)
- memory-bank.md (this file — single source of truth for decisions)

## Decisions (only ones confirmed)
- Asset discovery: C — build-time index emitted by build.ts (scans folders, no separate parser command for maintainer).
- Game metadata: Typed header object inside the single game .ts file (title, description, photo, etc.). Slug = basename without extension. Matches old "meta in the file" approach.
- Components: Use TSX with minimal no-dependency transform in build pipeline (for readability and easier porting).
- Games: Each provides its own unique background initializer. Layout must cleanly dispose previous background (call cleanup, remove nodes, dispose Three.js resources) before new one to prevent memory leaks/invisible running scenes.
- First visit: match prefers-color-scheme; fallback to dark for space theme.
- Theme storage key: 'theme' (localStorage + data-theme on documentElement). Apply before first paint.
- About page: Keep certifications. LinkList shows X and GitHub only; LinkedIn code commented out (easy to toggle).
- Build output folder: dist/ (contains index.html + js/ + copied assets with relative paths).
- Responsive: Follow old App.css exactly — @media (max-aspect-ratio: 17/20) for portrait (hide header, show footer, 1-col grids); opposite for landscape.
- Markdown: Preserve exact old frontmatter. Support used constructs (headings, p, strong/em, links, images, fenced code, ul, hr). Rewrite old image paths. Escape HTML. Derive excerpt for posts without description.

## Open questions
- (None — all prior questions resolved in this update)

## Features
- [x] memory-bank.md created and maintained
- [x] scaffold + strict TS build (tsconfig.json, build.ts)
- [x] index.html with no-flash theme script
- [x] dist/ as build output
- [x] build-time catalog generation (choice C)
- [x] minimal TSX transform in build
- [x] theme loader + space light/dark port (separate light/dark folders, CSS, accents, city + Earth backgrounds)
- [x] hash router
- [x] markdown parser + renderer (library/) with build-time raw embed
- [x] layout (menus via aspect-ratio, IDs, background container with cleanup)
- [x] about page (avatar, bio, certifications, LinkList with X/GitHub)
- [x] blog list + detail (tag filters, excerpts, image rewrite)
- [x] projects list + detail
- [x] readings list + detail
- [x] games list + full-screen games (with unique backgrounds, no leaks)
- [x] 404 page
- [x] certifications port
- [x] README.md with Fedora deploy/update instructions
- [x] browser verification for all UI/layout changes
- [x] GitHub Pages deployment notes

## Progress log
- 2026-10-09: Created memory-bank.md. Read old site extensively. Decided on TSX, build-time catalog (C), game metadata, dist/, background cleanup, LinkList (X+GitHub only).
- 2026-10-09 (later): Scaffold only. Pages were placeholders. Theme CSS was a stub. Catalog listed filenames but content was not loaded into pages.
- 2026-10-09 (theme folders): Moved accent and background out of source/assets/theme into source/themes/space/light and source/themes/space/dark. Each mode has its css, accent/, and background/{images,scripts}. Shared fonts, logos, avatars, favicon stay in source/assets/theme. ACTIVE_THEME const in main.ts selects the pack. No-flash script loads themes/<name>/<mode>/<name>-<mode>.css. Verified in Firefox: dark Earth + dark panel/menu SVGs, light city + light panel/menu SVGs, stylesheet swap on toggle.
- 2026-10-09 (games): Ported Dual N-Back, Rocket Launch Simulation, Satellite Coverage Optimiser, and Vocabulary Trainer. Each .ts file has a typed meta header (slug = basename). JSX compiles to the local h() runtime (no React). Physics, weather, and vocabulary data stay as @ts-nocheck modules. Each game supplies initialiseBackground; Layout disposes the previous scene before the next and restores the theme scene on leave. Earth mosaics come from getEarthTextureBase(). Card photos copy to dist/assets/games. Verified in Firefox: 4 cards with images, unknown slug message, Dual N-Back start, Vocabulary welcome, Satellite and Rocket canvases, theme Earth restored after exit, portrait footer / landscape header.
- 2026-10-09 (port): Implemented the non-game site against the old React codebase (read-only). Layout (header/footer menus, aspect-ratio show/hide), space light/dark CSS ported from App.css + accent.css, panel frames, theme toggle icons, LinkList (X + GitHub; LinkedIn commented), certifications, about + credits, tag-filtered lists, markdown detail pages. `build.sh` embeds markdown via generated `markdown-raw.ts`. Three.js r173 vendored for the dark Earth background; light theme uses the scrolling city. Games route is a stub. Verified in Firefox: about, blog (23 posts, DAX filter shows 3), post with code and images, projects (9), readings (7), 404, theme toggle, portrait footer. WebGL Earth rendered. Games still excluded.
