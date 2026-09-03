import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Vertex displacement is uploaded from the CPU (the same per-node
// spring-damper simulation as the earlier Canvas2D version — see
// useFrame below), but the GEOMETRY itself now actually moves in 3D, and
// the fragment shader derives real (if cheap) lighting from that moved
// surface every frame — this is what a flat 2D canvas warp structurally
// could not do: light response to a shape that's actually changed.
const VERTEX_SHADER = `
  attribute vec2 aDisplacement;
  uniform float uMaxDisp;
  uniform float uBulge;
  varying vec2 vUv;
  varying float vDisp;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vDisp = length(aDisplacement) / max(uMaxDisp, 0.001);
    vec3 pos = position;
    pos.x += aDisplacement.x;
    pos.y += aDisplacement.y;
    // Slight push toward the camera where displacement is strongest, so
    // the surface reads as bulging/pinching in 3D rather than sliding
    // flat across a plane.
    pos.z += vDisp * uBulge;
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Draws the icon/MARZIA texture exactly as-is — no lighting, no color
// mixing at all. The deforming geometry (see the vertex shader above)
// still bends this layer, but its own color is never touched; the glass
// look lives entirely in the separate overlay layer below it.
const BASE_FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D uTexture;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    if (tex.a < 0.02) discard;
    gl_FragColor = vec4(tex.rgb, tex.a * uOpacity);
  }
`;

// A separate glass layer, sitting in front of (not replacing) the base
// texture above — additively blended, so it can only ADD light/shine,
// never recolor what's underneath. dFdx/dFdy on the actual displaced
// world position give a real (screen-space) surface normal for the
// CURRENT frame's bend, driving a Blinn-Phong specular highlight, a
// fresnel-based edge glint, and a faint iridescent shimmer — masked to
// the same texture alpha so the glass only glints where the shape
// itself is, not over empty space.
const GLASS_FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D uTexture;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vDisp;
  varying vec3 vWorldPos;

  void main() {
    float mask = texture2D(uTexture, vUv).a;
    if (mask < 0.02) discard;

    vec3 dx = dFdx(vWorldPos);
    vec3 dy = dFdy(vWorldPos);
    vec3 normal = normalize(cross(dx, dy));

    vec3 lightDir = normalize(vec3(0.35, 0.55, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), 28.0);
    float fres = pow(1.0 - clamp(abs(normal.z), 0.0, 1.0), 2.0);

    vec3 iri = 0.5 + 0.5 * cos(6.28318 * (vDisp * 2.2 + fres + vec3(0.0, 0.33, 0.66)));
    vec3 glint = spec * 1.1 + iri * fres * 0.35;

    gl_FragColor = vec4(glint * mask, (spec + fres * 0.4) * mask * uOpacity);
  }
`;

// The "side wall" of a real extrusion — flat-shaded (no lighting calc
// needed, it's meant to read as a solid depth edge, not another lit
// surface), masked to the same texture alpha, tinted a fixed dark shade
// of the base color rather than an unrelated color (the same relationship
// any physically extruded material has between its front face and sides).
const SIDE_FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D uTexture;
  uniform vec3 uSideColor;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    float mask = texture2D(uTexture, vUv).a;
    if (mask < 0.02) discard;
    gl_FragColor = vec4(uSideColor, mask * uOpacity);
  }
`;

// A subdivided plane whose vertices are pulled toward the cursor (plus a
// velocity-direction stretch), spring back toward rest, and lose energy
// each frame — identical soft-body physics to the earlier Canvas2D
// version, just driving a real GPU vertex attribute instead of a
// per-triangle affine image warp.
export default function SoftBodyMesh({
  texture,
  width,
  height,
  gridCols,
  gridRows,
  getLocalCursor,
  // A callback (not a plain prop) because opacity can change every
  // frame from a parent's own imperative animation loop (the falling
  // icons' fade in/out) rather than through a React re-render — same
  // reasoning as getLocalCursor below.
  getOpacity = () => 1,
  influenceRadius,
  pull = 0.9,
  flow = 1.6,
  spring = 0.14,
  damping = 0.82,
  maxOffsetFactor = 0.6,
  bulge = 18,
  // Real geometric extrusion — a stack of dark "side wall" copies offset
  // diagonally behind the front face, the classic embossed/beveled-text
  // technique. 0 (the default) renders nothing extra, so icons stay
  // exactly as they were; MARZIA opts in explicitly.
  extrudeDepth = 0,
  extrudeSteps = 10,
  sideColor = "#241f4d",
}) {
  const nodesRef = useRef(null);

  const { geometry, maxOffset } = useMemo(() => {
    const positions = [];
    const uvs = [];
    const indices = [];
    for (let j = 0; j <= gridRows; j++) {
      for (let i = 0; i <= gridCols; i++) {
        positions.push((i / gridCols) * width, (j / gridRows) * height, 0);
        uvs.push(i / gridCols, 1 - j / gridRows);
      }
    }
    for (let j = 0; j < gridRows; j++) {
      for (let i = 0; i < gridCols; i++) {
        const a = j * (gridCols + 1) + i;
        const b = a + 1;
        const c = a + (gridCols + 1);
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute(
      "aDisplacement",
      new THREE.Float32BufferAttribute(new Float32Array((positions.length / 3) * 2), 2)
    );
    geo.setIndex(indices);

    nodesRef.current = [];
    for (let i = 0; i < positions.length / 3; i++) {
      nodesRef.current.push({ rx: positions[i * 3], ry: positions[i * 3 + 1], ox: 0, oy: 0, vx: 0, vy: 0 });
    }

    return { geometry: geo, maxOffset: Math.min(width, height) * maxOffsetFactor };
  }, [width, height, gridCols, gridRows, maxOffsetFactor]);

  // One shared uniforms object for both layers — they read the exact
  // same texture and displacement scale, so there's nothing to diverge.
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uMaxDisp: { value: maxOffset },
      uBulge: { value: bulge },
      uOpacity: { value: 1 },
      uSideColor: { value: new THREE.Color(sideColor) },
    }),
    [texture, maxOffset, bulge, sideColor]
  );

  // Evenly spaced steps from just behind the front face back to the full
  // extrude depth — a diagonal offset (down-right, as if lit from the
  // upper-left) rather than pure Z, which is what actually sells the
  // bevel; straight-back offset alone reads as a blurry shadow, not a
  // wall you can see the side of.
  const extrudeLayers = useMemo(() => {
    if (extrudeDepth <= 0) return [];
    const dir = { x: extrudeDepth * 0.4, y: extrudeDepth * 0.4 };
    return Array.from({ length: extrudeSteps }, (_, i) => {
      const t = (i + 1) / extrudeSteps;
      return [dir.x * t, dir.y * t, -extrudeDepth * t];
    });
  }, [extrudeDepth, extrudeSteps]);

  useFrame(() => {
    if (!texture) return;
    uniforms.uOpacity.value = getOpacity();
    const { x: cx, y: cy, vx: cvx, vy: cvy } = getLocalCursor();
    const nodes = nodesRef.current;
    const attr = geometry.getAttribute("aDisplacement");
    const speed = Math.min(3, Math.hypot(cvx, cvy) * 8);

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const px = n.rx + n.ox;
      const py = n.ry + n.oy;
      const ddx = cx - px;
      const ddy = cy - py;
      const dist = Math.hypot(ddx, ddy);
      const tt = Math.min(1, dist / influenceRadius);
      const falloff = 0.5 + 0.5 * Math.cos(tt * Math.PI);
      const nx = dist > 0.001 ? ddx / dist : 0;
      const ny = dist > 0.001 ? ddy / dist : 0;

      const pullForce = falloff * pull * (0.4 + speed);
      n.vx += nx * pullForce + cvx * falloff * flow;
      n.vy += ny * pullForce + cvy * falloff * flow;
      n.vx += -n.ox * spring;
      n.vy += -n.oy * spring;
      n.vx *= damping;
      n.vy *= damping;
      n.ox += n.vx;
      n.oy += n.vy;

      const mag = Math.hypot(n.ox, n.oy);
      if (mag > maxOffset) {
        n.ox = (n.ox / mag) * maxOffset;
        n.oy = (n.oy / mag) * maxOffset;
      }

      attr.setXY(i, n.ox, n.oy);
    }
    attr.needsUpdate = true;
  });

  return (
    <>
      {/* Furthest-back step first, front face last — normal opaque depth
          testing then does the actual occlusion, this ordering just
          keeps the JSX reading front-to-back the way the eye sees it. */}
      {extrudeLayers
        .slice()
        .reverse()
        .map(([x, y, z], i) => (
          <mesh key={i} geometry={geometry} position={[x, y, z]}>
            <shaderMaterial
              vertexShader={VERTEX_SHADER}
              fragmentShader={SIDE_FRAGMENT_SHADER}
              uniforms={uniforms}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      <mesh geometry={geometry}>
        <shaderMaterial
          vertexShader={VERTEX_SHADER}
          fragmentShader={BASE_FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Tiny Z offset so this doesn't z-fight with the base layer above
          (both share the exact same geometry/displacement) — additive
          blending means it can only brighten, never recolor, what the
          base layer already drew. */}
      <mesh geometry={geometry} position={[0, 0, 0.5]}>
        <shaderMaterial
          vertexShader={VERTEX_SHADER}
          fragmentShader={GLASS_FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}
