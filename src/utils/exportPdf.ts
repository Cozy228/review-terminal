import type { jsPDF as JsPdf } from 'jspdf';

type PdfPageFormat = 'a4' | 'letter';
type CoverFitMode = 'contain' | 'cover';
type CaptureStrategy = 'auto' | 'sections' | 'single';

export interface PdfExportProgress {
  stage: 'prepare' | 'render' | 'assemble' | 'download';
  current?: number;
  total?: number;
}

export interface DownloadPdfFromElementOptions {
  root: HTMLElement;
  filename: string;
  cover?: HTMLElement | null;
  coverFit?: CoverFitMode;
  coverMarginMm?: number;
  coverDisclaimerLines?: string[];
  coverSignature?: string;
  pageFormat?: PdfPageFormat;
  marginMm?: number;
  sectionSelector?: string;
  captureStrategy?: CaptureStrategy;
  scale?: number;
  maxCanvasPixels?: number;
  maxRootCanvasPixels?: number;
  jpegQuality?: number;
  onProgress?: (progress: PdfExportProgress) => void;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseCssColorToRgb(color: string): [number, number, number] | null {
  const hexMatch = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1].toLowerCase();
    if (hex.length === 3) {
      const r = Number.parseInt(hex[0] + hex[0], 16);
      const g = Number.parseInt(hex[1] + hex[1], 16);
      const b = Number.parseInt(hex[2] + hex[2], 16);
      return [r, g, b];
    }
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }

  const rgbMatch = color
    .trim()
    .match(/^rgba?\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)(?:\s*[,\s]\s*(\d*\.?\d+))?\s*\)$/i);
  if (!rgbMatch) return null;
  const r = Number(rgbMatch[1]);
  const g = Number(rgbMatch[2]);
  const b = Number(rgbMatch[3]);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
}

function resolveExportBackgroundColor(root: HTMLElement): [number, number, number] | null {
  let el: HTMLElement | null = root;
  while (el) {
    const bg = getComputedStyle(el).backgroundColor;
    const rgb = parseCssColorToRgb(bg);
    if (rgb && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return rgb;
    el = el.parentElement;
  }
  const bodyRgb = parseCssColorToRgb(getComputedStyle(document.body).backgroundColor);
  return bodyRgb;
}

function rgbToCss(rgb: [number, number, number] | null): string | null {
  if (!rgb) return null;
  const [r, g, b] = rgb;
  return `rgb(${r}, ${g}, ${b})`;
}

async function waitForFonts(): Promise<void> {
  const fonts = (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts;
  if (fonts?.ready) {
    await Promise.race([
      fonts.ready,
      new Promise<void>((resolve) => window.setTimeout(resolve, 2500)),
    ]);
  }
}

function waitForImage(img: HTMLImageElement, timeoutMs: number): Promise<void> {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();

  return new Promise((resolve) => {
    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      img.removeEventListener('load', onComplete);
      img.removeEventListener('error', onComplete);
    };
    const onComplete = () => {
      cleanup();
      resolve();
    };

    img.addEventListener('load', onComplete, { once: true });
    img.addEventListener('error', onComplete, { once: true });

    window.setTimeout(() => {
      cleanup();
      resolve();
    }, timeoutMs);
  });
}

async function waitForImages(root: HTMLElement, timeoutMs: number): Promise<void> {
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
  if (images.length === 0) return;
  await Promise.all(images.map((img) => waitForImage(img, timeoutMs)));
}

function appendExportStyles(doc: Document): void {
  const style = doc.createElement('style');
  style.setAttribute('data-export-pdf', 'true');
  style.textContent = `
    * { animation: none !important; transition: none !important; }
    .scanline::before { display: none !important; }
    .command-caret { display: none !important; }
    .summary-menu, .exec-menu { display: none !important; }
    .retro-section { opacity: 1 !important; visibility: visible !important; transform: none !important; }
    .stat-row { grid-template-columns: 180px minmax(0, 1fr) max-content !important; }
    .stat-row > * { min-width: 0 !important; }
    .stat-row .value { margin-left: 0 !important; }
    .stat-row .spark { letter-spacing: 0 !important; white-space: nowrap !important; }
    input, textarea, select { display: none !important; }
  `;
  doc.head.appendChild(style);
}

function computeCaptureScale(element: HTMLElement, requestedScale: number, maxCanvasPixels: number): number {
  const rect = element.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const maxScale = Math.sqrt(maxCanvasPixels / (width * height));
  const next = Math.min(requestedScale, maxScale);
  return Math.max(0.5, next);
}

async function canvasToJpegBytes(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to encode canvas to JPEG'));
      },
      'image/jpeg',
      quality
    );
  });

  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

