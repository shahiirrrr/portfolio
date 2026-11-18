/**
 * Raw WebGL2 ink field for the Home hero (see home-hero-negative.ts). No
 * library: two tiny programs on one full-screen triangle.
 *
 *  - simulate: a quarter-resolution ping-pong texture holding the pointer
 *    trail (advected along curl noise, bleeding and fading);
 *  - display: trail + the global "develop" and "flood" inks, thresholded into
 *    liquid shapes at up to 1.5× device pixels.
 *
 * Coordinates are field space (ink-field-shaders.ts): x ∈ [0, aspect],
 * y ∈ [0, 1] from the bottom, in hero heights.
 */
import { DISPLAY, DROP_COUNT, SIMULATE, VERTEX } from './ink-field-shaders.ts';

/** Simulation texels per CSS pixel. The display threshold hides the low resolution. */
const SIM_SCALE = 0.25;
/** Display resolution cap (device pixels per CSS pixel). */
export const MAX_DPR = 1.5;

/** Global inks, written by the choreography and read every frame. */
export interface InkState {
  originX: number;
  originY: number;
  /** Develop: the hero is clear inside this radius around the origin. */
  radius: number;
  /** Flood: ink below this height. */
  level: number;
  /** Flood edge wave amplitude. */
  wave: number;
  /** Silhouette shield rectangle (x, top, width, height; field space) and strength 0..1. */
  shield: [number, number, number, number];
  shieldOn: number;
  /** White paint (0–1) filling the uncovered area, for the develop drop. */
  milk: number;
  /** Develop splash droplets: x, y, radius per drop (radius ≤ 0 = off). */
  drops: Float32Array;
}

export interface InkField {
  readonly state: InkState;
  /** Width ÷ height of the field, i.e. its x extent. */
  readonly aspect: number;
  /** Premultiplied ink colour (0–1 per channel). */
  setInk(rgb: [number, number, number]): void;
  /** Upload the shield silhouette (its alpha is used). */
  setShieldImage(source: TexImageSource): void;
  /** Stamp a stroke from a to b this frame (the last call per frame wins). */
  stroke(ax: number, ay: number, bx: number, by: number, radius: number, strength: number): void;
  resize(width: number, height: number): void;
  render(time: number, frames: number): void;
  destroy(): void;
}

interface Target {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
}

function compile(gl: WebGL2RenderingContext, vertex: string, fragment: string): WebGLProgram {
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('ink: shader allocation failed');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`ink: ${gl.getProgramInfoLog(program) ?? 'link failed'}`);
  }
  return program;
}

/** Looks up each uniform once; returns a typed accessor. */
function uniforms<K extends string>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  names: readonly K[],
): (name: K) => WebGLUniformLocation | null {
  const found = new Map(names.map((name) => [name, gl.getUniformLocation(program, name)]));
  return (name) => found.get(name) ?? null;
}

/**
 * Returns null when WebGL2 is unavailable, software-rendered or the shaders
 * fail; the caller then keeps the classic hero.
 */
