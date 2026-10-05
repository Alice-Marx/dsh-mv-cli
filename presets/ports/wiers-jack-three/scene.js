// Entry point for the original Three.js rendering core. build.mjs resolves
// mv:upstream modules from a pinned checkout and adapts their canvas factories.
import { WebGLRenderer, Scene, PerspectiveCamera, ACESFilmicToneMapping } from 'three';
import { Post } from 'mv:upstream/post.js';
import { SectionManager } from 'mv:manager';
import { DURATION } from 'mv:upstream/sections/index.js';

let renderer, camera, manager, post, width = 0, height = 0, lastTime = null;

export function setup(info, gl) {
  if (!gl || !info.canvas) throw new Error('The Three.js MV requires the dsh-mv WebGL canvas facade.');
  if (manager) manager.dispose();
  if (renderer) renderer.dispose();
  renderer = new WebGLRenderer({ canvas: info.canvas, context: gl, antialias: true });
  renderer.setPixelRatio(1);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new Scene();
  camera = new PerspectiveCamera(55, 16 / 9, 0.1, 400);
  camera.position.set(0, 0, 9.5);
  post = new Post(renderer, scene, camera);
  manager = new SectionManager(scene);
  width = height = 0;
  lastTime = null;
}

export function paint(gl, t, w, h, ctx = {}) {
  if (!renderer) throw new Error('Call setup(info, gl) before paint().');
  if (w !== width || h !== height) {
    width = w;
    height = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    post.setSize(w, h, 1);
  }
  t = Math.max(0, Math.min(DURATION, Number(t) || 0));
  const delta = lastTime === null ? 0 : t - lastTime;
  const seeking = lastTime === null || delta < 0 || delta > 0.25;
  const dt = seeking ? 0 : Math.min(0.1, delta);
  const level = v => Math.max(0, Math.min(1, Number(v) || 0));
  const audio = {
    bass: level(ctx.bass), mid: level(ctx.mid), treble: level(ctx.treble),
    beat: level(ctx.beat?.pulse),
  };
  // The original smooths the trance section's audio, but a jump must not keep
  // the previous shot's spectrum. Geometry and camera already use absolute t.
  if (seeking) {
    // Upstream lookAt/projection threshold logic otherwise retains sub-pixel
    // differences from the previous shot. Begin each discontinuity identically.
    camera.position.set(0, 0, 9.5);
    camera.quaternion.identity();
    camera.fov = 55;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    for (const { inst } of manager.items) {
      if ('midSmooth' in inst) inst.midSmooth = audio.mid;
      if ('bassSmooth' in inst) inst.bassSmooth = audio.bass;
      if ('beatSmooth' in inst) inst.beatSmooth = audio.beat;
    }
  }
  // Upstream updates billboard textures before applying this frame's camera.
  // Prime the absolute-time pose first, so a seek never uses the previous shot
  // as its billboard/view-dependent input. The second pass draws current t.
  manager.update(t, 0, audio, camera);
  camera.updateMatrixWorld(true);
  const fx = manager.update(t, dt, audio, camera);
  post.setGlitch(fx.glitch);
  post.setFlash(fx.flash);
  post.setBloom(fx.bloomEnv * (1 + (fx.bloom || 0)));
  post.setBlackCut(t >= DURATION ? 1 : fx.black);
  // Post.render increments its film-grain clock; anchor it to the audio clock
  // so paused frames and backward seeks produce the same post-processing.
  post.time = t - dt;
  post.render(dt, { bass: audio.bass });
  lastTime = t;
}
