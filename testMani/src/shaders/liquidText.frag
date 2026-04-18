uniform sampler2D uTexture;
uniform vec2 uPointer;
uniform vec2 uPointerVel;
uniform vec2 uScrollVel;
uniform float uScrollStretchAnchor;
uniform float uReaction;
uniform float uBreeze;
uniform float uGlow;
uniform vec3 uGlowColor;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uLightScheme;

varying vec2 vUv;

void main() {
  vec2 p = vUv - uPointer;
  float d = length(p);
  /* Wide envelope so neighbors share deformation (jelly “body”); tighter core for hotspot. */
  float rWide = 0.44;
  float rCore = 0.2;
  float env = exp(-pow(d / rWide, 1.72));
  float core = exp(-pow(d / max(rCore, 0.001), 2.35));
  float influence = clamp(env * 0.55 + core * 0.45 + env * core * 0.35, 0.0, 1.0);

  vec2 dir = normalize(p + 1e-5);
  vec2 tng = vec2(-dir.y, dir.x);

  float subtleSwirl = 0.065 * influence;
  float c0 = cos(subtleSwirl);
  float s0 = sin(subtleSwirl);
  mat2 rot0 = mat2(c0, -s0, s0, c0);
  vec2 q = rot0 * p;

  float wave = sin(dot(vUv, vec2(12.0, 7.5)) + d * 18.0) * 0.5 + 0.5;
  float breezeMask = influence * influence * (1.0 - influence * 0.4);
  vec2 breeze = tng * uBreeze * breezeMask * (0.32 + 0.22 * wave);

  /* Jelly: organic wobble + shear so edges feel viscous; bleeds to neighbors via wide env. */
  float w1 = sin(dot(vUv, vec2(9.2, 6.4)) + d * 21.0 + uPointer.x * 4.0);
  float w2 = cos(dot(vUv, vec2(-7.5, 10.8)) + d * 16.5 - uPointer.y * 3.5);
  float w3 = sin(d * 38.0 + dot(uPointer, vec2(14.0, -9.0)));
  float jellyMask = env * mix(0.75, 1.0, core);
  vec2 jellyShear = tng * uReaction * jellyMask * (0.09 * w1 + 0.06 * w2 + 0.035 * w3);

  /* Velocity nudge: cursor motion pushes nearby pixels along its travel direction
     (sample opposite → content shifts with motion). */
  vec2 vel = uPointerVel;
  float vlen = length(vel);
  vec2 velN = vlen > 1e-5 ? vel / vlen : vec2(0.0);
  vec2 velPush = -velN * uReaction * env * min(vlen * 6.5, 0.14) * 0.5;

  /* PUSH only: sample closer to cursor so glyphs visually bulge AWAY from it.
     No pull, no melt bias. Strength grows as cursor nears. */
  float near = pow(mix(env, core, 0.35), 1.38);
  vec2 radialPush = -dir * uReaction * near * 0.55;

  /* Tangential ripple — phase-shifted across UV so neighbor letters share the wobble. */
  vec2 ripples = tng * uReaction * env * sin(d * 31.0 + uPointer.x * 18.0) * 0.055;

  vec2 suv = uPointer + q + radialPush + breeze + jellyShear + velPush + ripples;

  /* Scroll-stretch: anchor from UI — 0 bottom, 1 top, 2 left, 3 right. UV y = bottom→top. */
  vec2 sc = uScrollVel;
  float mode = uScrollStretchAnchor;
  float anchorY = 0.5;
  float oppScroll = 0.0;
  if (mode < 0.5) {
    anchorY = 0.0;
    oppScroll = max(0.0, sc.y);
  } else if (mode < 1.5) {
    anchorY = 1.0;
    oppScroll = max(0.0, -sc.y);
  } else if (mode < 2.5) {
    anchorY = 0.5;
    oppScroll = max(0.0, -sc.x);
  } else {
    anchorY = 0.5;
    oppScroll = max(0.0, sc.x);
  }
  /* Base gain so stretch is visible even at low reaction; cap to avoid breaking UV. */
  float reactMix = clamp(0.45 + uReaction * 1.35, 0.35, 1.85);
  float edgeStretch = clamp(reactMix * oppScroll * 7.2, 0.0, 0.88);
  float yStretch = 1.0 + edgeStretch * 1.12;
  vec2 suvStretch = vec2(suv.x, clamp(anchorY + (suv.y - anchorY) * yStretch, 0.001, 0.999));

  float dispStrength = clamp(length(jellyShear + velPush + ripples) * 18.0 + near * 0.9 + edgeStretch * 0.65, 0.0, 1.0);
  float chromAmt = 0.0088 * uGlow * mix(influence, 1.0, dispStrength * 0.55) * mix(1.0, 0.82, uLightScheme);
  vec2 abDir = normalize(vec2(0.92, 0.38));
  vec2 suvR = clamp(suvStretch + abDir * chromAmt, vec2(0.001), vec2(0.999));
  vec2 suvG = clamp(suvStretch, vec2(0.001), vec2(0.999));
  vec2 suvB = clamp(suvStretch - abDir * chromAmt * 0.85, vec2(0.001), vec2(0.999));

  float chR = texture2D(uTexture, suvR).r;
  float chG = texture2D(uTexture, suvG).g;
  float chB = texture2D(uTexture, suvB).b;
  float a = texture2D(uTexture, suvG).a * uAlpha;

  vec3 rgb = vec3(chR, chG, chB) * uColor;

  float glowScale = mix(1.0, 1.22, uLightScheme);
  float rGlow = rWide * mix(1.0, 1.52, uLightScheme);
  float glowEdge = mix(2.15, 1.55, uLightScheme);
  float influenceGlow = exp(-pow(d / max(rGlow, 0.001), glowEdge));
  float glowPow = mix(1.52, 0.86, uLightScheme);
  float glowCore = pow(influenceGlow, glowPow);
  float glowHalo = pow(influenceGlow, glowPow * 0.68);
  float glowMix = mix(glowCore, glowHalo, uLightScheme * 0.42);
  float glowMask = glowMix * uGlow * glowScale;
  rgb += uGlowColor * glowMask;

  vec2 ldir2 = normalize(vec2(0.35, 0.85));
  float ndl = max(0.0, dot(dir, ldir2));
  float specExp = mix(6.0, 3.1, uLightScheme);
  float specInf = mix(influence, influenceGlow, uLightScheme);
  float spec = pow(ndl, specExp) * specInf * uGlow * 0.42;
  float specScale = mix(1.55, 1.28, uLightScheme);
  rgb += uGlowColor * spec * specScale;

  gl_FragColor = vec4(rgb, a);
}
