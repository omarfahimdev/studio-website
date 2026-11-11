export type Motion = 'kinetic-split' | 'typewriter' | 'glitch' | 'elastic' | 'liquid-blur' | 'zoom-shock' | 'neon-pulse' | 'floating-wave';

export type Settings = {
  text: string; motion: Motion; splitUnit: 'char' | 'word' | 'line'; textAlign: 'left' | 'center' | 'right';
  fontFamily: string; fontSize: number; letterSpacing: number; lineHeight: number;
  textTransform: 'uppercase' | 'none' | 'lowercase';
  colorMode: 'solid' | 'gradient' | 'outline'; primaryColor: string; gradColor1: string; gradColor2: string;
  gradAngle: number; strokeColor: string; strokeWidth: number;
  enableGlow: boolean; glowColor: string; glowRadius: number; rgbShift: number;
  width: number; height: number; bgType: 'color' | 'grad' | 'transparent';
  bgColor: string; bgGrad1: string; bgGrad2: string;
  overlayGrid: boolean; overlayVignette: boolean; overlayParticles: boolean;
  duration: number; speed: number;
};

export const DEFAULTS: Settings = {
  text: 'KINETIC MOTION', motion: 'kinetic-split', splitUnit: 'char', textAlign: 'center',
  fontFamily: "'Syne', sans-serif", fontSize: 64, letterSpacing: 2, lineHeight: 1.1, textTransform: 'uppercase',
  colorMode: 'solid', primaryColor: '#ffffff', gradColor1: '#38bdf8', gradColor2: '#ec4899', gradAngle: 90,
  strokeColor: '#ffffff', strokeWidth: 0, enableGlow: false, glowColor: '#38bdf8', glowRadius: 20, rgbShift: 0,
  width: 1280, height: 720, bgType: 'color', bgColor: '#0e1117', bgGrad1: '#111827', bgGrad2: '#050608',
  overlayGrid: false, overlayVignette: true, overlayParticles: true,
  duration: 3.5, speed: 1,
};

export const MOTIONS: { key: Motion; label: string; desc: string; icon: string }[] = [
  { key: 'kinetic-split', label: 'Kinetic Split', desc: 'Staggered 3D reveal', icon: 'Split' },
  { key: 'typewriter', label: 'Typewriter', desc: 'Blinking caret write-on', icon: 'Terminal' },
  { key: 'glitch', label: 'Cyber Glitch', desc: 'RGB split & slice', icon: 'Cpu' },
  { key: 'elastic', label: 'Elastic Pop', desc: 'Overshoot bounce', icon: 'TrendingUp' },
  { key: 'liquid-blur', label: 'Liquid Blur', desc: 'Cinematic lens fade', icon: 'Droplet' },
  { key: 'zoom-shock', label: 'Zoom Shock', desc: 'Scale hit with impact', icon: 'Maximize2' },
  { key: 'neon-pulse', label: 'Neon Pulse', desc: 'Flicker & luminescence', icon: 'Sun' },
  { key: 'floating-wave', label: 'Wave Wiggle', desc: 'Sinusoidal motion', icon: 'Waves' },
];

export const FONTS: [string, string][] = [
  ["'Syne', sans-serif", 'Syne (Bold Display / Modern)'], ["'Anton', sans-serif", 'Anton (Impactful Kinetic)'],
  ["'Montserrat', sans-serif", 'Montserrat (Geometric Heavy)'], ["'Playfair Display', serif", 'Playfair Display (Editorial / Luxury)'],
  ["'Space Grotesk', sans-serif", 'Space Grotesk (Tech / Cyber)'], ["'Bungee', cursive", 'Bungee (Retro Block)'],
  ["'Bebas Neue', sans-serif", 'Bebas Neue (Tall Condensed)'], ["'Righteous', cursive", 'Righteous (Synthwave / Rounded)'],
  ["'Cinzel', serif", 'Cinzel (Cinematic Title)'], ["'Outfit', sans-serif", 'Outfit (Clean Contemporary)'],
];

export const RATIOS: [string, number, number, string][] = [
  ['16:9', 1280, 720, 'Landscape HD'], ['9:16', 720, 1280, 'TikTok / Reels'], ['1:1', 1080, 1080, 'Instagram Post'],
];

// Presets fully reset style (on top of DEFAULTS); stage size, duration and speed are kept.
export const PRESETS: { key: string; label: string; icon: string; cls: string; patch: Partial<Settings> }[] = [
  { key: 'cyberpunk', label: 'Cyberpunk', icon: 'Zap', cls: 'text-yellow-400 border-yellow-500/20', patch: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 62, primaryColor: '#facc15',
    strokeColor: '#00f0ff', strokeWidth: 1, enableGlow: true, glowColor: '#00f0ff', glowRadius: 25, rgbShift: 4,
    overlayGrid: true, bgColor: '#090a0f', motion: 'glitch' } },
  { key: 'minimal', label: 'Minimal', icon: 'Feather', cls: 'text-zinc-300 border-zinc-500/20', patch: {
    fontFamily: "'Playfair Display', serif", fontSize: 58, primaryColor: '#f4f4f5',
    overlayParticles: false, bgColor: '#18181b', motion: 'liquid-blur' } },
  { key: 'hypebeast', label: 'Hypebeast', icon: 'Flame', cls: 'text-red-400 border-red-500/20', patch: {
    fontFamily: "'Anton', sans-serif", fontSize: 80, primaryColor: '#ef4444',
    rgbShift: 2, motion: 'elastic' } },
  { key: 'synthwave', label: 'Synthwave', icon: 'Disc', cls: 'text-pink-400 border-pink-500/20', patch: {
    fontFamily: "'Righteous', cursive", fontSize: 66, colorMode: 'gradient',
    gradColor1: '#f43f5e', gradColor2: '#38bdf8', enableGlow: true, glowColor: '#f43f5e', glowRadius: 30,
    overlayGrid: true, motion: 'floating-wave' } },
  { key: 'cinema', label: 'Cinematic', icon: 'Film', cls: 'text-amber-300 border-amber-500/20', patch: {
    fontFamily: "'Cinzel', serif", fontSize: 56, letterSpacing: 8, primaryColor: '#fef08a',
    enableGlow: true, glowColor: '#ca8a04', glowRadius: 15, motion: 'kinetic-split' } },
];
