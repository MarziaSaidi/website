import { useEffect, useRef } from "react";

const VERTEX = `
  attribute vec4 a_particle;
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform vec2 u_drag;
  uniform float u_time;
  uniform float u_active;
  uniform float u_energy;
  varying float v_alpha;
  varying float v_color;

  void main() {
    float depth = fract(a_particle.z - u_time * (0.012 + a_particle.w * 0.026));
    depth = max(depth, 0.13);
    vec2 world = a_particle.xy;
    world += vec2(sin(u_time * 0.17 + a_particle.z * 17.0), cos(u_time * 0.13 + a_particle.w * 19.0)) * 0.015;
    vec2 position = world * (0.34 / depth);
    float aspect = u_resolution.x / u_resolution.y;
    vec2 cursor = u_pointer - 0.5;
    cursor.x *= aspect;
    vec2 particle = vec2(position.x * aspect, position.y);
    vec2 delta = particle - cursor;
    float distance = length(delta) + 0.0001;
    // A single continuous displacement function is sampled by every point.
    // That is what makes this read as a connected soft surface, rather than
    // independent particles fleeing a tiny cursor radius.
    float field = pow(max(0.0, 1.0 - distance / 0.48), 2.0);
    vec2 normal = delta / distance;
    vec2 tangent = vec2(-normal.y, normal.x);
    float viscosity = max(u_energy, u_active * 0.32);
    float press = field * viscosity * 0.070;
    float wobble = sin(distance * 19.0 - u_time * 5.5) * field * u_energy * 0.014;
    position += normal * (press + wobble);
    position += tangent * field * viscosity * 0.028;
    position += u_drag * field * viscosity * 0.13;
    gl_Position = vec4(position * 2.0, 0.0, 1.0);
    gl_PointSize = 0.7 + (1.0 - depth) * 1.65;
    v_alpha = 0.055 + (1.0 - depth) * 0.16 + field * 0.05;
    v_color = a_particle.w;
  }
`;

const FRAGMENT = `
  precision mediump float;
  varying float v_alpha;
  varying float v_color;
  void main() {
    float circle = 1.0 - smoothstep(0.2, 0.72, length(gl_PointCoord - 0.5));
    vec3 color = v_color < 0.18 ? vec3(1.0, 0.42, 0.38) : v_color < 0.52 ? vec3(0.48, 0.42, 0.92) : vec3(0.96, 0.95, 1.0);
    gl_FragColor = vec4(color, v_alpha * circle);
  }
`;

function shader(gl, type, source) {
  const value = gl.createShader(type);
  gl.shaderSource(value, source);
  gl.compileShader(value);
  return gl.getShaderParameter(value, gl.COMPILE_STATUS) ? value : null;
}

// 90k GPU points make the dense far-field affordable. The Canvas layer above
// this handles the 10k close, interactive particles, for 100k total desktop
// particles without a 100k JavaScript draw loop.
export default function HeroGpuDustField({ sectionRef, pointerRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "high-performance" });
    if (!gl) return;
    const vertex = shader(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = shader(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const count = window.innerWidth < 768 ? 12000 : 90000;
    const particles = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const offset = i * 4;
      particles[offset] = Math.random() * 2 - 1;
      particles[offset + 1] = Math.random() * 2 - 1;
      particles[offset + 2] = Math.random();
      particles[offset + 3] = Math.random();
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, particles, gl.STATIC_DRAW);
    gl.useProgram(program);
    const attribute = gl.getAttribLocation(program, "a_particle");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const pointer = gl.getUniformLocation(program, "u_pointer");
    const drag = gl.getUniformLocation(program, "u_drag");
    const time = gl.getUniformLocation(program, "u_time");
    const active = gl.getUniformLocation(program, "u_active");
    const energy = gl.getUniformLocation(program, "u_energy");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, frame = 0, previous = 0;
    const field = { x: 0.5, y: 0.5, vx: 0, vy: 0, energy: 0 };

    function resize() {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function paint(now) {
      const input = pointerRef.current;
      const delta = previous ? Math.min(34, now - previous) / 1000 : 1 / 60;
      previous = now;
      const targetX = input.active ? input.x / Math.max(1, width) : field.x;
      const targetY = input.active ? 1 - input.y / Math.max(1, height) : field.y;
      // A spring-lagged cursor carries the large-field deformation forward,
      // then lets it overshoot and settle after the pointer stops.
      field.vx += ((targetX - field.x) * 95 - field.vx * 11) * delta;
      field.vy += ((targetY - field.y) * 95 - field.vy * 11) * delta;
      field.x += field.vx * delta;
      field.y += field.vy * delta;
      field.energy = Math.max(input.active ? Math.min(1, input.speed * 0.65 + 0.2) : 0, field.energy * Math.exp(-delta * 2.6));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointer, field.x, field.y);
      const dragScale = input.active ? 1 : field.energy;
      gl.uniform2f(drag, Math.max(-0.12, Math.min(0.12, input.vx * 0.08)) * dragScale, Math.max(-0.12, Math.min(0.12, -input.vy * 0.08)) * dragScale);
      gl.uniform1f(time, now * 0.001);
      gl.uniform1f(active, input.active ? 1 : 0);
      gl.uniform1f(energy, field.energy);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.drawArrays(gl.POINTS, 0, count);
      if (!reduced) frame = requestAnimationFrame(paint);
    }
    resize();
    paint(0);
    const observer = new ResizeObserver(resize);
    observer.observe(section);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [pointerRef, sectionRef]);

  return <canvas ref={canvasRef} className="hero-gpu-dust-field" aria-hidden="true" />;
}
