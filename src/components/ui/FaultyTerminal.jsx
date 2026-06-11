import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef, useMemo, useCallback } from 'react';

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

varying vec2 vUv;

uniform float iTime;
uniform vec3  iResolution;
uniform float uScale;

uniform vec2  uGridMul;
uniform float uDigitSize;
uniform float uScanlineIntensity;
uniform float uGlitchAmount;
uniform float uFlickerAmount;
uniform float uNoiseAmp;
uniform float uChromaticAberration;
uniform float uDither;
uniform float uCurvature;
uniform vec3  uTint;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform float uUseMouse;
uniform float uPageLoadProgress;
uniform float uUsePageLoadAnimation;
uniform float uBrightness;

float time;

// Constant rotation matrices for FBM octaves (precomputed, no runtime trig)
const mat2 rot1 = mat2(0.8, -0.6, 0.6, 0.8);
const mat2 rot2 = mat2(0.35, -0.93, 0.93, 0.35);

float hash21(vec2 p){
  p = fract(p * 234.56);
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p)
{
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2; 
}

float fbm(vec2 p)
{
  p *= 1.1;
  float f = 0.0;
  float amp = 0.5 * uNoiseAmp;
  
  f += amp * noise(p);
  p = rot1 * p * 2.0;
  amp *= 0.45;
  
  f += amp * noise(p);
  p = rot2 * p * 2.0;
  amp *= 0.45;
  
  f += amp * noise(p);
  
  return f;
}

float pattern(vec2 p) {
  // Simplified pattern: directly use 3-octave FBM.
  // Avoids 5 calls to FBM and domain warping which is expensive and imperceptible on a discrete grid background.
  return fbm(p);
}

float digitShape(vec2 gp, float intensity) {
    vec2 p = fract(gp);
    p *= uDigitSize;
    
    float px5 = p.x * 5.0;
    float py5 = (1.0 - p.y) * 5.0;
    float x = fract(px5);
    float y = fract(py5);
    
    float i = floor(py5) - 2.0;
    float j = floor(px5) - 2.0;
    float n = i * i + j * j;
    float f = n * 0.0625;
    
    float isOn = step(0.1, intensity - f);
    float brightness = isOn * (0.2 + y * 0.8) * (0.75 + x * 0.25);
    
    return step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0) * brightness;
}

float onOff(float a, float b, float c)
{
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;
}

float displace(vec2 look)
{
    float y = look.y - mod(iTime * 0.25, 1.0);
    float window = 1.0 / (1.0 + 50.0 * y * y);
    return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
}

vec3 getColor(vec2 p){
    float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;
    bar *= uScanlineIntensity;
    
    float displacement = displace(p);
    p.x += displacement;

    if (uGlitchAmount != 1.0) {
      float extra = displacement * (uGlitchAmount - 1.0);
      p.x += extra;
    }

    vec2 grid = uGridMul * 15.0;
    vec2 s = floor(p * grid) / grid;
    
    // Evaluate intensity ONCE for the center of this cell
    float intensity = pattern(s * 0.1) * 1.3 - 0.03;
    
    if(uUseMouse > 0.5){
        vec2 mouseWorld = uMouse * uScale;
        float distToMouse = distance(s, mouseWorld);
        float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;
        intensity += mouseInfluence;
        
        float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;
        intensity += ripple;
    }
    
    if(uUsePageLoadAnimation > 0.5){
        float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
        float cellDelay = cellRandom * 0.8;
        float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);
        
        float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);
        intensity *= fadeAlpha;
    }

    // Evaluate digit shapes using the same cell intensity
    vec2 gp = p * grid;
    float middle = digitShape(gp, intensity);
    
    const float off = 0.002;
    vec2 g_off = vec2(off) * grid;
    
    float sum = digitShape(gp + vec2(-g_off.x, -g_off.y), intensity) +
                digitShape(gp + vec2(0.0, -g_off.y), intensity) +
                digitShape(gp + vec2(g_off.x, -g_off.y), intensity) +
                digitShape(gp + vec2(-g_off.x, 0.0), intensity) +
                digitShape(gp, intensity) +
                digitShape(gp + vec2(g_off.x, 0.0), intensity) +
                digitShape(gp + vec2(-g_off.x, g_off.y), intensity) +
                digitShape(gp + vec2(0.0, g_off.y), intensity) +
                digitShape(gp + vec2(g_off.x, g_off.y), intensity);
    
    vec3 baseColor = vec3(0.9) * middle + sum * 0.1 * vec3(1.0) * bar;
    return baseColor;
}

vec2 barrel(vec2 uv){
  vec2 c = uv * 2.0 - 1.0;
  float r2 = dot(c, c);
  c *= 1.0 + uCurvature * r2;
  return c * 0.5 + 0.5;
}

