import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import type { Settings } from './config';
import { makeParticles, renderFrame } from './engine';

const FPS = 60;

export const canEncodeMp4 = () => typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';

/** Renders every frame offline (not real-time) and encodes H.264 into an MP4 — smooth 60fps, no dropped frames. */
export async function exportMp4(s: Settings, onProgress: (p: number) => void): Promise<Blob> {
  const { width, height } = s;
  const config: VideoEncoderConfig = {
    codec: 'avc1.64002A', width, height, framerate: FPS, bitrate: Math.round(width * height * FPS * 0.12),
  };
  if (!(await VideoEncoder.isConfigSupported(config)).supported) throw new Error('H.264 encoding not supported');
  await document.fonts?.load(`${s.fontSize}px ${s.fontFamily}`);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const particles = makeParticles(width, height);

  const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width, height }, fastStart: 'in-memory' });
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => { throw e; },
  });
  encoder.configure(config);

  const total = Math.max(1, Math.round((s.duration / s.speed) * FPS));
  for (let i = 0; i < total; i++) {
    renderFrame(ctx, s, Math.min((i / FPS) * s.speed, s.duration), particles);
    const frame = new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
    encoder.encode(frame, { keyFrame: i % (FPS * 2) === 0 });
    frame.close();
    while (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 4));
    if (i % 6 === 0) { onProgress(i / total); await new Promise((r) => setTimeout(r, 0)); }
  }
  await encoder.flush();
  muxer.finalize();
  onProgress(1);
  return new Blob([muxer.target.buffer], { type: 'video/mp4' });
}
