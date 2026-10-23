import { onThemeChange } from '../library/theme.ts';

/**
 * Career records. Add or edit objects in this array; the timeline groups
 * by location (Country, State, City) then by Business, newest first.
 * YearMonthEnd: "" means the role is current.
 */
interface ExperienceRecord {
  Role: string;
  Business?: string;
  BusinessURL?: string;
  Country: string;
  State: string;
  City: string;
  YearMonthStart: string;
  YearMonthEnd?: string;
  Description?: string;
  Responsibilities?: string[];
  Activities?: string[];
  Achievement?: string;
}

const EXPERIENCE_RECORDS: ExperienceRecord[] = [
  {
    Role: 'Career break',
    Country: 'International',
    State: 'International',
    City: 'International',
    YearMonthStart: '2025-01',
    YearMonthEnd: '',
    Activities: ['Vibe-coded the Koe speech therapy app for Android', 'Travel'],
  },
  {
    Role: 'Associate Professional Services Consultant',
    Business: 'Mediaocean',
    BusinessURL: 'https://www.mediaocean.com',
    Country: 'Australia',
    State: 'New South Wales',
    City: 'Sydney',
    YearMonthStart: '2023-10',
    YearMonthEnd: '2024-12',
    Description:
      'Junior project manager providing software training for implementation projects and best practice consultations for clients',
  },
  {
    Role: 'Customer Experience Team Lead',
    Business: 'Mediaocean',
    BusinessURL: 'https://www.mediaocean.com',
    Country: 'Australia',
    State: 'New South Wales',
    City: 'Sydney',
    YearMonthStart: '2021-03',
    YearMonthEnd: '2023-09',
    Description:
      'Team lead for 2 separate customer support teams across regional and global software products',
    Responsibilities: [
      'Reporting on KPIs across 8 APAC support teams for monthly meetings',
      'Creating Oracle SQL scripts for client-requested extracts as added revenue and for troubleshooting',
      'Interviewing, training, and mentoring team members',
      'Administrating support portal logins, content, and announcements',
    ],
    Achievement: 'Built Excel Power Pivot model with DAX measures for staff performance monitoring',
  },
  {
    Role: 'Customer Experience Analyst',
    Business: 'Mediaocean',
    BusinessURL: 'https://www.mediaocean.com',
    Country: 'Australia',
    State: 'New South Wales',
    City: 'Sydney',
    YearMonthStart: '2020-03',
    YearMonthEnd: '2021-02',
    Description: 'Same as previous role.',
    Responsibilities: [
      'De facto lead for global software support team',
      'Rebuilt department reports as part of a GoodData to Zendesk migration',
      'Developed a Power BI report for software log and error tracking across versions',
    ],
    Achievement:
      'Led team in cataloging 140+ user permissions and 350+ functions, involving 1,100+ test cases for software documentation',
  },
  {
    Role: 'Support Specialist',
    Business: 'Mediaocean',
    BusinessURL: 'https://www.mediaocean.com',
    Country: 'Australia',
    State: 'New South Wales',
    City: 'Sydney',
    YearMonthStart: '2016-11',
    YearMonthEnd: '2020-02',
    Description:
      'Customer support for advertising planning (Lumina), buying (MD), and BI software (MicroStrategy)',
    Responsibilities: [
      'De facto regional lead for global software support team',
      'Rebuilt department reports as part of a GoodData to Zendesk migration',
      'Delivering monthly national advertising spend data assets from ad agencies to the Standard Media Index',
      'QA testing implementation projects whilst at New York office',
    ],
    Achievement: 'Developed a Power BI report for software log and error tracking across versions',
  },
  {
    Role: 'Career break',
    Country: 'Australia',
    State: 'New South Wales',
    City: 'Sydney',
    YearMonthStart: '2015-08',
    YearMonthEnd: '2016-10',
    Description: 'Gap year after university attending tech meetups, conferences, and classroom short courses',
    Activities: [
      'SQL Course: Level 2b, September 2016',
      'R-Programming - Stage 1, July 2016',
      'Tableau Desktop II: Advanced, June to July 2016',
      'Microsoft Excel: Level 3, June 2016',
      'Microsoft Excel Financial Modelling, May 2016',
    ],
  },
  {
    Role: 'Client Database Officer',
    Business: 'Douglass Hanly Moir Pathology',
    BusinessURL: 'https://www.dhm.com.au',
    Country: 'Australia',
    State: 'New South Wales',
    City: 'Sydney',
    YearMonthStart: '2011-01',
    YearMonthEnd: '2014-02',
    Description: 'Pathology request investigation and account administration for medical professionals',
    Responsibilities: [
      'Monitoring SQL Server batch file jobs to produce company-wide daily worklists',
      'Managed SharePoint Intranet and external website content',
    ],
  },
];

