import { useEffect, useRef, useState } from "react";

const VERTEX = `#version 300 es
in vec2 a_position;
out vec2 uv;
void main() { uv = a_position * .5 + .5; gl_Position = vec4(a_position, 0., 1.); }
`;
const COMMON = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 result;
uniform sampler2D state;
uniform sampler2D curls;
uniform vec2 size;
uniform float dt;
vec4 cell(vec2 p) { return texture(state, clamp(p, .5 / size, 1. - .5 / size)); }
// Explicit bilinear interpolation works even without float-linear support.
vec4 field(vec2 p) {
  vec2 q = p * size - .5, f = fract(q), i = (floor(q) + .5) / size;
  return mix(mix(cell(i), cell(i + vec2(1.,0.)/size), f.x),
             mix(cell(i + vec2(0.,1.)/size), cell(i + 1./size), f.x), f.y);
}
`;
const CURL = COMMON + `
void main() {
  vec2 e = 1. / size;
  float c = .5 * (cell(uv + vec2(e.x,0.)).y - cell(uv - vec2(e.x,0.)).y
                   - cell(uv + vec2(0.,e.y)).x + cell(uv - vec2(0.,e.y)).x);
  result = vec4(c,0.,0.,0.);
}`;
const VELOCITY = COMMON + `
uniform vec2 start;
uniform vec2 end;
uniform vec2 impulse;
void main() {
  vec2 e = 1. / size;
  vec4 s = cell(uv);
  vec2 v = field(uv - s.xy * dt / size).xy;
  vec4 l = cell(uv - vec2(e.x,0.)), r = cell(uv + vec2(e.x,0.));
  vec4 b = cell(uv - vec2(0.,e.y)), t = cell(uv + vec2(0.,e.y));
  // Height is shallow-water pressure: its gradient pushes the flow back out.
  v -= 35. * dt * .5 * vec2(r.z-l.z,t.z-b.z);
  v += (l.xy+r.xy+b.xy+t.xy-4.*s.xy) * dt * 3.;
  float c = texture(curls,uv).x;
  vec2 g = .5 * vec2(abs(texture(curls,uv+vec2(e.x,0.)).x)-abs(texture(curls,uv-vec2(e.x,0.)).x),
                    abs(texture(curls,uv+vec2(0.,e.y)).x)-abs(texture(curls,uv-vec2(0.,e.y)).x));
  g /= length(g) + .0001;
  v += vec2(g.y,-g.x) * c * dt * 2.;
  // Integrate a swept pointer segment, so fast input cannot leave gaps.
  vec2 p = uv * size, a = start * size, segment = (end-start)*size;
  float along = clamp(dot(p-a,segment)/(dot(segment,segment)+.0001),0.,1.);
  vec2 d = (p-a-segment*along) / size.y;
  float speed = min(length(impulse)/30.,1.);
  float radius = mix(.075,.14,speed);
  float weight = exp(-dot(d,d)/(radius*radius));
  // A moving obstacle produces a counter-rotating pair, not one orbiting cursor.
  vec2 direction = impulse / (length(impulse)+.0001);
  vec2 across = vec2(-direction.y,direction.x);
  float side = dot(d,across)/radius;
  vec2 turn = vec2(-d.y,d.x)/radius;
  v += (impulse + turn * side * length(impulse) * 1.6) * weight;
  v *= exp(-dt*.48);
  float edge = smoothstep(0.,.035,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
  result = vec4(clamp(v,-100.,100.)*edge,s.z,0.);
}`;
const HEIGHT = COMMON + `
void main() {
  vec2 e = 1./size;
  vec4 s = cell(uv);
  float div = .5 * (cell(uv+vec2(e.x,0.)).x-cell(uv-vec2(e.x,0.)).x
                  +cell(uv+vec2(0.,e.y)).y-cell(uv-vec2(0.,e.y)).y);
  float h = field(uv-s.xy*dt/size).z - 35.*dt*div;
  h += dt * 2.5 * (cell(uv+vec2(e.x,0.)).z + cell(uv-vec2(e.x,0.)).z
                         + cell(uv+vec2(0.,e.y)).z + cell(uv-vec2(0.,e.y)).z - 4.*s.z);
  h *= exp(-dt*.38);
  float edge = smoothstep(0.,.04,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
  result = vec4(s.xy,clamp(h,-20.,20.)*edge,0.);
}`;
const MATERIAL = COMMON + `
uniform float dark;
float heightAt(vec2 p) { return field(p).z; }
void main() {
  vec2 e = 1./size;
  float h = heightAt(uv);
  vec2 slope = vec2(heightAt(uv+vec2(e.x,0.))-heightAt(uv-vec2(e.x,0.)),
                    heightAt(uv+vec2(0.,e.y))-heightAt(uv-vec2(0.,e.y))) * 2.8;
  vec3 n = normalize(vec3(-slope,1.));
  // Refract a continuous, low-frequency material; no points or emitted marks.
  vec2 p = uv * vec2(size.x/size.y,1.) + slope*.055;
  float silk = sin(p.x*5. + sin(p.y*6.)*.8) * sin(p.y*4.-p.x*2.);
  vec3 base = mix(vec3(.945,.941,1.),vec3(.129,.102,.290),dark);
  vec3 lavender = mix(vec3(.60,.54,.85),vec3(.39,.31,.65),dark);
  float diffuse = dot(n,normalize(vec3(-.5,.7,1.)));
  float spec = pow(max(0.,dot(n,normalize(vec3(-.35,.45,1.)))),24.);
  float flatSpec = pow(dot(vec3(0.,0.,1.),normalize(vec3(-.35,.45,1.))),24.);
  float bend = 1.-n.z;
  vec3 color = base + silk*.012;
  color = mix(color,lavender,clamp(bend*.55 + max(0.,.813-diffuse)*.32,0.,.6));
  color += (spec-flatSpec)*mix(.19,.32,dark) + tanh(h*.3)*vec3(.025,.018,.04);
  color += bend * vec3(.04,.015,.065);
  result = vec4(color,1.);
}`;

// RG = velocity (cells/second), B = height. Two feedback targets retain
// disturbances across the whole surface, including after the pointer leaves.
export default function HeroLiquidVolume({ sectionRef, pointerRef }) {
  const canvasRef = useRef(null);
  const [contextVersion, setContextVersion] = useState(0);
  useEffect(() => {
    const canvas = canvasRef.current, section = sectionRef.current;
    if (!canvas || !section) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    if (reduced.matches || coarse.matches) return;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, depth: false, powerPreference: "low-power" });
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) return;
    const programs = [], targets = [];
    let buffer, raf = 0, disposed = false, visible = true;
    let width = 1, height = 1, sw = 1, sh = 1, previous = 0, accumulator = 0;
    let lastInput = null, lastPosition = null;
    let read, write, curl;
    function program(source) {
      const shaders = [ [gl.VERTEX_SHADER,VERTEX], [gl.FRAGMENT_SHADER,source] ].map(([type,code]) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader,code); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
          const message = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(message);
        }
        return shader;
      });
      const p = gl.createProgram();
      shaders.forEach(s => gl.attachShader(p,s)); gl.linkProgram(p);
      shaders.forEach(s => gl.deleteShader(s));
      if (!gl.getProgramParameter(p,gl.LINK_STATUS)) { gl.deleteProgram(p); throw new Error("Liquid program link failed"); }
      programs.push(p);
      const uniforms = {};
      for (let i=0; i<gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS); i++) {
        const name = gl.getActiveUniform(p,i).name; uniforms[name] = gl.getUniformLocation(p,name);
      }
      return { p, uniforms };
    }
    function destroyTargets() {
      targets.splice(0).forEach(t => { gl.deleteTexture(t.texture); gl.deleteFramebuffer(t.fbo); });
    }
    function target() {
      const texture = gl.createTexture(), fbo = gl.createFramebuffer();
      const t = { texture, fbo }; targets.push(t);
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,sw,sh,0,gl.RGBA,gl.HALF_FLOAT,null);
      gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) throw new Error("Liquid framebuffer unavailable");
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      return t;
    }
    function pass(shader, output, values={}) {
      gl.useProgram(shader.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER,output?.fbo || null);
      gl.viewport(0,0,output ? sw : canvas.width,output ? sh : canvas.height);
      const u = shader.uniforms;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,read.texture); gl.uniform1i(u.state,0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,curl.texture); gl.uniform1i(u.curls,1);
      gl.uniform2f(u.size,sw,sh); gl.uniform1f(u.dt,1/120);
      for (const [key,value] of Object.entries(values)) {
        if (Array.isArray(value)) gl.uniform2f(u[key],...value); else gl.uniform1f(u[key],value);
      }
      const pos = gl.getAttribLocation(shader.p,"a_position");
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
      gl.drawArrays(gl.TRIANGLES,0,3);
    }
    const swap = () => { [read,write] = [write,read]; };
    let curlProgram, velocityProgram, heightProgram, materialProgram;
    function resize() {
      const rect = section.getBoundingClientRect();
      width = Math.max(1,rect.width); height = Math.max(1,rect.height);
      const dpr = Math.min(devicePixelRatio || 1,1.5,1600/width);
      canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
      // Square simulation cells, at most 256 on the longer axis.
      const scale = Math.min(256/width,256/height);
      sw = Math.max(32,Math.round(width*scale)); sh = Math.max(32,Math.round(height*scale));
      destroyTargets(); read=target(); write=target(); curl=target();
      lastInput=null; lastPosition=null; accumulator=0;
    }
    function paint(now) {
      raf=0;
      if (disposed || !visible || document.hidden || reduced.matches || coarse.matches) return;
      accumulator += previous ? Math.min((now-previous)/1000,1/30) : 1/60;
      previous=now;
      const input=pointerRef.current;
      const end=[input.x/width,1-input.y/height];
      let start=end, impulse=[0,0];
      const steps=Math.min(4,Math.floor((accumulator+1e-8)*120));
      if (steps && input !== lastInput) {
        if (input.active && lastPosition) {
          start=lastPosition;
          const dx=(end[0]-start[0])*sw, dy=(end[1]-start[1])*sh;
          const cap=Math.min(1,32/(Math.hypot(dx,dy)+.0001));
          impulse=[dx*cap*1.6/steps,dy*cap*1.6/steps];
        }
        lastPosition=input.active ? end : null; lastInput=input;
      }
      if (!input.active) lastPosition=null;
      for (let i=0;i<steps;i++) {
        pass(curlProgram,curl);
        pass(velocityProgram,write,{start,end,impulse}); swap();
        pass(heightProgram,write); swap();
        accumulator-=1/120;
      }
      pass(materialProgram,null,{dark:document.documentElement.dataset.theme === "dark" ? 1 : 0});
      raf=requestAnimationFrame(paint);
    }
    function resume() {
      previous=0; lastPosition=null;
      canvas.style.visibility = reduced.matches || coarse.matches ? "hidden" : "";
      if (!raf) raf=requestAnimationFrame(paint);
    }
    function contextLost(e) { e.preventDefault(); cancelAnimationFrame(raf); raf=0; }
    function contextRestored() { setContextVersion(value => value + 1); }
    let resizeObserver, intersectionObserver;
    try {
      curlProgram=program(CURL); velocityProgram=program(VELOCITY); heightProgram=program(HEIGHT); materialProgram=program(MATERIAL);
      buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
      resize(); resume();
      resizeObserver=new ResizeObserver(() => { try { resize(); resume(); } catch (error) { console.warn(error); cancelAnimationFrame(raf); } });
      resizeObserver.observe(section);
      intersectionObserver=new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; if (visible) resume(); });
      intersectionObserver.observe(section);
      document.addEventListener("visibilitychange",resume);
      reduced.addEventListener("change",resume); coarse.addEventListener("change",resume);
      canvas.addEventListener("webglcontextlost",contextLost);
      canvas.addEventListener("webglcontextrestored",contextRestored);
    } catch (error) { console.warn("Liquid background unavailable:",error); }
    return () => {
      disposed=true; cancelAnimationFrame(raf); resizeObserver?.disconnect(); intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange",resume);
      reduced.removeEventListener("change",resume); coarse.removeEventListener("change",resume);
      canvas.removeEventListener("webglcontextlost",contextLost); canvas.removeEventListener("webglcontextrestored",contextRestored);
      destroyTargets(); programs.forEach(p => gl.deleteProgram(p)); if (buffer) gl.deleteBuffer(buffer);
    };
  }, [sectionRef,pointerRef,contextVersion]);
  return <canvas ref={canvasRef} className="hero-liquid-volume" aria-hidden="true" />;
}
