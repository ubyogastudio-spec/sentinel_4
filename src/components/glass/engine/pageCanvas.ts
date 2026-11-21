import type { Locale } from '@/i18n';

export interface GlassCopy {
  readonly eyebrow: string;
  readonly line1: string;
  readonly line2: string;
  readonly sub: string;
  readonly open: string;
  readonly read: string;
  readonly copyLeft: string;
  readonly copyRight: string;
  readonly navBrand: string;
  readonly navServices: string;
  readonly navProducts: string;
  readonly navProjects: string;
  readonly navCta: string;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface GlassLayout {
  readonly sectionW: number;
  readonly sectionH: number;
  readonly sideMargin: number;
  readonly topMargin: number;
  readonly bottomMargin: number;
  /** Offset from viewport vertical center to block vertical center (world Y-up). */
  readonly blockOffsetY: number;
  readonly blockW: number;
  readonly blockH: number;
  readonly navH: number;
  readonly navGap: number;
  readonly panelW: number;
  readonly panelH: number;
  readonly scale: number;
  readonly showNavItems: boolean;
  readonly navBrandRect: Rect;
  readonly navItemRects: readonly [Rect, Rect, Rect];
  readonly navCtaRect: Rect;
  readonly eyebrowRect: Rect;
  readonly headlineRect: Rect;
  readonly subRect: Rect;
  readonly subLines: readonly string[];
  readonly pillRect: Rect;
  readonly readRect: Rect;
  readonly copyLeftRect: Rect;
  readonly copyRightRect: Rect;
  readonly fontSizes: {
    readonly nav: number;
    readonly eyebrow: number;
    readonly headline: number;
    readonly sub: number;
    readonly pill: number;
    readonly read: number;
    readonly corner: number;
  };
}

export interface GlassHoverState {
  readonly pillHovered: boolean;
  readonly readHovered: boolean;
  readonly navHoveredIndex: number; // -1 none, 0..2 nav links, 3 nav CTA, 4 brand
}

/**
 * Step 4 font loading rule:
 * Race `document.fonts.load('500 100px Inter')` (plus Cyrillic sample) against a 1500ms timeout.
 * Returns true if loaded within budget, false if timed out (so caller schedules `document.fonts.ready` redraw).
 */
export async function raceGlassFonts(timeoutMs = 1500): Promise<boolean> {
  if (typeof document === 'undefined' || !('fonts' in document)) return true;

  const loadPromise = Promise.all([
    document.fonts.load('500 100px Inter').catch(() => []),
    document.fonts.load('500 16px Inter', 'Өө Үү абв').catch(() => []),
    document.fonts.load('600 16px Inter', 'SENTINEL AI').catch(() => []),
  ]).then(() => true);

  const timerPromise = new Promise<boolean>((resolve) => {
    window.setTimeout(() => resolve(false), timeoutMs);
  });

  return Promise.race([loadPromise, timerPromise]);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function measureGlassLayout(
  measureCtx: CanvasRenderingContext2D,
  sectionW: number,
  sectionH: number,
  copy: GlassCopy,
  locale: Locale,
): GlassLayout {
  const isPhone = sectionW < 640;
  const sideMargin = isPhone ? 16 : sectionW * 0.055;
  const bottomMargin = isPhone ? 16 : sectionH * 0.085;
  const topMargin = isPhone ? 16 : Math.max(sectionH * 0.085, 88);

  const blockW = Math.max(280, sectionW - sideMargin * 2);
  const blockH = Math.max(360, sectionH - topMargin - bottomMargin);
  const blockOffsetY = sectionH / 2 - (topMargin + blockH / 2);

  const scale = blockW / 1730;
  const navH = blockH * 0.108;
  const navGap = 14;
  const panelW = blockW;
  const panelH = Math.max(240, blockH - navH - navGap);

  const navFontSize = Math.max(14, 15 * scale);
  const padX = isPhone ? Math.max(20, panelW * 0.065) : panelW * 0.06;

  // Nav slab measurements
  measureCtx.font = `600 ${Math.max(14, 16 * scale)}px Inter, Sora, sans-serif`;
  const markSize = Math.max(16, 18 * scale);
  const markGap = Math.max(8, 12 * scale);
  const brandW = markSize + markGap + measureCtx.measureText(copy.navBrand).width;
  const navHBox = Math.max(20, navFontSize * 1.4);
  const navY = (navH - navHBox) / 2;
  const navBrandRect: Rect = { x: padX, y: navY, w: brandW, h: navHBox };

  measureCtx.font = `500 ${navFontSize}px Inter, Sora, sans-serif`;
  const navLabels = [copy.navServices, copy.navProducts, copy.navProjects] as const;
  const navGapX = Math.max(20, 34 * scale);
  const navWidths = navLabels.map((lbl) => measureCtx.measureText(lbl).width);
  const totalNavW = navWidths.reduce((a, b) => a + b, 0) + navGapX * 2;
  const ctaW = measureCtx.measureText(copy.navCta).width;
  const navCtaRect: Rect = { x: panelW - padX - ctaW, y: navY, w: ctaW, h: navHBox };

  const availableCenterSpace = navCtaRect.x - (padX + brandW) - 48;
  const showNavItems = panelW >= 640 && availableCenterSpace >= totalNavW;

  let navCursorX = Math.max(padX + brandW + 24, (panelW - totalNavW) / 2);
  if (navCursorX + totalNavW > navCtaRect.x - 24) {
    navCursorX = Math.max(padX + brandW + 20, navCtaRect.x - 24 - totalNavW);
  }
  const navItemRects: [Rect, Rect, Rect] = [
    { x: navCursorX, y: navY, w: navWidths[0], h: navHBox },
    { x: (navCursorX += navWidths[0] + navGapX), y: navY, w: navWidths[1], h: navHBox },
    { x: (navCursorX += navWidths[1] + navGapX), y: navY, w: navWidths[2], h: navHBox },
  ];

  // Panel typography
  const eyebrowSize = Math.max(11, 11 * scale);
  const eyebrowY = isPhone ? panelH * 0.09 : panelH * 0.135;
  measureCtx.font = `500 ${eyebrowSize}px Inter, Sora, sans-serif`;
  const eyebrowW = measureCtx.measureText(copy.eyebrow.toLocaleUpperCase(locale)).width * 1.15;
  const eyebrowRect: Rect = {
    x: padX,
    y: eyebrowY,
    w: Math.min(panelW - padX * 2, eyebrowW),
    h: eyebrowSize * 1.4,
  };

  const headlineSize = isPhone
    ? Math.min(panelW * 0.108, panelH * 0.14)
    : Math.min(panelW * 0.078, panelH * 0.2);
  const headlineY = eyebrowY + eyebrowSize * 1.4 + Math.max(12, 22 * scale);
  const headlineH = headlineSize * 0.97 * 2;
  const headlineRect: Rect = { x: padX, y: headlineY, w: panelW - padX * 2, h: headlineH };

  const subSize = Math.max(14, 19 * scale);
  const subY = headlineY + headlineH + Math.max(14, 26 * scale);
  measureCtx.font = `400 ${subSize}px Inter, Sora, sans-serif`;
  const subMaxW = isPhone ? panelW - padX * 2 : panelW * 0.46;
  const subLines = wrapLines(measureCtx, copy.sub, subMaxW);
  const subLineH = subSize * 1.48;
  const subH = subLines.length * subLineH;
  const subRect: Rect = { x: padX, y: subY, w: subMaxW, h: subH };

  const pillFontSize = Math.max(14, 15 * scale);
  measureCtx.font = `500 ${pillFontSize}px Inter, Sora, sans-serif`;
  const pillTextW = measureCtx.measureText(copy.open).width;
  const pillW = Math.min(
    panelW - padX * 2,
    Math.max(Math.max(116 * scale, 132), pillTextW + Math.max(36, 48 * scale)),
  );
  const pillH = Math.max(40, 44 * scale);
  const pillY = subY + subH + Math.max(18, 30 * scale);
  const pillRect: Rect = { x: padX, y: pillY, w: pillW, h: pillH };

  const readFontSize = Math.max(14, 15 * scale);
  measureCtx.font = `500 ${readFontSize}px Inter, Sora, sans-serif`;
  const readW = measureCtx.measureText(copy.read).width;
  const readY = pillY + pillH + Math.max(16, 20 * scale);
  const readRect: Rect = { x: padX, y: readY, w: Math.min(panelW - padX * 2, readW), h: readFontSize * 1.45 };

  const cornerSize = Math.max(12, 12 * scale);
  measureCtx.font = `400 ${cornerSize}px Inter, Sora, sans-serif`;
  const copyLeftW = measureCtx.measureText(copy.copyLeft).width;
  const copyRightW = measureCtx.measureText(copy.copyRight).width;
  const cornerY = panelH - Math.max(20, 28 * scale) - cornerSize;
  const copyLeftRect: Rect = { x: padX, y: cornerY, w: copyLeftW, h: cornerSize * 1.4 };
  const copyRightRect: Rect = { x: panelW - padX - copyRightW, y: cornerY, w: copyRightW, h: cornerSize * 1.4 };

  return {
    sectionW,
    sectionH,
    sideMargin,
    topMargin,
    bottomMargin,
    blockOffsetY,
    blockW,
    blockH,
    navH,
    navGap,
    panelW,
    panelH,
    scale,
    showNavItems,
    navBrandRect,
    navItemRects,
    navCtaRect,
    eyebrowRect,
    headlineRect,
    subRect,
    subLines,
    pillRect,
    readRect,
    copyLeftRect,
    copyRightRect,
    fontSizes: {
      nav: navFontSize,
      eyebrow: eyebrowSize,
      headline: headlineSize,
      sub: subSize,
      pill: pillFontSize,
      read: readFontSize,
      corner: cornerSize,
    },
  };
}

export function drawNavCanvas(
  canvas: HTMLCanvasElement,
  layout: GlassLayout,
  copy: GlassCopy,
  dpr: number,
  hover: GlassHoverState,
): void {
  const { panelW: w, navH: h, scale } = layout;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // Subtle top bar sheen
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, 'rgba(255,255,255,0.035)');
  bgGrad.addColorStop(1, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const padX = layout.navBrandRect.x;
  const centerY = h / 2;
  const markSize = Math.max(16, 18 * scale);
  const markGap = Math.max(8, 12 * scale);

  // Square brand mark
  ctx.fillStyle = '#05E901';
  drawRoundedRect(ctx, padX, centerY - markSize / 2, markSize, markSize, 4);
  ctx.fill();
  ctx.fillStyle = '#050507';
  ctx.fillRect(padX + markSize * 0.28, centerY - markSize * 0.22, markSize * 0.44, markSize * 0.44);

  // Brand name
  ctx.fillStyle = hover.navHoveredIndex === 4 ? '#05E901' : '#ffffff';
  ctx.font = `600 ${Math.max(14, 16 * scale)}px Inter, Sora, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(copy.navBrand, padX + markSize + markGap, centerY);

  // Nav links (only when room allows)
  ctx.font = `500 ${layout.fontSizes.nav}px Inter, Sora, sans-serif`;
  if (layout.showNavItems) {
    const labels = [copy.navServices, copy.navProducts, copy.navProjects];
    labels.forEach((label, idx) => {
      const rect = layout.navItemRects[idx];
      ctx.fillStyle = hover.navHoveredIndex === idx ? '#ffffff' : 'rgba(255,255,255,0.60)';
      ctx.fillText(label, rect.x, centerY);
    });
  }

  // Right CTA
  ctx.fillStyle = hover.navHoveredIndex === 3 ? '#05E901' : 'rgba(255,255,255,0.88)';
  ctx.fillText(copy.navCta, layout.navCtaRect.x, centerY);
}

export function drawPanelCanvas(
  canvas: HTMLCanvasElement,
  layout: GlassLayout,
  copy: GlassCopy,
  locale: Locale,
  dpr: number,
  hover: GlassHoverState,
): void {
  const { panelW: w, panelH: h } = layout;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // Eyebrow
  const eyebrowText = copy.eyebrow.toLocaleUpperCase(locale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.font = `500 ${layout.fontSizes.eyebrow}px Inter, Sora, sans-serif`;
  ctx.textBaseline = 'top';
  const eyebrowTracking = locale === 'mn' ? layout.fontSizes.eyebrow * 0.06 : layout.fontSizes.eyebrow * 0.2;
  drawTrackedText(ctx, eyebrowText, layout.eyebrowRect.x, layout.eyebrowRect.y, eyebrowTracking);

  // Headline (two lines, gradient fill)
  const hSize = layout.fontSizes.headline;
  ctx.font = `500 ${hSize}px Inter, Sora, sans-serif`;
  ctx.textBaseline = 'top';
  const hGrad = ctx.createLinearGradient(0, layout.headlineRect.y, 0, layout.headlineRect.y + layout.headlineRect.h);
  hGrad.addColorStop(0, '#dcdce0');
  hGrad.addColorStop(1, '#bdbdc3');
  ctx.fillStyle = hGrad;
  const hTrack = hSize * (locale === 'mn' ? -0.02 : -0.045);
  const lineAdvance = hSize * 0.97;
  drawTrackedText(ctx, copy.line1, layout.headlineRect.x, layout.headlineRect.y, hTrack);
  drawTrackedText(ctx, copy.line2, layout.headlineRect.x, layout.headlineRect.y + lineAdvance, hTrack);

  // Sub copy
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.font = `400 ${layout.fontSizes.sub}px Inter, Sora, sans-serif`;
  ctx.textBaseline = 'top';
  const subLineH = layout.fontSizes.sub * 1.48;
  layout.subLines.forEach((line, idx) => {
    ctx.fillText(line, layout.subRect.x, layout.subRect.y + idx * subLineH);
  });

  // Pill button
  const { pillRect } = layout;
  ctx.fillStyle = hover.pillHovered ? '#05E901' : '#E8E8EC';
  drawRoundedRect(ctx, pillRect.x, pillRect.y, pillRect.w, pillRect.h, 6);
  ctx.fill();

  ctx.fillStyle = '#0A0A0A';
  ctx.font = `500 ${layout.fontSizes.pill}px Inter, Sora, sans-serif`;
  ctx.textBaseline = 'middle';
  const pillTextW = ctx.measureText(copy.open).width;
  ctx.fillText(copy.open, pillRect.x + (pillRect.w - pillTextW) / 2, pillRect.y + pillRect.h / 2 + 0.5);

  // "Read the principles ->"
  ctx.fillStyle = '#ffffff';
  ctx.font = `500 ${layout.fontSizes.read}px Inter, Sora, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(copy.read, layout.readRect.x, layout.readRect.y);
  if (hover.readHovered) {
    ctx.fillRect(layout.readRect.x, layout.readRect.y + layout.fontSizes.read * 1.25, layout.readRect.w, 1.5);
  }

  // Corner labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.font = `400 ${layout.fontSizes.corner}px Inter, Sora, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(copy.copyLeft, layout.copyLeftRect.x, layout.copyLeftRect.y);
  if (layout.copyRightRect.x > layout.copyLeftRect.x + layout.copyLeftRect.w + 16) {
    ctx.fillText(copy.copyRight, layout.copyRightRect.x, layout.copyRightRect.y);
  }
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
): void {
  if (Math.abs(letterSpacing) < 0.05) {
    ctx.fillText(text, x, y);
    return;
  }
  let cursor = x;
  for (const char of text) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + letterSpacing;
  }
}