interface RoleView {
  record: ExperienceRecord;
  current: boolean;
}

interface BusinessGroup {
  name: string | undefined;
  url: string | undefined;
  roles: RoleView[];
}

interface LocationGroup {
  country: string;
  state: string;
  city: string;
  businesses: BusinessGroup[];
}

type VeilVariant =
  | 'location'
  | 'sub'
  | 'business'
  | 'role'
  | 'dates'
  | 'body'
  | 'label'
  | 'list'
  | 'achievement';

interface VeilSpec {
  variant: VeilVariant;
  text: string;
  items?: string[];
  hover?: boolean;
  current?: boolean;
  linked?: boolean;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const veils = new WeakMap<HTMLCanvasElement, VeilSpec>();
const linkTargets = new WeakMap<HTMLElement, string>();

function isCurrent(end: string | undefined): boolean {
  return end === undefined || end === '';
}

function sortRecords(records: ExperienceRecord[]): ExperienceRecord[] {
  return [...records].sort((a, b) => {
    const start = b.YearMonthStart.localeCompare(a.YearMonthStart);
    if (start !== 0) return start;
    const ae = isCurrent(a.YearMonthEnd) ? '9999-12' : a.YearMonthEnd;
    const be = isCurrent(b.YearMonthEnd) ? '9999-12' : b.YearMonthEnd;
    return (be ?? '').localeCompare(ae ?? '');
  });
}

function groupRecords(records: ExperienceRecord[]): LocationGroup[] {
  const locations: LocationGroup[] = [];
  const locIndex = new Map<string, LocationGroup>();

  for (const record of sortRecords(records)) {
    const locKey = `${record.Country}\n${record.State}\n${record.City}`;
    let loc = locIndex.get(locKey);
    if (!loc) {
      loc = {
        country: record.Country,
        state: record.State,
        city: record.City,
        businesses: [],
      };
      locIndex.set(locKey, loc);
      locations.push(loc);
    }

    const bizKey = record.Business ?? '';
    let biz = loc.businesses.find((item) => (item.name ?? '') === bizKey);
    if (!biz) {
      biz = { name: record.Business, url: record.BusinessURL, roles: [] };
      loc.businesses.push(biz);
    }
    biz.roles.push({ record, current: isCurrent(record.YearMonthEnd) });
  }

  return locations;
}

function formatYearMonth(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const year = match[1] ?? '';
  const month = Number(match[2]);
  const label = MONTHS[month - 1];
  if (!label) return value;
  return `${label} ${year}`;
}

function formatRange(start: string, end: string | undefined): string {
  const from = formatYearMonth(start);
  if (isCurrent(end)) return `${from}  –  Present`;
  return `${from}  –  ${formatYearMonth(end ?? '')}`;
}

function locationSubline(group: LocationGroup): string {
  const sameState = group.state === group.city;
  const sameCountry = group.country === group.city;
  if (sameState && sameCountry) return '';
  if (sameState) return group.country;
  return `${group.state}  ·  ${group.country}`;
}

function createVeil(spec: VeilSpec, className: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.className = `experience-veil ${className}`;
  canvas.setAttribute('aria-hidden', 'true');
  veils.set(canvas, spec);
  return canvas;
}

interface PaintTokens {
  titleFont: string;
  contentFont: string;
  color: string;
  muted: string;
  accent: string;
  hover: string;
  base: number;
}

function readTokens(): PaintTokens {
  const root = getComputedStyle(document.documentElement);
  const base = Number.parseFloat(root.fontSize) || 16;
  return {
    titleFont: root.getPropertyValue('--title-font').trim() || 'Anta, Helvetica, Verdana',
    contentFont: root.getPropertyValue('--content-font').trim() || 'Cambay, Helvetica, Verdana',
    color: root.getPropertyValue('--content-font-color').trim() || '#fff',
    muted: root.getPropertyValue('--experience-muted').trim() || 'rgba(180, 210, 230, 0.82)',
    accent:
      root.getPropertyValue('--experience-accent').trim() ||
      root.getPropertyValue('--content-font-color-hover').trim() ||
      '#82e1ff',
    hover: root.getPropertyValue('--content-font-color-hover').trim() || '#82e1ff',
    base,
  };
}

function measure(ctx: CanvasRenderingContext2D, text: string, tracking: number): number {
  if (tracking === 0) return ctx.measureText(text).width;
  let width = 0;
  for (let i = 0; i < text.length; i += 1) {
    width += ctx.measureText(text[i] ?? '').width;
    if (i < text.length - 1) width += tracking;
  }
  return width;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  tracking: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  const fits = (value: string): boolean => measure(ctx, value, tracking) <= maxWidth;

  const pushCurrent = (): void => {
    if (current) {
      lines.push(current);
      current = '';
    }
  };

  const splitWord = (word: string): void => {
    let chunk = '';
    for (const ch of word) {
      const trial = chunk + ch;
      if (chunk && !fits(trial)) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk = trial;
      }
    }
    current = chunk;
  };

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (fits(next)) {
      current = next;
      continue;
    }
    pushCurrent();
    if (fits(word)) current = word;
    else splitWord(word);
  }
  pushCurrent();
  return lines.length > 0 ? lines : [''];
}

function fillTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
): void {
  if (tracking === 0) {
    ctx.fillText(text, x, y);
    return;
  }
  let cursor = x;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i] ?? '';
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.restore();
}

interface VeilPaintStyle {
  font: string;
  color: string;
  size: number;
  tracking: number;
  lineHeight: number;
  uppercase: boolean;
  weight: string;
}

function parsePx(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function readCanvasType(
  canvas: HTMLCanvasElement,
  fallbackFamily: string,
  fallbackSize: number,
  fallbackWeight: string,
  fallbackLineHeight: number,
): { family: string; size: number; weight: string; lineHeight: number } {
  const cs = getComputedStyle(canvas);
  const size = parsePx(cs.fontSize) || fallbackSize;
  const family = cs.fontFamily.trim() || fallbackFamily;
  const weight = cs.fontWeight.trim() || fallbackWeight;
  let lineHeight = fallbackLineHeight;
  if (cs.lineHeight.endsWith('px')) {
    const lh = parsePx(cs.lineHeight);
    if (lh > 0 && size > 0) lineHeight = lh / size;
  } else if (cs.lineHeight !== 'normal') {
    const n = Number.parseFloat(cs.lineHeight);
    if (Number.isFinite(n) && n > 0) lineHeight = n;
  }
  return { family, size, weight, lineHeight };
}

function fontDeclaration(style: VeilPaintStyle): string {
  return `${style.weight} ${style.size}px ${style.font}`;
}

function glyphMetrics(
  ctx: CanvasRenderingContext2D,
  sample: string,
  size: number,
): { ascent: number; descent: number } {
  const m = ctx.measureText(sample || 'Ay');
  const ascent = Math.max(
    m.fontBoundingBoxAscent || 0,
    m.actualBoundingBoxAscent || 0,
    size * 0.85,
  );
  const descent = Math.max(
    m.fontBoundingBoxDescent || 0,
    m.actualBoundingBoxDescent || 0,
    size * 0.2,
  );
  return { ascent, descent };
}

function variantStyle(
  variant: VeilVariant,
  tokens: PaintTokens,
  spec: VeilSpec,
): VeilPaintStyle {
  const { base } = tokens;
  switch (variant) {
    case 'location':
      return {
        font: tokens.titleFont,
        color: tokens.accent,
        size: base * 1.05,
        tracking: base * 0.22,
        lineHeight: 1.25,
        uppercase: true,
        weight: '400',
      };
    case 'sub':
      return {
        font: tokens.contentFont,
        color: tokens.muted,
        size: base * 0.82,
        tracking: 0,
        lineHeight: 1.35,
        uppercase: false,
        weight: '400',
      };
    case 'business':
      return {
        font: tokens.titleFont,
        color: spec.hover ? tokens.hover : tokens.accent,
        size: base * 1.02,
        tracking: base * 0.04,
        lineHeight: 1.3,
        uppercase: false,
        weight: '400',
      };
    case 'role':
      return {
        font: tokens.titleFont,
        color: tokens.color,
        size: base * 1.17,
        tracking: 0,
        lineHeight: 1.2,
        uppercase: false,
        weight: '700',
      };
    case 'dates':
      return {
        font: tokens.titleFont,
        color: spec.current ? tokens.accent : tokens.muted,
        size: base * 0.83,
        tracking: 0,
        lineHeight: 1.3,
        uppercase: false,
        weight: '700',
      };
    case 'label':
      return {
        font: tokens.titleFont,
        color: tokens.accent,
        size: base * 0.68,
        tracking: base * 0.16,
        lineHeight: 1.3,
        uppercase: true,
        weight: '400',
      };
    case 'body':
      return {
        font: tokens.contentFont,
        color: tokens.color,
        size: base,
        tracking: 0,
        lineHeight: 1.5,
        uppercase: false,
        weight: '400',
      };
    case 'list':
      return {
        font: tokens.contentFont,
        color: tokens.color,
        size: base,
        tracking: 0,
        lineHeight: 1.5,
        uppercase: false,
        weight: '400',
      };
    case 'achievement':
      return {
        font: tokens.contentFont,
        color: tokens.color,
        size: base,
        tracking: 0,
        lineHeight: 1.5,
        uppercase: false,
        weight: '400',
      };
  }
}

function paintVeil(canvas: HTMLCanvasElement): void {
  const spec = veils.get(canvas);
  if (!spec) return;

  const parent = canvas.parentElement;
  const tokens = readTokens();
  const style = variantStyle(spec.variant, tokens, spec);
  const typed = readCanvasType(canvas, style.font, style.size, style.weight, style.lineHeight);
  style.font = typed.family;
  style.size = typed.size;
  style.weight = typed.weight;
  style.lineHeight = typed.lineHeight;

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const shrink =
    spec.variant === 'dates' ||
    spec.variant === 'location' ||
    spec.variant === 'sub' ||
    spec.variant === 'label';

  const minWidth = tokens.base;
  const unsetWidth = tokens.base * 14.5;
  const parentWidth = parent?.clientWidth ?? 0;
  let available: number;
  if (shrink) {
    available = Math.max(minWidth, parentWidth, unsetWidth);
  } else {
    canvas.style.removeProperty('width');
    const laidOut = canvas.clientWidth;
    available = Math.max(minWidth, laidOut || parentWidth || unsetWidth);
  }

  const probe = canvas.getContext('2d');
  if (!probe) return;
  probe.setTransform(1, 0, 0, 1, 0, 0);
  probe.font = fontDeclaration(style);
  probe.textBaseline = 'alphabetic';
  probe.textAlign = 'left';

  const display = style.uppercase ? spec.text.toUpperCase() : spec.text;
  const padX = spec.variant === 'achievement' ? style.size * 1.15 : 0;
  const maxText = Math.max(minWidth, available - padX);

  type Line = { text: string; x: number; bullet?: boolean; diamond?: boolean };
  const lines: Line[] = [];

  if (spec.variant === 'list' && spec.items) {
    const bulletGap = style.size * 0.95;
    for (const item of spec.items) {
      const wrapped = wrapText(probe, item, maxText - bulletGap, style.tracking);
      wrapped.forEach((text, index) => {
        lines.push({ text, x: bulletGap, bullet: index === 0 });
      });
    }
  } else if (spec.variant === 'achievement') {
    const wrapped = wrapText(probe, display, maxText, style.tracking);
    wrapped.forEach((text, index) => {
      lines.push({ text, x: padX, diamond: index === 0 });
    });
  } else {
    const wrapped = wrapText(probe, display, maxText, style.tracking);
    for (const text of wrapped) lines.push({ text, x: 0 });
  }

  if (lines.length === 0) lines.push({ text: '', x: 0 });

  let contentWidth = 0;
  for (const line of lines) {
    contentWidth = Math.max(contentWidth, line.x + measure(probe, line.text, style.tracking));
  }
  if (spec.variant === 'business' && spec.linked) {
    contentWidth += style.size * 1.1;
  }

  const sample = lines.map((line) => line.text).join(' ') || display || 'Ay';
  const metrics = glyphMetrics(probe, sample, style.size);
  const topPad = spec.variant === 'role' ? style.size * 0.14 : style.size * 0.08;
  const lineHeight = Math.max(style.size * style.lineHeight, metrics.ascent + metrics.descent);
  const cssWidth = shrink ? Math.min(available, Math.ceil(contentWidth + 1)) : available;
  const cssHeight = Math.ceil(topPad + lines.length * lineHeight + metrics.descent * 0.2 + 1);

  canvas.width = Math.max(1, Math.round(cssWidth * dpr));
  canvas.height = Math.max(1, Math.round(cssHeight * dpr));
  if (shrink) {
    canvas.style.width = `${cssWidth}px`;
  } else {
    canvas.style.removeProperty('width');
  }
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.font = fontDeclaration(style);
  ctx.fillStyle = style.color;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  lines.forEach((line, index) => {
    const baseline = topPad + metrics.ascent + index * lineHeight;
    const top = baseline - metrics.ascent;
    if (line.bullet) {
      ctx.save();
      ctx.fillStyle = tokens.accent;
      ctx.beginPath();
      ctx.moveTo(style.size * 0.12, top + style.size * 0.38);
      ctx.lineTo(style.size * 0.42, top + style.size * 0.55);
      ctx.lineTo(style.size * 0.12, top + style.size * 0.72);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    if (line.diamond) {
      drawDiamond(ctx, style.size * 0.38, top + style.size * 0.52, style.size * 0.38, tokens.accent);
    }
    ctx.fillStyle = style.color;
    fillTracked(ctx, line.text, line.x, baseline, style.tracking);
  });

  if (spec.variant === 'business' && spec.linked) {
    const nameWidth = measure(ctx, display, style.tracking);
    const ax = nameWidth + style.size * 0.35;
    const ay = topPad + style.size * 0.14;
    const s = style.size * 0.42;
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.size * 0.08;
    ctx.beginPath();
    ctx.moveTo(ax, ay + s);
    ctx.lineTo(ax + s, ay);
    ctx.lineTo(ax, ay);
    ctx.moveTo(ax + s, ay);
    ctx.lineTo(ax + s, ay + s);
    ctx.stroke();
  }
}

function paintAll(root: HTMLElement): void {
  if (!root.isConnected) return;
  const nodes = root.querySelectorAll('canvas.experience-veil');
  for (const node of nodes) {
    if (node instanceof HTMLCanvasElement) paintVeil(node);
  }
}

function schedulePaint(root: HTMLElement): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => paintAll(root));
  });
}