function applyCoverDisclaimer(doc: Document, coverClone: HTMLElement, lines: string[], signature: string | undefined): void {
  const prompt = coverClone.querySelector<HTMLElement>('.idle-prompt');
  if (prompt) {
    prompt.style.opacity = '1';
    prompt.style.pointerEvents = 'none';
    prompt.style.transition = 'none';

    while (prompt.firstChild) {
      prompt.removeChild(prompt.firstChild);
    }

    const container = doc.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '10px';
    container.style.maxWidth = '860px';
    container.style.textAlign = 'center';
    container.style.lineHeight = '1.35';

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const div = doc.createElement('div');
      div.textContent = line;

      if (i === 0) {
        div.style.color = 'var(--accent-highlight)';
        div.style.letterSpacing = '0.14em';
        div.style.fontWeight = '700';
      } else {
        div.style.color = 'var(--text-secondary)';
        div.style.fontSize = '0.9rem';
      }

      container.appendChild(div);
    }

    prompt.appendChild(container);
  }

  if (signature) {
    const sign = doc.createElement('div');
    sign.textContent = signature;
    sign.style.position = 'absolute';
    sign.style.right = '32px';
    sign.style.bottom = '24px';
    sign.style.zIndex = '30';
    sign.style.pointerEvents = 'none';
    sign.style.color = 'var(--text-secondary)';
    sign.style.fontSize = '0.8rem';
    sign.style.letterSpacing = '0.08em';
    coverClone.appendChild(sign);
  }
}

async function withTemporaryStyle<T>(
  el: HTMLElement,
  patch: Partial<Record<'display' | 'opacity' | 'pointerEvents', string>>,
  fn: () => Promise<T>
): Promise<T> {
  const prevDisplay = el.style.display;
  const prevOpacity = el.style.opacity;
  const prevPointerEvents = el.style.pointerEvents;

  if (patch.display !== undefined) el.style.display = patch.display;
  if (patch.opacity !== undefined) el.style.opacity = patch.opacity;
  if (patch.pointerEvents !== undefined) el.style.pointerEvents = patch.pointerEvents;

  try {
    return await fn();
  } finally {
    el.style.display = prevDisplay;
    el.style.opacity = prevOpacity;
    el.style.pointerEvents = prevPointerEvents;
  }
}

