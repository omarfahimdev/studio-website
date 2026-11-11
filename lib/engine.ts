import type { Settings } from './config';

export type Particle = { x: number; y: number; r: number; a: number; vx: number; vy: number };

export const makeParticles = (w: number, h: number): Particle[] =>
  Array.from({ length: 45 }, () => ({
    x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.8,
    a: Math.random() * 0.4 + 0.1, vx: (Math.random() - 0.5) * 0.4, vy: -Math.random() * 0.5 - 0.1,
  }));

const outBack = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);

type Item = { text: string; index: number; x: number; y: number; width: number };

function layout(ctx: CanvasRenderingContext2D, s: Settings) {
  let raw = s.text || 'TITLE';
  if (s.textTransform === 'uppercase') raw = raw.toUpperCase();
  if (s.textTransform === 'lowercase') raw = raw.toLowerCase();
  const lines = raw.split('\n');
  const items: Item[] = [];
  const lh = s.fontSize * s.lineHeight;
  const startY = s.height / 2 - ((lines.length - 1) * lh) / 2;
  const startX = (w: number) =>
    s.textAlign === 'left' ? s.width * 0.12 : s.textAlign === 'right' ? s.width * 0.88 - w : s.width / 2 - w / 2;
  const m = (t: string) => ctx.measureText(t).width;
  let idx = 0;

  ctx.save();
  ctx.font = `${s.fontSize}px ${s.fontFamily}`;
  lines.forEach((line, li) => {
    const y = startY + li * lh;
    if (s.splitUnit === 'line') {
      items.push({ text: line, index: idx++, x: startX(m(line) + line.length * s.letterSpacing), y, width: m(line) });
    } else if (s.splitUnit === 'word') {
      const words = line.split(' ');
      const space = m(' ') + s.letterSpacing;
      const widths = words.map((w) => m(w) + w.length * s.letterSpacing);
      let x = startX(widths.reduce((a, b) => a + b, 0) + Math.max(0, words.length - 1) * space);
      words.forEach((w, i) => { items.push({ text: w, index: idx++, x, y, width: widths[i] }); x += widths[i] + space; });
    } else {
      const chars = line.split('');
      const widths = chars.map((c) => m(c) + s.letterSpacing);
      let x = startX(widths.reduce((a, b) => a + b, 0));
      chars.forEach((c, i) => { items.push({ text: c, index: idx++, x, y, width: widths[i] }); x += widths[i]; });
    }
  });
  ctx.restore();
  return { items, total: Math.max(1, idx) };
}

function glyph(ctx: CanvasRenderingContext2D, s: Settings, text: string, x: number) {
  if (s.colorMode === 'outline') {
    ctx.strokeStyle = s.strokeColor;
    ctx.lineWidth = Math.max(1, s.strokeWidth || 2);
    ctx.strokeText(text, x, 0);
  } else {
    ctx.fillText(text, x, 0);
    if (s.strokeWidth > 0) { ctx.strokeStyle = s.strokeColor; ctx.lineWidth = s.strokeWidth; ctx.strokeText(text, x, 0); }
  }
}

