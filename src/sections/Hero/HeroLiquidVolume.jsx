import { useEffect, useRef } from "react";

const VERTEX = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

// This is deliberately a material layer, not an image texture. The broad
// domain warp is shared by the entire hero, so the particulate layers appear
// suspended inside one refractive, slow-moving volume.
const FRAGMENT = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform vec2 u_drag;
  uniform float u_time;
  uniform float u_energy;
  uniform float u_dark;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float value = 0., amplitude = .5;
    for (int i = 0; i < 4; i++) { value += amplitude * noise(p); p = p * 2.03 + 11.7; amplitude *= .5; }
    return value;
  }
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv - .5;
    p.x *= u_resolution.x / u_resolution.y;
    vec2 cursor = u_pointer - .5;
    cursor.x *= u_resolution.x / u_resolution.y;
    vec2 delta = p - cursor;
    float distance = length(delta) + .0001;
    float field = pow(max(0., 1. - distance / .54), 2.0);
    vec2 normal = delta / distance;
    vec2 tangent = vec2(-normal.y, normal.x);
    // The whole canvas samples this same displacement: a press, a long
    // directional pull, then a faint concentric settling wave.
    vec2 warp = normal * field * (.028 + u_energy * .055);
    warp += tangent * field * u_energy * .018;
    warp += u_drag * field * (.09 + u_energy * .08);
    float settling = sin(distance * 20. - u_time * 4.2) * field * u_energy;
    vec2 flow = p * 1.3 + warp + vec2(fbm(p * 2.1 + u_time * .025), fbm(p * 2.1 - u_time * .02)) * .13;
    float veins = fbm(flow * 4.0 + settling * .3);
    // Two frequency bands produce visible glassy sheets rather than a
    // generic colour wash. They stay low-contrast in light mode and read
    // as pearlescent caustics in the portfolio's dark theme.
    float caustic = smoothstep(.54, .86, veins) * .24 + smoothstep(.72, .92, fbm(flow * 8.0)) * .13 + settling * .05;
    float rim = smoothstep(.46, .06, abs(distance - (.19 + u_energy * .045))) * field * .10;
    vec3 lightBase = vec3(.91, .90, .99);
    vec3 darkBase = vec3(.105, .075, .25);
    vec3 base = mix(lightBase, darkBase, u_dark);
    vec3 tint = mix(vec3(.69, .63, .96), vec3(.71, .64, .98), u_dark);
    vec3 color = base + tint * (caustic + rim);
    color += vec3(1., .73, .76) * max(0., settling) * .035;
    // The original light-theme backdrop is intentionally untouched. A solid
    // WebGL wash, even at low opacity, changes that carefully tuned surface.
    // The liquid material therefore appears only in dark mode; light mode
    // keeps its original background and shows the interaction through the
    // particle layers above it.
    float opacity = mix(0.0, .62 + caustic * .16 + rim * .13, u_dark);
    gl_FragColor = vec4(color, opacity);
  }
`;

function makeShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export default function HeroLiquidVolume({ sectionRef, pointerRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "high-performance" });
    if (!gl) return;
    const vertex = makeShader(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = makeShader(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const pointer = gl.getUniformLocation(program, "u_pointer");
    const drag = gl.getUniformLocation(program, "u_drag");
    const time = gl.getUniformLocation(program, "u_time");
    const energy = gl.getUniformLocation(program, "u_energy");
    const dark = gl.getUniformLocation(program, "u_dark");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const field = { x: .5, y: .5, vx: 0, vy: 0, energy: 0 };
    let width = 0, height = 0, previous = 0, frame = 0, themeCheck = 0, darkMode = false;

    function resize() {
      const rect = section.getBoundingClientRect();
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function paint(now) {
      const input = pointerRef.current;
      const dt = previous ? Math.min(34, now - previous) / 1000 : 1 / 60;
      previous = now;
      const targetX = input.active ? input.x / Math.max(width, 1) : field.x;
      const targetY = input.active ? 1 - input.y / Math.max(height, 1) : field.y;
      field.vx += ((targetX - field.x) * 82 - field.vx * 10) * dt;
      field.vy += ((targetY - field.y) * 82 - field.vy * 10) * dt;
      field.x += field.vx * dt; field.y += field.vy * dt;
      field.energy = Math.max(input.active ? Math.min(1, input.speed * .7 + .18) : 0, field.energy * Math.exp(-dt * 2.2));
      // Theme changes are rare. Sampling the CSS token occasionally keeps
      // this canvas in sync with the site toggle without forcing style work
      // on every animation frame.
      if (now - themeCheck > 500) {
        darkMode = getComputedStyle(section).getPropertyValue("--color-hero-bg").trim() === "#211a4a";
        themeCheck = now;
      }
      const scale = input.active ? 1 : field.energy;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointer, field.x, field.y);
      gl.uniform2f(drag, Math.max(-.12, Math.min(.12, input.vx * .075)) * scale, Math.max(-.12, Math.min(.12, -input.vy * .075)) * scale);
      gl.uniform1f(time, now * .001); gl.uniform1f(energy, field.energy); gl.uniform1f(dark, darkMode ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced) frame = requestAnimationFrame(paint);
    }
    resize(); paint(0);
    const observer = new ResizeObserver(resize); observer.observe(section);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment); };
  }, [pointerRef, sectionRef]);

  return <canvas ref={canvasRef} className="hero-liquid-volume" aria-hidden="true" />;
}
