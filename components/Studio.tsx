'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlignCenter, AlignLeft, AlignRight, Camera, Check as CheckIcon, CircleDot, Cpu, Disc, Droplet, Eye, Feather, Film,
  Flame, LayoutTemplate, Maximize2, Palette, Pause, Play, Repeat, RotateCcw, Sparkles, Split, Sun, Terminal,
  TrendingUp, Type, Video, Waves, Zap, type LucideIcon,
} from 'lucide-react';
import { DEFAULTS, FONTS, MOTIONS, PRESETS, RATIOS, type Settings } from '@/lib/config';
import { usePlayer } from '@/hooks/usePlayer';
import { Check, ColorField, Label, Seg, Select, Slider, Toggle, selectCls } from './ui';

const ICONS: Record<string, LucideIcon> = { Zap, Feather, Flame, Disc, Film, Split, Terminal, Cpu, TrendingUp, Droplet, Maximize2, Sun, Waves };
const TABS = [['text', 'Text & Motion', Type], ['style', 'Style & Glow', Palette], ['stage', 'Stage', LayoutTemplate]] as const;
type Tab = (typeof TABS)[number][0];
const hr = 'pt-2 border-t border-studio-800 space-y-3';
const ic = 'w-3.5 h-3.5 text-indigo-400';
const fmt = (t: number) => `00:${String(Math.floor(t)).padStart(2, '0')}.${String(Math.floor((t % 1) * 100)).padStart(2, '0')}`;