function drawText(ctx: CanvasRenderingContext2D, s: Settings, t: number) {
  const { items, total } = layout(ctx, s);
  const progress = Math.min(t / s.duration, 1);

  let fill: string | CanvasGradient = s.primaryColor;
  if (s.colorMode === 'gradient') {
    const r = (s.gradAngle * Math.PI) / 180, cx = s.width / 2, cy = s.height / 2;
    const g = ctx.createLinearGradient(cx - Math.cos(r) * 300, cy - Math.sin(r) * 300, cx + Math.cos(r) * 300, cy + Math.sin(r) * 300);
    g.addColorStop(0, s.gradColor1);
    g.addColorStop(1, s.gradColor2);
    fill = g;
  }

  for (const item of items) {
    ctx.save();
    ctx.font = `${s.fontSize}px ${s.fontFamily}`;
    ctx.textBaseline = 'middle';

    const delay = (item.index / total) * 0.55;
    const lp = Math.min(Math.max((progress - delay) / 0.45, 0), 1);
    let x = item.x, y = item.y, scale = 1, rotate = 0, opacity = 1, blur = 0, skew = 0;

    switch (s.motion) {
      case 'kinetic-split': {
        const e = outBack(lp);
        opacity = lp; y = item.y + (1 - e) * 90; rotate = (1 - e) * (item.index % 2 === 0 ? 0.35 : -0.35); scale = 0.5 + e * 0.5;
        break;
      }
      case 'typewriter':
        opacity = lp > 0.05 ? 1 : 0;
        if (item.index === Math.floor(progress * total) && progress < 0.98 && Math.sin(t * 12) > 0) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(item.x + item.width + 2, item.y - s.fontSize * 0.45, 10, s.fontSize * 0.9);
        }
        break;
      case 'glitch':
        opacity = lp > 0.1 ? 1 : 0;
        if (progress > 0.2 && Math.random() < 0.25) { x += (Math.random() - 0.5) * 16; skew = (Math.random() - 0.5) * 0.4; }
        break;
      case 'elastic':
        scale = Math.max(0, outBack(lp)); opacity = Math.min(lp * 2, 1);
        break;
      case 'liquid-blur': {
        const e = outCubic(lp);
        opacity = e; y = item.y + (1 - e) * 40; blur = (1 - e) * 18;
        break;
      }
      case 'zoom-shock': {
        const e = outCubic(lp);
        scale = 3 - e * 2; opacity = e;
        if (lp > 0.8 && lp < 0.95) y += Math.sin(t * 45) * 4;
        break;
      }
      case 'neon-pulse':
        opacity = (lp < 0.9 ? (Math.random() > 0.3 ? 1 : 0.1) : 1) * lp;
        break;
      case 'floating-wave': {
        const wave = Math.sin(t * 3.5 + item.index * 0.5);
        opacity = outCubic(lp); y = item.y + wave * 16; rotate = wave * 0.08;
        break;
      }
    }

    if (blur > 0.5) ctx.filter = `blur(${blur}px)`;
    ctx.shadowColor = s.enableGlow ? s.glowColor : 'transparent';
    ctx.shadowBlur = s.enableGlow ? s.glowRadius : 0;
    ctx.globalAlpha = Math.max(0, Math.min(opacity, 1));
    ctx.translate(x + item.width / 2, y);
    ctx.rotate(rotate);
    ctx.scale(scale, scale);
    if (skew !== 0) ctx.transform(1, 0, skew, 1, 0, 0);

    const shift = Math.max(s.rgbShift, s.motion === 'glitch' ? 3 : 0);
    if (shift > 0) {
      ctx.fillStyle = 'rgba(255, 0, 80, 0.7)'; glyph(ctx, s, item.text, -item.width / 2 - shift);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.7)'; glyph(ctx, s, item.text, -item.width / 2 + shift);
    }
    ctx.fillStyle = fill;
    glyph(ctx, s, item.text, -item.width / 2);
    ctx.restore();
  }
}

export function renderFrame(ctx: CanvasRenderingContext2D, s: Settings, t: number, particles: Particle[]) {
  const { width: W, height: H } = s;
  ctx.clearRect(0, 0, W, H);

  if (s.bgType === 'color') { ctx.fillStyle = s.bgColor; ctx.fillRect(0, 0, W, H); }
  else if (s.bgType === 'grad') {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, s.bgGrad1); g.addColorStop(1, s.bgGrad2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  if (s.overlayGrid) {
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
  }

  if (s.overlayParticles) {
    ctx.save();
    for (const p of particles) {
      p.y += p.vy; p.x += p.vx;
      if (p.y < 0) p.y = H;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  drawText(ctx, s, t);

  if (s.overlayVignette) {
    const r = Math.max(W, H) * 0.7;
    const g = ctx.createRadialGradient(W / 2, H / 2, r * 0.2, W / 2, H / 2, r);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
}
