import { useEffect, useRef, useState } from "react";
import "./NoiseBackground.css";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uMouse;          // eased cursor, 0..1
uniform float uReducedMotion;  // 0.0 or 1.0

// --- Ashima simplex noise (public domain) ---
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                         + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                          dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p){
  float sum = 0.0, amp = 0.5, freq = 1.0;
  for (int i = 0; i < 5; i++){
    sum  += amp * snoise(p * freq);
    freq *= 2.0;
    amp  *= 0.5;
  }
  return sum;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);

  float t = uTime * (uReducedMotion > 0.5 ? 0.0 : 0.018);

  // (1) gentle parallax drift toward the cursor
  p += (uMouse - 0.5) * 0.2;

  // time-animated domain warp
  vec2 q = vec2(fbm(p + vec2(0.0, t)),
                fbm(p + vec2(5.2, 1.3) - t * 0.5));

  // (2) subtle localized lens around the cursor
  float d    = distance(p, m);
  float pull = exp(-d * d * 3.0);
  vec2 warp  = q * (0.5 + 0.5 * pull);
  warp      += (p - m) * 0.1 * pull;

  float n = fbm(p * 1.4 + warp + vec2(t * 0.25, 0.0));
  n = n * 0.5 + 0.5;

  // brand palette: raisin-black -> NCS blue -> process cyan -> aero blue
  vec3 c0 = vec3(0.1176, 0.1294, 0.1686); // #1E212B
  vec3 c1 = vec3(0.0784, 0.5059, 0.7294); // #1481BA
  vec3 c2 = vec3(0.0471, 0.6667, 0.8627); // #0CAADC
  vec3 c3 = vec3(0.0667, 0.7098, 0.8941); // #11B5E4

  vec3 col = mix(c0, c1, smoothstep(0.00, 0.40, n));
  col      = mix(col, c2, smoothstep(0.35, 0.70, n));
  col      = mix(col, c3, smoothstep(0.70, 1.00, n));

  // (3) small spotlight lift toward the brightest blue near the cursor
  col = mix(col, c3, pull * 0.2);

  // vignette + overall darken so foreground text stays legible
  float vig = smoothstep(1.2, 0.2, distance(uv, vec2(0.5)));
  col *= mix(0.7, 1.0, vig);
  col *= 0.85;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log || "shader compile failed");
  }
  return shader;
}

/**
 * Full-viewport animated Perlin/simplex-noise background rendered with a WebGL
 * fragment shader. Flows slowly over time and eases toward the mouse cursor.
 * Decorative only (pointer-events: none, aria-hidden). Falls back to a CSS
 * gradient if WebGL is unavailable or fails to initialise.
 */
export default function NoiseBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let raf = 0;
    const target = { x: 0.5, y: 0.5 };
    const eased = { x: 0.5, y: 0.5 };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;

    if (!gl) {
      setFailed(true);
      return;
    }

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uMouse: WebGLUniformLocation | null = null;
    let uReduce: WebGLUniformLocation | null = null;

    const init = () => {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program);
        throw new Error(log || "program link failed");
      }
      gl.deleteShader(vs);
      gl.deleteShader(fs);

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      const loc = gl.getAttribLocation(program, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      gl.useProgram(program);
      uRes = gl.getUniformLocation(program, "uResolution");
      uTime = gl.getUniformLocation(program, "uTime");
      uMouse = gl.getUniformLocation(program, "uMouse");
      uReduce = gl.getUniformLocation(program, "uReducedMotion");
      gl.uniform1f(uReduce, reduce ? 1 : 0);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight; // GL is y-up
    };

    const startTime = performance.now();
    const draw = () => {
      if (disposed || !program) return;
      eased.x += (target.x - eased.x) * 0.06;
      eased.y += (target.y - eased.y) * 0.06;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduce ? 0 : (performance.now() - startTime) / 1000);
      gl.uniform2f(uMouse, eased.x, eased.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const frame = () => {
      if (disposed) return;
      resize();
      draw();
      raf = requestAnimationFrame(frame);
    };

    // Size the backing buffer (and paint a correctly-sized frame) as soon as
    // the canvas is laid out, independent of the rAF loop — which is throttled
    // in backgrounded tabs and may not have run yet.
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    const onRestored = () => {
      try {
        init();
        frame();
      } catch (err) {
        console.error("NoiseBackground restore failed:", err);
        setFailed(true);
      }
    };
    canvas.addEventListener("webglcontextlost", onLost as EventListener, false);
    canvas.addEventListener("webglcontextrestored", onRestored, false);

    try {
      init();
      resize();
      ro.observe(canvas);
      window.addEventListener("mousemove", onMove, { passive: true });
      frame();
    } catch (err) {
      console.error("NoiseBackground init failed:", err);
      setFailed(true);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost as EventListener);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  if (failed) {
    return <div className={`noise-bg noise-bg--fallback ${className}`} aria-hidden="true" />;
  }
  return <canvas ref={canvasRef} className={`noise-bg ${className}`} aria-hidden="true" />;
}