function shrinkProgressBars(doc: Document, maxChars: number): void {
  const barEls = Array.from(doc.querySelectorAll<HTMLElement>('[data-bar]'));
  for (const el of barEls) {
    const raw = el.dataset.finalBar ?? el.dataset.bar ?? el.textContent ?? '';
    const bar = raw.trim();
    const fill = Array.from(bar).filter((ch) => ch === '█').length;
    const empty = Array.from(bar).filter((ch) => ch === '░').length;
    const total = fill + empty;
    if (total <= 0) continue;

    const target = Math.max(1, Math.min(total, maxChars));
    const nextFill = Math.round((fill / total) * target);
    const nextEmpty = target - nextFill;
    const nextBar = '█'.repeat(nextFill) + '░'.repeat(nextEmpty);
    el.textContent = nextBar;
  }
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function fillPageBackground(
  pdf: JsPdf,
  rgb: [number, number, number] | null
): void {
  if (!rgb) return;
  const [r, g, b] = rgb;
  pdf.setFillColor(r, g, b);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
}

export async function downloadPdfFromElement({
  root,
  filename,
  cover,
  coverFit = 'contain',
  coverMarginMm = 0,
  coverDisclaimerLines = [
    'DISCLAIMER',
    'This report is generated from an interactive demo UI.',
    'Data may be synthetic and for visualization purposes only.',
  ],
  coverSignature,
  pageFormat = 'a4',
  marginMm = 10,
  sectionSelector = '.retro-section',
  captureStrategy = 'auto',
  scale = 1.25,
  maxCanvasPixels = 8_000_000,
  maxRootCanvasPixels = 22_000_000,
  jpegQuality = 0.85,
  onProgress,
}: DownloadPdfFromElementOptions): Promise<void> {
  if (!root.isConnected) {
    throw new Error('PDF export root element is not connected to the DOM');
  }

  onProgress?.({ stage: 'prepare' });
  await waitForFonts();
  await waitForImages(root, 12_000);
  await nextAnimationFrame();

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const contentBackgroundRgb = resolveExportBackgroundColor(root);
  const coverBackgroundRgb = cover ? resolveExportBackgroundColor(cover) : null;
  const contentBackgroundCss = rgbToCss(contentBackgroundRgb);
  const coverBackgroundCss = rgbToCss(coverBackgroundRgb ?? contentBackgroundRgb);

  const sections = Array.from(root.querySelectorAll<HTMLElement>(sectionSelector)).filter((el) => {
    const display = getComputedStyle(el).display;
    return display !== 'none';
  });
  if (sections.length === 0) {
    throw new Error(`No export sections found for selector: ${sectionSelector}`);
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageFormat,
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - marginMm * 2;
  const contentHeight = pageHeight - marginMm * 2;
  const gapMm = 4;

  let cursorY = marginMm;

  if (cover && cover.isConnected) {
    const markerAttr = 'data-export-capture';
    cover.setAttribute(markerAttr, 'cover');

    try {
      const coverScale = computeCaptureScale(cover, scale, maxCanvasPixels);
      const coverCanvas = await withTemporaryStyle(
        cover,
        {
          display: '',
          opacity: '0',
          pointerEvents: 'none',
        },
        async () => {
          await nextAnimationFrame();
          const rect = cover.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) {
            throw new Error('PDF cover element has zero size after reveal');
          }

          return html2canvas(cover, {
            scale: coverScale,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: coverBackgroundCss,
            onclone: (doc) => {
              appendExportStyles(doc);
              const coverClone = doc.querySelector<HTMLElement>(`[${markerAttr}="cover"]`);
              if (coverClone) {
                coverClone.style.display = '';
                coverClone.style.opacity = '1';
                coverClone.style.visibility = 'visible';
                applyCoverDisclaimer(doc, coverClone, coverDisclaimerLines, coverSignature);
              }
            },
          });
        }
      );

      fillPageBackground(pdf, coverBackgroundRgb ?? contentBackgroundRgb);

      const coverData = await canvasToJpegBytes(coverCanvas, jpegQuality);
      const coverAreaWidth = pageWidth - coverMarginMm * 2;
      const coverAreaHeight = pageHeight - coverMarginMm * 2;
      const ratio = coverCanvas.width / coverCanvas.height;

      let coverW = coverAreaWidth;
      let coverH = coverW / ratio;
      if (coverFit === 'cover') {
        coverH = coverAreaHeight;
        coverW = coverH * ratio;
      } else if (coverH > coverAreaHeight) {
        coverH = coverAreaHeight;
        coverW = coverH * ratio;
      }

      const coverX = (pageWidth - coverW) / 2;
      const coverY = (pageHeight - coverH) / 2;
      pdf.addImage(coverData, 'JPEG', coverX, coverY, coverW, coverH, undefined, 'FAST');

      pdf.addPage();
      fillPageBackground(pdf, contentBackgroundRgb);
      cursorY = marginMm;
      coverCanvas.width = 0;
      coverCanvas.height = 0;
    } finally {
      cover.removeAttribute(markerAttr);
    }
  } else {
    fillPageBackground(pdf, contentBackgroundRgb);
  }

  const rootScale = computeCaptureScale(root, scale, maxRootCanvasPixels);
  const useSingleCapture =
    captureStrategy === 'single' || (captureStrategy === 'auto' && rootScale >= 0.85);

  if (useSingleCapture) {
    onProgress?.({ stage: 'render', current: 1, total: 1 });
    const canvas = await html2canvas(root, {
      scale: rootScale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: contentBackgroundCss,
      onclone: (doc) => {
        appendExportStyles(doc);
        shrinkProgressBars(doc, 56);
      },
    });

    onProgress?.({ stage: 'assemble', current: 1, total: 1 });

    const imgWidthMm = contentWidth;
    let sourceY = 0;
    let isFirstPage = true;

    while (sourceY < canvas.height) {
      const availableHeightMm = isFirstPage ? marginMm + contentHeight - cursorY : contentHeight;
      const availableHeightPx = Math.max(1, Math.floor((canvas.width * availableHeightMm) / contentWidth));
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.min(availableHeightPx, canvas.height - sourceY);
      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to acquire 2D context for PDF slice canvas');
      }

      ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);

      const sliceData = await canvasToJpegBytes(sliceCanvas, jpegQuality);
      const sliceHeightMm = (sliceCanvas.height * imgWidthMm) / sliceCanvas.width;
      const destY = isFirstPage ? cursorY : marginMm;
      pdf.addImage(sliceData, 'JPEG', marginMm, destY, imgWidthMm, sliceHeightMm, undefined, 'FAST');

      const consumedPx = sliceCanvas.height;
      sliceCanvas.width = 0;
      sliceCanvas.height = 0;

      sourceY += consumedPx;
      if (sourceY < canvas.height) {
        pdf.addPage();
        fillPageBackground(pdf, contentBackgroundRgb);
        cursorY = marginMm;
        isFirstPage = false;
      } else {
        cursorY = destY + sliceHeightMm + gapMm;
      }

      await nextAnimationFrame();
    }

    canvas.width = 0;
    canvas.height = 0;

    onProgress?.({ stage: 'download' });
    const safeName = isNonEmptyString(filename) ? filename.trim() : 'report.pdf';
    pdf.save(safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`);
    return;
  }

  for (let index = 0; index < sections.length; index += 1) {
    onProgress?.({ stage: 'render', current: index + 1, total: sections.length });

    const section = sections[index];
    const sectionScale = computeCaptureScale(section, scale, maxCanvasPixels);
    const canvas = await html2canvas(section, {
      scale: sectionScale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: contentBackgroundCss,
      onclone: (doc) => {
        appendExportStyles(doc);
        shrinkProgressBars(doc, 56);
      },
    });

    const imgWidthMm = contentWidth;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    onProgress?.({ stage: 'assemble', current: index + 1, total: sections.length });

    const remainingHeight = marginMm + contentHeight - cursorY;
    const needsNewPage = imgHeightMm > remainingHeight && cursorY > marginMm;
    if (needsNewPage) {
      pdf.addPage();
      fillPageBackground(pdf, contentBackgroundRgb);
      cursorY = marginMm;
    }

    if (imgHeightMm <= contentHeight) {
      const imgData = await canvasToJpegBytes(canvas, jpegQuality);
      pdf.addImage(imgData, 'JPEG', marginMm, cursorY, imgWidthMm, imgHeightMm, undefined, 'FAST');
      cursorY += imgHeightMm + gapMm;
      canvas.width = 0;
      canvas.height = 0;
      await nextAnimationFrame();
      continue;
    }

    const sliceHeightPx = Math.max(1, Math.floor((canvas.width * contentHeight) / contentWidth));
    let sourceY = 0;

    while (sourceY < canvas.height) {
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - sourceY);
      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to acquire 2D context for PDF slice canvas');
      }

      ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);

      const sliceData = await canvasToJpegBytes(sliceCanvas, jpegQuality);
      const sliceHeightMm = (sliceCanvas.height * imgWidthMm) / sliceCanvas.width;
      pdf.addImage(sliceData, 'JPEG', marginMm, marginMm, imgWidthMm, sliceHeightMm, undefined, 'FAST');

      sliceCanvas.width = 0;
      sliceCanvas.height = 0;

      sourceY += sliceHeightPx;
      if (sourceY < canvas.height) {
        pdf.addPage();
        fillPageBackground(pdf, contentBackgroundRgb);
        cursorY = marginMm;
      } else {
        cursorY = marginMm + sliceHeightMm + gapMm;
      }

      await nextAnimationFrame();
    }

    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress?.({ stage: 'download' });
  const safeName = isNonEmptyString(filename) ? filename.trim() : 'report.pdf';
  pdf.save(safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`);
}