function whenThemeStylesReady(fn: () => void): void {
  const link = document.getElementById('theme-stylesheet');
  if (link instanceof HTMLLinkElement) {
    link.addEventListener('load', fn, { once: true });
  }
  window.setTimeout(fn, 60);
  window.setTimeout(fn, 220);
}

function el(tag: string, className?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function marker(kind: 'location' | 'business' | 'role', current = false): HTMLElement {
  const node = el('span', `experience-marker experience-marker-${kind}`);
  if (current) node.classList.add('experience-marker-current');
  return node;
}

function row(kind: string, mark: HTMLElement, body: HTMLElement): HTMLElement {
  const node = el('div', `experience-row experience-${kind}`);
  node.append(mark, body);
  return node;
}

function bindCompanyLink(button: HTMLButtonElement, url: string, canvas: HTMLCanvasElement): void {
  linkTargets.set(button, url);
  button.type = 'button';
  button.className = 'experience-business-link';
  button.setAttribute('aria-label', 'Company website');
  button.addEventListener('click', () => {
    const target = linkTargets.get(button);
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
  });
  button.addEventListener('mouseenter', () => {
    const spec = veils.get(canvas);
    if (!spec) return;
    spec.hover = true;
    paintVeil(canvas);
  });
  button.addEventListener('mouseleave', () => {
    const spec = veils.get(canvas);
    if (!spec) return;
    spec.hover = false;
    paintVeil(canvas);
  });
}

function buildRole(view: RoleView): HTMLElement {
  const { record, current } = view;
  const card = el('div', current ? 'experience-role-card experience-role-card-current' : 'experience-role-card');

  const top = el('div', 'experience-role-top');
  top.append(
    createVeil({ variant: 'role', text: record.Role }, 'experience-veil-role'),
    createVeil(
      { variant: 'dates', text: formatRange(record.YearMonthStart, record.YearMonthEnd), current },
      'experience-veil-dates',
    ),
  );
  card.appendChild(top);

  if (record.Description) {
    card.appendChild(createVeil({ variant: 'body', text: record.Description }, 'experience-veil-body'));
  }

  if (record.Responsibilities && record.Responsibilities.length > 0) {
    card.append(
      createVeil({ variant: 'label', text: 'Responsibilities' }, 'experience-veil-label'),
      createVeil({ variant: 'list', text: '', items: record.Responsibilities }, 'experience-veil-list'),
    );
  }

  if (record.Activities && record.Activities.length > 0) {
    card.append(
      createVeil({ variant: 'label', text: 'Activities' }, 'experience-veil-label'),
      createVeil({ variant: 'list', text: '', items: record.Activities }, 'experience-veil-list'),
    );
  }

  if (record.Achievement) {
    card.appendChild(
      createVeil({ variant: 'achievement', text: record.Achievement }, 'experience-veil-achievement'),
    );
  }

  return row('role', marker('role', current), card);
}

function buildBusiness(group: BusinessGroup): HTMLElement {
  const cluster = el('div', group.name ? 'experience-business' : 'experience-business experience-business-solo');

  if (group.name) {
    const canvas = createVeil(
      { variant: 'business', text: group.name, linked: Boolean(group.url) },
      'experience-veil-business',
    );
    const label = el('div', 'experience-business-label');
    if (group.url) {
      const button = document.createElement('button');
      bindCompanyLink(button, group.url, canvas);
      button.appendChild(canvas);
      label.appendChild(button);
    } else {
      label.appendChild(canvas);
    }
    cluster.appendChild(row('business-head', marker('business'), label));
  }

  const roles = el('div', 'experience-roles');
  for (const role of group.roles) roles.appendChild(buildRole(role));
  cluster.appendChild(roles);
  return cluster;
}

function buildLocation(group: LocationGroup): HTMLElement {
  const section = el('section', 'experience-location');
  const text = el('div', 'experience-location-text');
  text.appendChild(createVeil({ variant: 'location', text: group.city }, 'experience-veil-location'));
  const sub = locationSubline(group);
  if (sub) text.appendChild(createVeil({ variant: 'sub', text: sub }, 'experience-veil-sub'));
  section.appendChild(row('location-head', marker('location'), text));

  const track = el('div', 'experience-track');
  for (const business of group.businesses) track.appendChild(buildBusiness(business));
  section.appendChild(track);
  return section;
}

function watchDetach(node: HTMLElement, dispose: () => void): void {
  const outlet = document.getElementById('outlet');
  if (!outlet) return;
  const observer = new MutationObserver(() => {
    if (node.isConnected) return;
    observer.disconnect();
    dispose();
  });
  observer.observe(outlet, { childList: true });
}

export function ExperienceList(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.id = 'experience';

  const heading = document.createElement('center');
  const h2 = document.createElement('h2');
  h2.textContent = 'EXPERIENCE';
  heading.appendChild(h2);
  wrap.appendChild(heading);

  const timeline = el('div', '');
  timeline.id = 'experience-timeline';

  for (const location of groupRecords(EXPERIENCE_RECORDS)) {
    timeline.appendChild(buildLocation(location));
  }

  wrap.appendChild(timeline);

  const resize = new ResizeObserver(() => paintAll(wrap));
  resize.observe(timeline);
  const stopTheme = onThemeChange(() => whenThemeStylesReady(() => paintAll(wrap)));
  const onWinResize = (): void => paintAll(wrap);
  window.addEventListener('resize', onWinResize);

  void document.fonts.ready.then(() => paintAll(wrap));
  schedulePaint(wrap);

  watchDetach(wrap, () => {
    resize.disconnect();
    stopTheme();
    window.removeEventListener('resize', onWinResize);
  });

  return wrap;
}
