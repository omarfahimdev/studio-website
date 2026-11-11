'use client';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Settings } from '@/lib/config';
import { makeParticles, renderFrame, type Particle } from '@/lib/engine';
import { canEncodeMp4, exportMp4 } from '@/lib/exportVideo';

type Notify = (title: string, msg: string) => void;

export function usePlayer(canvasRef: RefObject<HTMLCanvasElement | null>, settings: Settings, notify: Notify) {
  const sRef = useRef(settings);
  sRef.current = settings;
  const st = useRef({ time: 0, playing: true, loop: true, recording: false });
  const particles = useRef<Particle[]>([]);
  const subs = useRef(new Set<(t: number) => void>());
  const recorder = useRef<MediaRecorder | null>(null);
  const [playing, setPlaying] = useState(true);
  const [loop, setLoop] = useState(true);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const busy = useRef(false);

  const emit = () => subs.current.forEach((fn) => fn(st.current.time));
  const subscribe = useCallback((fn: (t: number) => void) => {
    subs.current.add(fn);
    fn(st.current.time);
    return () => { subs.current.delete(fn); };
  }, []);

  useEffect(() => { particles.current = makeParticles(settings.width, settings.height); }, [settings.width, settings.height]);
  useEffect(() => { document.fonts?.load(`${settings.fontSize}px ${settings.fontFamily}`); }, [settings.fontFamily, settings.fontSize]);

  useEffect(() => {
    let raf = 0, last = performance.now();
    const frame = (now: number) => {
      const s = sRef.current, p = st.current;
      const dt = (now - last) / 1000;
      last = now;
      if (p.playing) {
        p.time += dt * s.speed;
        if (p.time >= s.duration) {
          if (p.loop && !p.recording) p.time = 0;
          else { p.time = s.duration; p.playing = false; setPlaying(false); }
        }
        emit();
      }
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) renderFrame(ctx, s, p.time, particles.current);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [canvasRef]);

  const restart = useCallback(() => { st.current.time = 0; st.current.playing = true; setPlaying(true); emit(); }, []);
  const toggle = useCallback(() => {
    const p = st.current;
    p.playing = !p.playing;
    if (p.playing && p.time >= sRef.current.duration) p.time = 0;
    setPlaying(p.playing); emit();
  }, []);
  const toggleLoop = useCallback(() => { st.current.loop = !st.current.loop; setLoop(st.current.loop); }, []);
  const seek = useCallback((ratio: number) => { st.current.time = ratio * sRef.current.duration; emit(); }, []);

  const snapshot = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `KineticTitle-${Date.now()}.png`;
    a.click();
    notify('Snapshot Saved', 'Rendered canvas exported as PNG.');
  }, [canvasRef, notify]);

  const stopRecording = useCallback(() => {
    if (!st.current.recording) return;
    st.current.recording = false;
    setRecording(false);
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop();
  }, []);

  const runMp4 = useCallback(async () => {
    busy.current = true;
    setProgress(0);
    notify('Exporting MP4', 'Rendering frames offline at 60 fps...');
    try {
      const blob = await exportMp4(sRef.current, setProgress);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `KineticTypography-${Date.now()}.mp4`;
      a.click();
      notify('Video Export Ready', 'MP4 (H.264) exported successfully.');
    } catch (err) {
      console.error(err);
      notify('Export Failed', 'Could not encode MP4 in this browser.');
    } finally {
      busy.current = false;
      setProgress(null);
    }
  }, [notify]);

  const startRecording = useCallback(() => {
    if (canEncodeMp4()) { void runMp4(); return; }
    const c = canvasRef.current;
    if (!c) return;
    try {
      const chunks: Blob[] = [];
      const stream = c.captureStream(60);
      let rec: MediaRecorder;
      const mime = ['video/mp4;codecs=avc1', 'video/x-matroska;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
      rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      const ext = mime?.startsWith('video/mp4') ? 'mp4' : mime?.startsWith('video/x-matroska') ? 'mkv' : 'webm';
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'video/webm' }));
        a.download = `KineticTypography-${Date.now()}.${ext}`;
        a.click();
        notify('Video Export Ready', `Video exported as .${ext}.`);
      };
      st.current.recording = true;
      setRecording(true);
      recorder.current = rec;
      restart();
      rec.start();
      const { duration, speed } = sRef.current;
      notify('Recording Video', `Capturing full cycle (${duration}s)...`);
      setTimeout(stopRecording, (duration / speed) * 1000 + 150);
    } catch (err) {
      console.error(err);
      st.current.recording = false;
      setRecording(false);
      notify('Recording Failed', 'MediaRecorder is not supported in this browser.');
    }
  }, [canvasRef, notify, restart, runMp4, stopRecording]);

  const toggleRecording = useCallback(() => {
    if (busy.current) return;
    if (st.current.recording) stopRecording();
    else startRecording();
  }, [startRecording, stopRecording]);

  return { playing, loop, recording, progress, subscribe, restart, toggle, toggleLoop, seek, snapshot, toggleRecording };
}
