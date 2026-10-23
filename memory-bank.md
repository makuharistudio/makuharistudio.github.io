# Memory bank

## Restrictions
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
- About page: Keep certifications. Experience timeline sits between certifications and site credits. Career records live as a JSON-like array in ExperienceList.ts; role text is painted to canvas so it is not in the DOM. LinkList shows X and GitHub only; LinkedIn code commented out (easy to toggle).
- Build output folder: dist/ (contains index.html + js/ + copied assets with relative paths).
- Responsive: Follow old App.css exactly — @media (max-aspect-ratio: 17/20) for portrait (hide header, show footer, 1-col grids); opposite for landscape.
- Markdown: Preserve exact old frontmatter. Support the constructs used by the posts (see Markdown rules below). Rewrite old image paths. Escape HTML. Derive excerpt for posts without description.
- Theme pack switch: index.html `ACTIVE_THEME` is the only maintainer switch. The no-flash script sets `data-theme-pack` and the stylesheet href. `loadTheme()` reads that and selects the pack from `source/library/theme-registry.ts`, which build.sh generates by scanning `source/themes/*/index.ts`. `main.ts` has no pack name. Game globe mosaics stay at `themes/space/dark/background/images`.

## Markdown rules
The custom renderer in `source/library/markdown.ts` is the whole dialect. `react-markdown` is gone. Markers are consumed; they do not appear in the page.

Emphasis, including inside list items and link text:
- `*text*` and `_text_` render as italic. Underscores stay literal inside a word (`intra_word`).
- `**text**` and `__text__` render as bold.
- `***text***` renders as bold italic.
- `_**text**_` and `**_text_**` render as bold italic. The outer marker may sit against the inner marker, as in `_**bars and millibars**_`.
- `_"quoted"_` renders as italic, including the quotation marks, with the underscores consumed.
- `` `code` `` is literal. Emphasis markers inside a code span stay as characters.

Lists:
- `*`, `-`, and `1.` / `2.` are list markers. A blank line between items still belongs to the same list.
- Ordered items keep and continue the written numbers. Each `<ol>` numbers itself. A later list starts again at 1.
- A marker indented under an item is a nested list, not a new top-level item and not a `<br>`.
- `*` renders as `•`. `-` renders as `-`, including a dash list nested under a bullet.
- A nested marker lines up with the first letter of its parent item. It does not sit under the parent marker.
- Fenced code indented under an item stays inside that item.
- A fence at the item's own indent stays inside the item when a nested marker follows it, so that marker remains nested. The fence is flushed so its block lines up with a top-level fence.
- One blank line between blocks is a paragraph break. Each further blank line is one extra line break.

Also supported: headings, paragraphs, links, images, fenced code, and `---`. HTML in the source is escaped.

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
- [x] about page (avatar, bio, certifications, experience timeline, LinkList with X/GitHub)
- [x] blog list + detail (tag filters, excerpts, image rewrite)
- [x] projects list + detail
- [x] readings list + detail
- [x] games list + full-screen games (with unique backgrounds, no leaks)
- [x] 404 page
- [x] certifications port
- [x] README.md with Fedora deploy/update instructions
- [x] browser verification for all UI/layout changes
- [x] GitHub Pages deployment notes
- [x] quietprecision portrait footer kanji (略/作/誌/読/遊)
- [x] quietprecision 3s hover preview expand on project, blog, and game cards

