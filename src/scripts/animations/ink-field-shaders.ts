/**
 * GLSL (WebGL2 / ES 3.00) for the hero ink field (ink-field.ts).
 *
 * Field space, shared with the TS side: x ∈ [0, aspect], y ∈ [0, 1] from the
 * bottom, in units of the hero's height, so shapes stay round at any size.
 */

/** Full-screen triangle; `vUv` covers the canvas 0..1. */
export const VERTEX = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const NOISE = /* glsl */ `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}`;

/**
 * Simulation step (low resolution, ping-pong): advect the previous field along
 * a slow curl-noise flow so trails curl like ink in water, bleed a little into
 * their neighbours, decay, then stamp the pointer stroke (a capsule from the
 * last frame's position to this one, so fast strokes never break into dots).
 */
export const SIMULATE = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform float uAspect;
uniform float uTime;
uniform float uFrames;   // elapsed time in 60 Hz frames, so decay is frame-rate independent
uniform vec2 uA;         // stroke start (field space)
uniform vec2 uB;         // stroke end
uniform float uRadius;
uniform float uStrength; // 0 = no stroke this frame

const float FLOW = 0.0009;   // curl strength per frame (uv)
const float BLEED = 0.22;    // share of the neighbour average mixed in
const float DECAY = 0.992;   // multiplicative fade per frame
const float DRAIN = 0.0015;  // linear fade per frame, so tails reach zero

${NOISE}

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

// Polynomial smooth minimum: two distances melt into one shape.
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  // A fresh drop is round and crisp; it gains fingers and wobble as it spreads.
  float grown = smoothstep(0.05, 0.5, uRadius);
  vec2 q = p * 2.5 + vec2(uTime * 0.04, -uTime * 0.03);
  const float e = 0.02;
  vec2 curl = vec2(
    noise(q + vec2(0.0, e)) - noise(q - vec2(0.0, e)),
    noise(q - vec2(e, 0.0)) - noise(q + vec2(e, 0.0))
  ) / (2.0 * e);
  vec2 uv = vUv - curl * FLOW * uFrames / vec2(uAspect, 1.0);

  float v = texture(uPrev, uv).r;
  float around = (
    texture(uPrev, uv + vec2(uTexel.x, 0.0)).r +
    texture(uPrev, uv - vec2(uTexel.x, 0.0)).r +
    texture(uPrev, uv + vec2(0.0, uTexel.y)).r +
    texture(uPrev, uv - vec2(0.0, uTexel.y)).r
  ) * 0.25;
  v = mix(v, around, BLEED);
  v = max(v * pow(DECAY, uFrames) - DRAIN * uFrames, 0.0);

  if (uStrength > 0.0) {
    float d = segment(p, uA, uB);
    v = max(v, uStrength * exp(-(d * d) / (uRadius * uRadius)));
  }
  outColor = vec4(v, 0.0, 0.0, 1.0);
}`;

/** Splash droplets around the develop drop (x, y, radius; radius ≤ 0 = off). */
export const DROP_COUNT = 7;

/**
 * Display (full resolution): sum the pointer trail with the two global inks —
 * "develop" (ink everywhere outside a drop growing from uOrigin, fused with
 * its splash droplets by a smooth minimum) and
 * "flood" (ink below a rising level with a velocity wave) — wobble the sum
 * with fbm noise and threshold it. Summing before the threshold is what makes
 * a trail fuse with an edge like two drops of liquid (metaballs).
 * Output is premultiplied `uInk`; the canvas inverts the hero through
 * `mix-blend-mode: difference`.
 */
export const DISPLAY = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uField;
uniform float uAspect;
uniform float uTime;
uniform vec2 uOrigin;
uniform float uRadius;  // develop: clear inside this radius
uniform float uLevel;   // flood: ink below this height
uniform float uWave;    // flood edge wave amplitude
uniform vec3 uInk;
uniform float uMilk;
uniform sampler2D uShield;  // silhouette the global inks stay out of (alpha)
uniform vec4 uShieldRect;   // x, top, width, height (field space)
uniform float uShieldOn;    // white paint inside the uncovered area (the develop drop), 0..1
uniform vec3 uDrops[${DROP_COUNT}];

const float SOFT = 0.22;   // width of the global ink ramps (goo zone)
const float WOBBLE = 0.5;  // noise added to the sum before thresholding
const float WARP = 0.16;   // domain warp of the global edges (liquid fingers)
const float GOO = 0.07;    // how far apart the drop and its droplets start to fuse

${NOISE}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}

// Polynomial smooth minimum: two distances melt into one shape.
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  // A fresh drop is round and crisp; it gains fingers and wobble as it spreads.
  float grown = smoothstep(0.05, 0.5, uRadius);

  // Warp the space the global edges are measured in, so a circle and a
  // horizon read as slowly churning liquid instead of geometry.
  vec2 warp = vec2(
    noise(p * 3.1 + vec2(0.0, uTime * 0.22)) + 0.5 * noise(p * 6.3 - vec2(uTime * 0.3, 0.0)),
    noise(p * 3.1 + vec2(5.2, -uTime * 0.18)) + 0.5 * noise(p * 6.3 + vec2(1.7, uTime * 0.27))
  ) - 0.75;
  vec2 q = p + warp * WARP;

  float trail = texture(uField, vUv).r;
  float sd = distance(p + warp * WARP * grown, uOrigin) - uRadius;
  for (int i = 0; i < ${DROP_COUNT}; i++) {
    vec3 drop = uDrops[i];
    if (drop.z > 0.0) sd = smin(sd, distance(p + warp * 0.02, drop.xy) - drop.z, GOO);
  }
  float develop = clamp(sd / SOFT + 0.5, 0.0, 1.5);
  float wave = sin(q.x * 5.0 + uTime * 2.2) * uWave + sin(q.x * 11.0 - uTime * 3.1) * uWave * 0.4;
  float flood = clamp((uLevel + wave - q.y) / SOFT + 0.5, 0.0, 1.5);

  // The portrait silhouette shields the photo from the develop/flood inks;
  // the pointer trail still paints over it. Applied after thresholding, by
  // the mask's own coverage, so the ink meets the photo's anti-aliased edge
  // without a seam.
  float shield = 0.0;
  if (uShieldOn > 0.0) {
    vec2 suv = vec2(p.x - uShieldRect.x, uShieldRect.y - p.y) / uShieldRect.zw;
    if (suv.x >= 0.0 && suv.y >= 0.0 && suv.x <= 1.0 && suv.y <= 1.0) {
      shield = texture(uShield, suv).a * uShieldOn;
    }
  }

  float noiseTerm = (fbm(p * 2.2 + vec2(uTime * 0.07, -uTime * 0.05)) - 0.44) * WOBBLE * mix(0.25, 1.0, grown);
  float v = trail + develop + flood + noiseTerm;
  float w = fwidth(v) * 0.8 + 1e-4;
  float a = smoothstep(0.5 - w, 0.5 + w, v);
  // Trail alone (derivatives must be taken outside any branch).
  float vt = trail + noiseTerm;
  float wt = fwidth(vt) * 0.8 + 1e-4;
  a = mix(a, smoothstep(0.5 - wt, 0.5 + wt, vt), shield);

  // Premultiplied: ink outside, optional white "milk" inside (develop act).
  float milk = uMilk * (1.0 - a);
  outColor = vec4(uInk * a + vec3(milk), a + milk);
}`;