export default function Studio() {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [tab, setTab] = useState<Tab>('text');
  const [toast, setToast] = useState<{ title: string; msg: string } | null>(null);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = useCallback((title: string, msg: string) => {
    clearTimeout(toastTimer.current);
    setToast({ title, msg });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const player = usePlayer(canvasRef, s, notify);
  const set = (patch: Partial<Settings>, restart = false) => { setS((v) => ({ ...v, ...patch })); if (restart) player.restart(); };

  // Fit canvas inside the stage
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setScale(Math.min((el.clientWidth - 48) / s.width, (el.clientHeight - 48) / s.height, 1)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [s.width, s.height]);

  // Timeline DOM is updated directly so playback doesn't re-render React at 60fps
  useEffect(() => player.subscribe((t) => {
    const r = Math.min(t / s.duration, 1) * 100;
    if (fillRef.current) fillRef.current.style.width = `${r}%`;
    if (headRef.current) headRef.current.style.left = `${r}%`;
    if (timeRef.current) timeRef.current.textContent = fmt(t);
  }), [player.subscribe, s.duration]);

  // Keyboard shortcuts: Space = play/pause, R = restart, L = loop
  useEffect(() => {
    const skip = (e: KeyboardEvent) => /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName) || e.metaKey || e.ctrlKey;
    const down = (e: KeyboardEvent) => {
      if (skip(e)) return;
      if (e.code === 'Space') { e.preventDefault(); player.toggle(); }
      else if (e.key === 'r') player.restart();
      else if (e.key === 'l') player.toggleLoop();
    };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space' && !skip(e)) e.preventDefault(); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [player.toggle, player.restart, player.toggleLoop]);

  const scrub = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    player.seek(Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1)));
  };

  const motion = MOTIONS.find((m) => m.key === s.motion)!;

  return (
    <>
      {/* TOP BAR */}
      <header className="min-h-14 py-2 flex-wrap gap-2 border-b border-studio-800 bg-studio-900 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
            KineticForge
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Studio v2.5</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">Presets:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {PRESETS.map((p) => {
              const Icon = ICONS[p.icon];
              return (
                <button key={p.key}
                  onClick={() => {
                    set({ ...DEFAULTS, ...p.patch, text: s.text, width: s.width, height: s.height, duration: s.duration, speed: s.speed }, true);
                    notify('Preset Loaded', `Switched styling to ${p.label.toUpperCase()}`);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md bg-studio-800 hover:bg-studio-700 border transition-all font-medium flex items-center gap-1.5 ${p.cls}`}>
                  <Icon className="w-3 h-3" /> {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={player.snapshot} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-700 text-xs font-medium text-gray-200 border border-studio-700">
            <Camera className="w-3.5 h-3.5" /> Snapshot PNG
          </button>
          <button onClick={player.toggleRecording} disabled={player.progress !== null} title="Export video (MP4)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg transition-all ${
              player.recording ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'}`}>
            {player.recording ? <CircleDot className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
            {player.progress !== null ? `Exporting ${Math.round(player.progress * 100)}%` : player.recording ? 'Recording...' : 'Export MP4'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-96 order-2 lg:order-1 bg-studio-900 border-t lg:border-t-0 lg:border-r border-studio-800 flex flex-col shrink-0 lg:min-h-0 z-10">
          <div className="flex border-b border-studio-800 bg-studio-850 p-1 gap-1">
            {TABS.map(([k, label, Icon]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  tab === k ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 lg:overflow-y-auto overscroll-contain p-4 space-y-5">
            {tab === 'text' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label icon={<Sparkles className={ic} />}>Motion Text</Label>
                    <span className="text-[10px] text-gray-400">Multi-line supported</span>
                  </div>
                  <textarea rows={2} value={s.text} placeholder="Enter your animated title..."
                    onChange={(e) => set({ text: e.target.value }, true)}
                    className="w-full bg-studio-950 border border-studio-700 focus:border-indigo-500 rounded-lg p-2.5 text-sm tracking-wide text-white focus:outline-none resize-y" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label icon={<Sparkles className={ic} />}>Motion Animation Type</Label>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">{motion.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {MOTIONS.map((m) => {
                      const Icon = ICONS[m.icon];
                      return (
                        <button key={m.key} onClick={() => set({ motion: m.key }, true)}
                          className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                            s.motion === m.key ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-studio-800 border-studio-700 hover:border-gray-500 text-gray-300'}`}>
                          <span className="text-xs font-semibold flex items-center gap-1"><Icon className="w-3 h-3" /> {m.label}</span>
                          <span className="text-[10px] text-gray-400">{m.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-medium text-gray-400 block mb-1">Animate By</label>
                    <Select value={s.splitUnit} onChange={(v) => set({ splitUnit: v as Settings['splitUnit'] }, true)}>
                      <option value="char">Individual Characters</option>
                      <option value="word">Word by Word</option>
                      <option value="line">Line by Line</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-400 block mb-1">Text Alignment</label>
                    <div className="flex bg-studio-950 border border-studio-700 rounded-lg p-0.5">
                      {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([a, Icon]) => (
                        <button key={a} onClick={() => set({ textAlign: a })}
                          className={`flex-1 py-1 flex items-center justify-center rounded ${s.textAlign === a ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={hr}>
                  <Label icon={<Type className={ic} />}>Font Family & Styling</Label>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Font Family</label>
                    <Select value={s.fontFamily} onChange={(v) => set({ fontFamily: v })}>
                      {FONTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </Select>
                  </div>
                  <Slider label="Font Size" value={s.fontSize} min={20} max={140} unit="px" onChange={(v) => set({ fontSize: v })} />
                  <Slider label="Letter Spacing" value={s.letterSpacing} min={-5} max={25} unit="px" onChange={(v) => set({ letterSpacing: v })} />
                  <Slider label="Line Height" value={s.lineHeight} min={0.8} max={2} step={0.05} onChange={(v) => set({ lineHeight: v })} />
                  <Seg value={s.textTransform} onChange={(v) => set({ textTransform: v })}
                    options={[['uppercase', 'UPPER'], ['none', 'Normal'], ['lowercase', 'lower']]} />
                </div>
              </div>
            )}

            {tab === 'style' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label icon={<Palette className={ic} />}>Text Fill Style</Label>
                  <Seg value={s.colorMode} onChange={(v) => set({ colorMode: v })}
                    options={[['solid', 'Solid'], ['gradient', 'Gradient'], ['outline', 'Stroke Only']]} />
                  {s.colorMode !== 'gradient' ? (
                    <ColorField label="Primary Color" value={s.primaryColor} showHex onChange={(v) => set({ primaryColor: v })} />
                  ) : (
                    <div className="space-y-2">
                      <ColorField label="Gradient Start" value={s.gradColor1} onChange={(v) => set({ gradColor1: v })} />
                      <ColorField label="Gradient End" value={s.gradColor2} onChange={(v) => set({ gradColor2: v })} />
                      <Slider label="Gradient Angle" value={s.gradAngle} min={0} max={360} unit="°" onChange={(v) => set({ gradAngle: v })} />
                    </div>
                  )}
                  <div className="space-y-2 pt-2 border-t border-studio-800">
                    <ColorField label="Stroke Color" value={s.strokeColor} onChange={(v) => set({ strokeColor: v })} />
                    <Slider label="Stroke Width" value={s.strokeWidth} min={0} max={8} unit="px" onChange={(v) => set({ strokeWidth: v })} />
                  </div>
                </div>

                <div className={hr}>
                  <div className="flex items-center justify-between">
                    <Label icon={<Sparkles className={ic} />}>Neon & Drop Glow</Label>
                    <Toggle checked={s.enableGlow} onChange={(v) => set({ enableGlow: v })} />
                  </div>
                  <div className={`space-y-2 transition-all ${s.enableGlow ? '' : 'opacity-50 pointer-events-none'}`}>
                    <ColorField label="Glow Color" value={s.glowColor} onChange={(v) => set({ glowColor: v })} />
                    <Slider label="Glow Intensity / Blur" value={s.glowRadius} min={2} max={60} unit="px" onChange={(v) => set({ glowRadius: v })} />
                  </div>
                </div>

                <div className={hr}>
                  <Label icon={<Sparkles className={ic} />}>Special FX</Label>
                  <Slider label="RGB Split Shift" value={s.rgbShift} min={0} max={15} unit="px" onChange={(v) => set({ rgbShift: v })} />
                </div>
              </div>
            )}

            {tab === 'stage' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label icon={<LayoutTemplate className={ic} />}>Aspect Ratio</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {RATIOS.map(([r, w, h, sub]) => (
                      <button key={r} onClick={() => set({ width: w, height: h })}
                        className={`py-2 text-xs rounded-lg border flex flex-col items-center gap-0.5 ${
                          s.width === w && s.height === h ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-studio-800 border-studio-700 hover:border-gray-500 text-gray-300'}`}>
                        <span className="font-bold">{r}</span>
                        <span className="text-[9px] text-gray-400">{sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={hr}>
                  <Label icon={<Sparkles className={ic} />}>Canvas Background</Label>
                  <Seg value={s.bgType} onChange={(v) => set({ bgType: v })}
                    options={[['color', 'Dark Solid'], ['grad', 'Studio Mesh'], ['transparent', 'Transparent']]} />
                  {s.bgType === 'color' && <ColorField label="Backdrop Color" value={s.bgColor} onChange={(v) => set({ bgColor: v })} />}
                  {s.bgType === 'grad' && (
                    <div className="space-y-2">
                      <ColorField label="Mesh Top" value={s.bgGrad1} onChange={(v) => set({ bgGrad1: v })} />
                      <ColorField label="Mesh Bottom" value={s.bgGrad2} onChange={(v) => set({ bgGrad2: v })} />
                    </div>
                  )}
                </div>

                <div className={hr}>
                  <Label icon={<Sparkles className={ic} />}>Overlays & Atmosphere</Label>
                  <Check label="Cyber Grid Pattern" checked={s.overlayGrid} onChange={(v) => set({ overlayGrid: v })} />
                  <Check label="Cinematic Vignette" checked={s.overlayVignette} onChange={(v) => set({ overlayVignette: v })} />
                  <Check label="Floating Particles" checked={s.overlayParticles} onChange={(v) => set({ overlayParticles: v })} />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-studio-800 bg-studio-950/60 text-[11px] text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Engine Ready (60fps)</span>
            <span>{s.width} × {s.height}</span>
          </div>
        </aside>

        {/* WORKSPACE */}
        <main className="order-1 lg:order-2 flex-1 min-w-0 min-h-[75vh] lg:min-h-0 flex flex-col bg-studio-950 overflow-hidden relative">
          <div ref={stageRef} className="flex-1 min-h-0 relative overflow-hidden">
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-300 ease-out shadow-2xl rounded-xl overflow-hidden border border-studio-700/60 ${s.bgType === 'transparent' ? 'checker-bg' : ''}`}
              style={{ width: s.width * scale, height: s.height * scale }}>
              <canvas ref={canvasRef} width={s.width} height={s.height} className="block w-full h-full" />
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-studio-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-studio-800 text-xs text-gray-400">
              <Eye className={ic} /> <span>{Math.round(scale * 100)}% Fit</span>
            </div>
          </div>

          <footer className="min-h-28 bg-studio-900 border-t border-studio-800 flex flex-col shrink-0 px-4 py-2 z-10">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-2">
              <div className="flex items-center gap-2">
                <button onClick={player.toggle}
                  className={`w-9 h-9 rounded-lg text-white flex items-center justify-center shadow-lg transition-all ${player.playing ? 'bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                  {player.playing ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button onClick={player.restart} title="Restart" className="w-8 h-8 rounded-lg bg-studio-800 hover:bg-studio-700 text-gray-300 flex items-center justify-center">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={player.toggleLoop} title="Toggle Loop"
                  className={`px-2.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium flex items-center gap-1 ${player.loop ? '' : 'opacity-50'}`}>
                  <Repeat className="w-3 h-3" /> Loop {player.loop ? 'On' : 'Off'}
                </button>
              </div>

              <div className="font-mono text-xs bg-studio-950 px-3 py-1.5 rounded border border-studio-800 text-indigo-300 flex items-center gap-2">
                <span ref={timeRef}>00:00.00</span><span className="text-gray-600">/</span>
                <span className="text-gray-400">{fmt(s.duration)}</span>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-400">Duration:
                  <Select value={s.duration} onChange={(v) => set({ duration: parseFloat(v) }, true)} className="bg-studio-950 border border-studio-700 text-xs rounded px-2 py-1 text-white focus:outline-none">
                    {[1.5, 2.5, 3.5, 5, 8].map((d) => <option key={d} value={d}>{d.toFixed(1)}s</option>)}
                  </Select>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-400">Speed:
                  <Select value={s.speed} onChange={(v) => set({ speed: parseFloat(v) })} className="bg-studio-950 border border-studio-700 text-xs rounded px-2 py-1 text-white focus:outline-none">
                    {[0.5, 1, 1.5, 2].map((d) => <option key={d} value={d}>{d.toFixed(1)}x</option>)}
                  </Select>
                </label>
              </div>
            </div>

            <div className="relative flex-1 flex flex-col justify-center">
              <div className="flex justify-between px-1 text-[9px] font-mono text-gray-400 mb-1 pointer-events-none">
                <span>0.0s</span><span>25%</span><span>50%</span><span>75%</span><span>{s.duration}s</span>
              </div>
              <div ref={trackRef}
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); scrub(e); }}
                onPointerMove={(e) => { if (e.buttons) scrub(e); }}
                className="relative h-6 bg-studio-950 rounded-md border border-studio-800 cursor-pointer overflow-hidden flex items-center">
                <div ref={fillRef} className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-600/40 to-indigo-500/60 pointer-events-none" />
                <div ref={headRef} className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] -translate-x-1/2 pointer-events-none">
                  <div className="w-3 h-3 bg-indigo-400 border-2 border-white rounded-full -translate-x-1 -translate-y-1" />
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* TOAST */}
      <div className={`fixed bottom-20 right-6 bg-studio-850 border border-indigo-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 pointer-events-none ${toast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
        <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400"><CheckIcon className="w-4 h-4" /></div>
        <div>
          <h4 className="text-xs font-bold text-white">{toast?.title}</h4>
          <p className="text-[11px] text-gray-300">{toast?.msg}</p>
        </div>
      </div>
    </>
  );
}