## Progress log
- 2026-10-09: Created memory-bank.md. Read old site extensively. Decided on TSX, build-time catalog (C), game metadata, dist/, background cleanup, LinkList (X+GitHub only).
- 2026-10-09 (later): Scaffold only. Pages were placeholders. Theme CSS was a stub. Catalog listed filenames but content was not loaded into pages.
- 2026-10-09 (theme folders): Moved accent and background out of source/assets/theme into source/themes/space/light and source/themes/space/dark. Each mode has its css, accent/, and background/{images,scripts}. Shared fonts, logos, avatars, favicon stay in source/assets/theme. ACTIVE_THEME const in main.ts selects the pack. No-flash script loads themes/<name>/<mode>/<name>-<mode>.css. Verified in Firefox: dark Earth + dark panel/menu SVGs, light city + light panel/menu SVGs, stylesheet swap on toggle.
- 2026-10-09 (games): Ported Dual N-Back, Rocket Launch Simulation, Satellite Coverage Optimiser, and Vocabulary Trainer. Each .ts file has a typed meta header (slug = basename). JSX compiles to the local h() runtime (no React). Physics, weather, and vocabulary data stay as @ts-nocheck modules. Each game supplies initialiseBackground; Layout disposes the previous scene before the next and restores the theme scene on leave. Earth mosaics come from getEarthTextureBase(). Card photos copy to dist/assets/games. Verified in Firefox: 4 cards with images, unknown slug message, Dual N-Back start, Vocabulary welcome, Satellite and Rocket canvases, theme Earth restored after exit, portrait footer / landscape header.
- 2026-10-09 (port): Implemented the non-game site against the old React codebase (read-only). Layout (header/footer menus, aspect-ratio show/hide), space light/dark CSS ported from App.css + accent.css, panel frames, theme toggle icons, LinkList (X + GitHub; LinkedIn commented), certifications, about + credits, tag-filtered lists, markdown detail pages. `build.sh` embeds markdown via generated `markdown-raw.ts`. Three.js r173 vendored for the dark Earth background; light theme uses the scrolling city. Games route is a stub. Verified in Firefox: about, blog (23 posts, DAX filter shows 3), post with code and images, projects (9), readings (7), 404, theme toggle, portrait footer. WebGL Earth rendered. Games still excluded.
- 2026-10-10: Markdown renderer now emits real nested lists (no literal `<br>•`) and emphasis for `*`, `_`, `**`, `__`, `***`, and `_**bold italic**_`. Nested markers indent under the parent item text.
- 2026-10-10 (markdown fixes): Ordered lists each reset their own counter (the bare `ol` selector made every item render as 1.). Nested dash markers align with the parent item text. Underscore emphasis opens and closes against `*` and punctuation, so `_**term**_` is bold italic and `_"quote"_` is italic. Rules recorded under Markdown rules.
- 2026-10-11: A fence at a list item's own indent stays a sibling, so a later nested marker no longer indents that code. Extra blank lines beyond a paragraph break render as extra line breaks. Standalone lists use the same 1rem left margin as paragraphs. The light city background sizes its tile in pixels and remeasures when the container gets a size, so a new tab no longer paints stretched vertical strips.
- 2026-10-22: About page gained an Experience section between Certifications and Site Credits. Same centered h2 + Panel pattern as Site Credits. Vertical timeline grouped by location then business. Theme colors come from --experience-* tokens in space dark/light CSS. Career JSON stays in ExperienceList.ts for edits; canvas painting keeps role text out of the DOM.
- 2026-10-23: Added Quiet Precision theme (see section below).
- 2026-10-23 (quietprecision footer kanji + preview expand): Portrait footer circles show a kanji per section (ABOUT 略, PROJECT 作, BLOG 誌, READING 読, GAME 遊), padded inside the ring. Hovering a project, blog, or game preview for 3s expands its image to 100vw; click/tap the enlarged image to close. Both stay in the quietprecision pack.

## Quiet Precision theme
- New theme pack in source/themes/quietprecision/light and source/themes/quietprecision/dark.
- Stylesheets: quietprecision-light.css (primary) and quietprecision-dark.css (restrained secondary).
- Light: warm off-white page (#faf8f5), white surfaces, near-navy text (#1b2430), cool blue accents (#3a7ca5 / #215a86 / muted teal #4a8a92).
- Dark: cool blue-grey page (#1a2330), slightly lighter panels (#232e3d), soft off-white text (#e8eef4), luminous cool blue accents (#7eb3d4 / #9cc9e0).
- Typography: Outfit for headings, IBM Plex Sans for body. Latin woff2 files added under source/assets/theme/font (existing fonts left in place).
- Accents: quiet circle menu marks and L-bracket panel corners in cool blue only. No red/purple/orange in the paint, even when filenames keep the space pack’s names.
- Backgrounds: solid wash plus very low-opacity seigaiha (wave) and paper grain SVGs inside each mode’s background/images. Earth and city art are not used.
- index.html no-flash script: ACTIVE_THEME = 'quietprecision', so first paint loads themes/quietprecision/{mode}/quietprecision-{mode}.css.
- Layout, hash routing, markdown, and pages are unchanged. Visual rules stay inside the two theme folders.
- Pack entry: source/themes/quietprecision/index.ts. CSS paints #bg-space; the pack does not mount Earth or city.
- 2026-10-23 (theme switch): JS now follows index.html. build.sh emits theme-registry.ts. Verified stylesheet href stays on quietprecision after main.js runs.
- Portrait footer circles: CSS `::after` content paints 略/作/誌/読/遊 from the button `img[alt]`. Sized with container query units and overflow clip so the glyph stays inside the ring with padding. Blank sixth slot stays empty. Light and dark both.
- Preview expand: `preview-expand.ts` bound from the pack `initialiseBackground`. 3s pointer hover on `#projects-list`, `#blog-list`, or `#games-list` cards opens a viewport overlay. The image keeps its aspect ratio, fits inside the viewport, and is centred with `position: fixed` so page scroll does not offset it. Click/tap the image to close. Readings cards are unchanged.
- Game screens on quietprecision: site menu was picking up a black `#bg-space` wash (space-theme leftover). Dual N-Back and Vocabulary Trainer leave `#bg-space` to the theme grain wash (same as About); the game-open rule that hid `#bg-space::before` is gone. JSX runtime no longer stringifies a component `return null` into visible "null" text. Rocket and satellite init WebGL once per theme so state updates do not dispose Earth; the canvas is re-parented onto the new mount node and sized to fill it.