export function createInkField(
  canvas: HTMLCanvasElement,
  ink: [number, number, number],
): InkField | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return null;

  let simulate: WebGLProgram;
  let display: WebGLProgram;
  try {
    simulate = compile(gl, VERTEX, SIMULATE);
    display = compile(gl, VERTEX, DISPLAY);
  } catch {
    return null;
  }

  const sim = uniforms(gl, simulate, [
    'uPrev',
    'uTexel',
    'uAspect',
    'uTime',
    'uFrames',
    'uA',
    'uB',
    'uRadius',
    'uStrength',
  ] as const);
  const out = uniforms(gl, display, [
    'uField',
    'uAspect',
    'uTime',
    'uOrigin',
    'uRadius',
    'uLevel',
    'uWave',
    'uInk',
    'uDrops',
    'uMilk',
    'uShield',
    'uShieldRect',
    'uShieldOn',
  ] as const);

  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // Half floats keep slow fades smooth; 8-bit is the universal fallback.
  const halfFloat = gl.getExtension('EXT_color_buffer_float') !== null;

  let targets: [Target, Target] | undefined;
  let simW = 1;
  let simH = 1;
  let aspect = 1;
  let lost = false;
  let shieldTexture: WebGLTexture | undefined;
  let pending:
    { a: [number, number]; b: [number, number]; radius: number; strength: number } | undefined;

  const createTarget = (w: number, h: number, half: boolean): Target | null => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (half) gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, w, h, 0, gl.RED, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (complete) return { texture, framebuffer };
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(framebuffer);
    return null;
  };

  const dropTargets = (): void => {
    for (const target of targets ?? []) {
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.framebuffer);
    }
    targets = undefined;
  };

  const onLost = (event: Event): void => {
    event.preventDefault();
    lost = true;
  };
  canvas.addEventListener('webglcontextlost', onLost);

  const field: InkField = {
    state: {
      originX: 0.5,
      originY: 0.5,
      radius: 0,
      level: -1,
      wave: 0,
      milk: 0,
      shield: [0, 0, 1, 1],
      shieldOn: 0,
      drops: new Float32Array(DROP_COUNT * 3),
    },

    get aspect() {
      return aspect;
    },

    setInk(rgb) {
      ink = rgb;
    },

    setShieldImage(source) {
      if (lost) return;
      shieldTexture ??= gl.createTexture();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, shieldTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.activeTexture(gl.TEXTURE0);
    },

    stroke(ax, ay, bx, by, radius, strength) {
      pending = { a: [ax, ay], b: [bx, by], radius, strength };
    },

    resize(width, height) {
      if (lost || width < 1 || height < 1) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      aspect = width / height;
      simW = Math.max(64, Math.round(width * SIM_SCALE));
      simH = Math.max(64, Math.round(height * SIM_SCALE));
      dropTargets();
      const make = (half: boolean): [Target, Target] | undefined => {
        const a = createTarget(simW, simH, half);
        const b = createTarget(simW, simH, half);
        return a && b ? [a, b] : undefined;
      };
      targets = (halfFloat ? make(true) : undefined) ?? make(false);
    },

    render(time, frames) {
      if (lost || !targets) return;
      const [read, write] = targets;
      const { state } = field;

      gl.bindVertexArray(vao);

      gl.useProgram(simulate);
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
      gl.viewport(0, 0, simW, simH);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read.texture);
      gl.uniform1i(sim('uPrev'), 0);
      gl.uniform2f(sim('uTexel'), 1 / simW, 1 / simH);
      gl.uniform1f(sim('uAspect'), aspect);
      gl.uniform1f(sim('uTime'), time);
      gl.uniform1f(sim('uFrames'), Math.min(frames, 4));
      gl.uniform2f(sim('uA'), pending?.a[0] ?? 0, pending?.a[1] ?? 0);
      gl.uniform2f(sim('uB'), pending?.b[0] ?? 0, pending?.b[1] ?? 0);
      gl.uniform1f(sim('uRadius'), pending?.radius ?? 1);
      gl.uniform1f(sim('uStrength'), pending?.strength ?? 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      pending = undefined;
      targets = [write, read];

      gl.useProgram(display);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, write.texture);
      gl.uniform1i(out('uField'), 0);
      gl.uniform1f(out('uAspect'), aspect);
      gl.uniform1f(out('uTime'), time);
      gl.uniform2f(out('uOrigin'), state.originX, state.originY);
      gl.uniform1f(out('uRadius'), state.radius);
      gl.uniform1f(out('uLevel'), state.level);
      gl.uniform1f(out('uWave'), state.wave);
      gl.uniform3f(out('uInk'), ink[0], ink[1], ink[2]);
      gl.uniform3fv(out('uDrops'), state.drops);
      gl.uniform1f(out('uMilk'), state.milk);
      gl.uniform1i(out('uShield'), 1);
      gl.uniform4f(out('uShieldRect'), ...state.shield);
      gl.uniform1f(out('uShieldOn'), shieldTexture ? state.shieldOn : 0);
      if (shieldTexture) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, shieldTexture);
        gl.activeTexture(gl.TEXTURE0);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    destroy() {
      canvas.removeEventListener('webglcontextlost', onLost);
      if (lost) return;
      dropTargets();
      if (shieldTexture) gl.deleteTexture(shieldTexture);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(simulate);
      gl.deleteProgram(display);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };

  return field;
}