void main() {
    time = iTime * 0.333333;
    vec2 uv = vUv;

    if(uCurvature != 0.0){
      uv = barrel(uv);
    }
    
    vec2 p = uv * uScale;
    vec3 col = getColor(p);

    if(uChromaticAberration != 0.0){
      vec2 ca = vec2(uChromaticAberration) / iResolution.xy;
      col.r = getColor(p + ca).r;
      col.b = getColor(p - ca).b;
    }

    col *= uTint;
    col *= uBrightness;

    if(uDither > 0.0){
      float rnd = hash21(gl_FragCoord.xy);
      col += (rnd - 0.5) * (uDither * 0.003922);
    }

    gl_FragColor = vec4(col, 1.0);
}
`;

function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3)
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  const num = parseInt(h, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

export default function FaultyTerminal({
  scale = 1,
  gridMul = [2, 1],
  digitSize = 1.5,
  timeScale = 0.3,
  pause = false,
  scanlineIntensity = 0.3,
  glitchAmount = 1,
  flickerAmount = 1,
  noiseAmp = 1,
  chromaticAberration = 0,
  dither = 0,
  curvature = 0.2,
  tint = '#ffffff',
  mouseReact = true,
  mouseStrength = 0.2,
  dpr = 1,
  pageLoadAnimation = true,
  brightness = 1,
  className,
  style,
  ...rest
}) {
  const containerRef = useRef(null);
  const programRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const frozenTimeRef = useRef(0);
  const rafRef = useRef(0);
  const loadAnimationStartRef = useRef(0);
  const timeOffsetRef = useRef(0);

  const tintVec = useMemo(() => hexToRgb(tint), [tint]);
  const ditherValue = useMemo(() => (typeof dither === 'boolean' ? (dither ? 1 : 0) : dither), [dither]);

  // Store all props in a ref so the animation loop always reads current values
  // without needing to re-run the useEffect (which destroys/rebuilds WebGL)
  const propsRef = useRef({});
  useEffect(() => {
    propsRef.current = {
      scale, gridMul, digitSize, timeScale, pause, scanlineIntensity,
      glitchAmount, flickerAmount, noiseAmp, chromaticAberration,
      ditherValue, curvature, tintVec, mouseReact, mouseStrength,
      pageLoadAnimation, brightness
    };
  });

  const handleMouseMove = useCallback(e => {
    const ctn = containerRef.current;
    if (!ctn) return;
    const rect = ctn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    mouseRef.current = { x, y };
  }, []);

  // Initialize WebGL only once on mount
  useEffect(() => {
    const ctn = containerRef.current;
    if (!ctn) return;

    timeOffsetRef.current = Math.random() * 100;

    const renderer = new Renderer({ dpr });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);

    const geometry = new Triangle(gl);
    const p = propsRef.current;

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uScale: { value: p.scale },
        uGridMul: { value: new Float32Array(p.gridMul) },
        uDigitSize: { value: p.digitSize },
        uScanlineIntensity: { value: p.scanlineIntensity },
        uGlitchAmount: { value: p.glitchAmount },
        uFlickerAmount: { value: p.flickerAmount },
        uNoiseAmp: { value: p.noiseAmp },
        uChromaticAberration: { value: p.chromaticAberration },
        uDither: { value: p.ditherValue },
        uCurvature: { value: p.curvature },
        uTint: { value: new Color(p.tintVec[0], p.tintVec[1], p.tintVec[2]) },
        uMouse: {
          value: new Float32Array([smoothMouseRef.current.x, smoothMouseRef.current.y])
        },
        uMouseStrength: { value: p.mouseStrength },
        uUseMouse: { value: p.mouseReact ? 1 : 0 },
        uPageLoadProgress: { value: p.pageLoadAnimation ? 0 : 1 },
        uUsePageLoadAnimation: { value: p.pageLoadAnimation ? 1 : 0 },
        uBrightness: { value: p.brightness }
      }
    });
    programRef.current = program;

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!ctn || !renderer) return;
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      program.uniforms.iResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height
      );
    }

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(ctn);
    resize();

    const update = t => {
      rafRef.current = requestAnimationFrame(update);
      const cur = propsRef.current;

      if (cur.pageLoadAnimation && loadAnimationStartRef.current === 0) {
        loadAnimationStartRef.current = t;
      }

      if (!cur.pause) {
        const elapsed = (t * 0.001 + timeOffsetRef.current) * cur.timeScale;
        program.uniforms.iTime.value = elapsed;
        frozenTimeRef.current = elapsed;
      } else {
        program.uniforms.iTime.value = frozenTimeRef.current;
      }

      if (cur.pageLoadAnimation && loadAnimationStartRef.current > 0) {
        const animationDuration = 2000;
        const animationElapsed = t - loadAnimationStartRef.current;
        const progress = Math.min(animationElapsed / animationDuration, 1);
        program.uniforms.uPageLoadProgress.value = progress;
      }

      if (cur.mouseReact) {
        const dampingFactor = 0.08;
        const smoothMouse = smoothMouseRef.current;
        const mouse = mouseRef.current;
        smoothMouse.x += (mouse.x - smoothMouse.x) * dampingFactor;
        smoothMouse.y += (mouse.y - smoothMouse.y) * dampingFactor;

        const mouseUniform = program.uniforms.uMouse.value;
        mouseUniform[0] = smoothMouse.x;
        mouseUniform[1] = smoothMouse.y;
      }

      renderer.render({ scene: mesh });
    };
    rafRef.current = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    ctn.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      ctn.removeEventListener('mousemove', handleMouseMove);
      if (gl.canvas.parentElement === ctn) ctn.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dpr]);

  // Update shader uniforms reactively without rebuilding WebGL context
  useEffect(() => {
    const program = programRef.current;
    if (!program) return;
    const u = program.uniforms;
    u.uScale.value = scale;
    u.uGridMul.value = new Float32Array(gridMul);
    u.uDigitSize.value = digitSize;
    u.uScanlineIntensity.value = scanlineIntensity;
    u.uGlitchAmount.value = glitchAmount;
    u.uFlickerAmount.value = flickerAmount;
    u.uNoiseAmp.value = noiseAmp;
    u.uChromaticAberration.value = chromaticAberration;
    u.uDither.value = ditherValue;
    u.uCurvature.value = curvature;
    u.uTint.value = new Color(tintVec[0], tintVec[1], tintVec[2]);
    u.uMouseStrength.value = mouseStrength;
    u.uUseMouse.value = mouseReact ? 1 : 0;
    u.uBrightness.value = brightness;
  });

  return (
    <div ref={containerRef} className={`w-full h-full relative overflow-hidden ${className || ''}`} style={style} {...rest} />
  );
}
