import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function GalaxyDust({ theme }) {
  const mountRef = useRef(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const width = window.innerWidth;

    const pixelRatio = Math.min(
      window.devicePixelRatio,
      1.6
    );

    let PARTICLE_COUNT = 30000;

    if (width >= 1600) {
      PARTICLE_COUNT = 55000;
    } else if (width >= 1200) {
      PARTICLE_COUNT = 45000;
    } else if (width >= 768) {
      PARTICLE_COUNT = 30000;
    } else {
      PARTICLE_COUNT = 8000;
    }

    if (pixelRatio > 1.4 && width < 1400) {
      PARTICLE_COUNT = Math.floor(
        PARTICLE_COUNT * 0.85
      );
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      52,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );

    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 1.6)
    );

    renderer.setSize(
      mount.clientWidth,
      mount.clientHeight
    );

    renderer.setClearColor(0x000000, 0);

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    mount.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(
      PARTICLE_COUNT * 3
    );

    const colorsDark = new Float32Array(
      PARTICLE_COUNT * 3
    );

    const colorsLight = new Float32Array(
      PARTICLE_COUNT * 3
    );

    const sizes = new Float32Array(
      PARTICLE_COUNT
    );

    const opacity = new Float32Array(
      PARTICLE_COUNT
    );

    const particles = [];

    const darkPalette = [
      new THREE.Color("#FFFFFF"),
      new THREE.Color("#DDE8FF"),
      new THREE.Color("#B9CEFF"),
      new THREE.Color("#91B4FF"),
      new THREE.Color("#B8A4FF"),
      new THREE.Color("#D6B8FF"),
    ];

    /*
      Aurora Dusk palette. Weighted, not uniform — lavender
      leads, cyan is occasional, pink is almost never picked.
    */

    const lightPaletteWeighted = [
      { color: new THREE.Color("#B69CFF"), weight: 0.35 },
      { color: new THREE.Color("#9CCBFF"), weight: 0.25 },
      { color: new THREE.Color("#8195FF"), weight: 0.18 },
      { color: new THREE.Color("#EDF3FF"), weight: 0.12 },
      { color: new THREE.Color("#8FE7EA"), weight: 0.08 },
      { color: new THREE.Color("#E8A5D2"), weight: 0.02 },
    ];

    function pickWeighted(entries) {
      const roll = Math.random();
      let cumulative = 0;

      for (const entry of entries) {
        cumulative += entry.weight;
        if (roll < cumulative) return entry.color;
      }

      return entries[entries.length - 1].color;
    }

    const darkStarColor = new THREE.Color("#FFFFFF");
    const lightStarColor = new THREE.Color("#EDF3FF");

    function gaussian() {
      let u = 0;
      let v = 0;

      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();

      return (
        Math.sqrt(-2 * Math.log(u)) *
        Math.cos(2 * Math.PI * v)
      );
    }

    function galaxyStream() {
      const stream = Math.floor(
        Math.random() * 6
      );

      const t = Math.random();

      let centerX = 0;
      let centerY = 0;

      if (stream === 0) {
        centerX =
          -0.9 +
          t * 7.2;

        centerY =
          1.25 +
          Math.sin(t * Math.PI * 1.45) *
            1.2;
      }

      if (stream === 1) {
        centerX =
          -0.1 +
          t * 6.5;

        centerY =
          -1.6 +
          Math.sin(
            t * Math.PI * 1.7 + 1
          ) *
            1.35;
      }

      if (stream === 2) {
        centerX =
          0.8 +
          t * 5.4;

        centerY =
          -0.15 +
          Math.sin(
            t * Math.PI * 2.15 + 2.3
          ) *
            1.9;
      }

      if (stream === 3) {
        centerX =
          -1.4 +
          t * 6.9;

        centerY =
          2.2 -
          t * 3.9 +
          Math.sin(
            t * Math.PI * 1.4
          ) *
            0.65;
      }

      if (stream === 4) {
        centerX =
          1 +
          t * 5.5;

        centerY =
          2.7 -
          t * 4.8 +
          Math.sin(
            t * Math.PI * 2
          ) *
            0.55;
      }

      if (stream === 5) {
        centerX =
          -0.5 +
          t * 6;

        centerY =
          -2.4 +
          t * 3.5 +
          Math.cos(
            t * Math.PI * 1.7
          ) *
            0.75;
      }

      const thickness =
        0.07 +
        Math.random() * 0.2;

      const x =
        centerX +
        gaussian() * thickness * 1.7;

      const y =
        centerY +
        gaussian() * thickness;

      const z =
        gaussian() * 0.45;

      return {
        x,
        y,
        z,
      };
    }

    function galaxyCluster() {
      const clusters = [
        {
          x: 0.45,
          y: 1.65,
          sx: 0.48,
          sy: 0.72,
        },
        {
          x: 1.8,
          y: 0.35,
          sx: 0.8,
          sy: 0.46,
        },
        {
          x: 3.1,
          y: -1.15,
          sx: 0.8,
          sy: 0.5,
        },
        {
          x: 4.25,
          y: 1.55,
          sx: 0.62,
          sy: 0.88,
        },
        {
          x: 1.05,
          y: -2.0,
          sx: 0.8,
          sy: 0.4,
        },
      ];

      const cluster =
        clusters[
          Math.floor(
            Math.random() *
              clusters.length
          )
        ];

      return {
        x:
          cluster.x +
          gaussian() * cluster.sx,

        y:
          cluster.y +
          gaussian() * cluster.sy,

        z:
          gaussian() * 0.42,
      };
    }

    function backgroundDust() {
      let x =
        (Math.random() - 0.5) * 13;

      const y =
        (Math.random() - 0.5) * 7.2;

      const z =
        (Math.random() - 0.5) * 3;

      /*
        Keep left side calmer.
      */

      if (x < -1.8 && Math.random() < 0.62) {
        x += Math.random() * 2.6;
      }

      return {
        x,
        y,
        z,
      };
    }

    for (
      let i = 0;
      i < PARTICLE_COUNT;
      i++
    ) {
      const i3 = i * 3;

      const choice = Math.random();

      let point;

      if (choice < 0.65) {
        point = galaxyStream();
      } else if (choice < 0.85) {
        point = galaxyCluster();
      } else {
        point = backgroundDust();
      }

      let { x, y } = point;
      const { z } = point;

      /*
        Mild organic distortion.
      */

      x +=
        Math.sin(
          y * 1.3 + x * 0.18
        ) * 0.12;

      y +=
        Math.sin(
          x * 0.85
        ) * 0.08;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      particles.push({
        homeX: x,
        homeY: y,
        homeZ: z,

        vx: 0,
        vy: 0,
        vz: 0,

        phase:
          Math.random() *
          Math.PI *
          2,

        reaction:
          0.65 +
          Math.random() * 0.75,
      });

      /*
        Particle size.

        Most particles must remain microscopic.

        Only very few should look like bright stars.
      */

      const random =
        Math.random();

      if (random > 0.993) {
        sizes[i] =
          5 +
          Math.random() * 3;
      } else if (random > 0.94) {
        sizes[i] =
          2 +
          Math.random() * 1.4;
      } else {
        sizes[i] =
          0.65 +
          Math.random() * 1.1;
      }

      /*
        Brightness.
      */

      if (random > 0.993) {
        opacity[i] = 1;
      } else {
        opacity[i] =
          0.2 +
          Math.random() * 0.65;
      }

      /*
        Color.

        Mostly cold white and blue.

        Purple should be subtle.

        Two palettes are baked per particle (dark theme,
        light theme) so switching themes only needs to mix
        between them in the shader — never regenerate
        positions or recreate the particle system.

        Rare "bright star" particles flip roles between
        themes: brightest white in dark mode, darkest
        high-contrast ink in light mode.
      */

      const isStar = random > 0.993;

      const darkSource = isStar
        ? darkStarColor
        : darkPalette[
            Math.floor(
              Math.random() *
                darkPalette.length
            )
          ];

      const lightSource = isStar
        ? lightStarColor
        : pickWeighted(lightPaletteWeighted);

      const depthBrightness =
        THREE.MathUtils.mapLinear(
          z,
          -1.5,
          1.5,
          0.65,
          1
        );

      colorsDark[i3] =
        darkSource.r *
        depthBrightness;

      colorsDark[i3 + 1] =
        darkSource.g *
        depthBrightness;

      colorsDark[i3 + 2] =
        darkSource.b *
        depthBrightness;

      colorsLight[i3] =
        lightSource.r *
        depthBrightness;

      colorsLight[i3 + 1] =
        lightSource.g *
        depthBrightness;

      colorsLight[i3 + 2] =
        lightSource.b *
        depthBrightness;
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    geometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(
        sizes,
        1
      )
    );

    geometry.setAttribute(
      "aOpacity",
      new THREE.BufferAttribute(
        opacity,
        1
      )
    );

    geometry.setAttribute(
      "aColorDark",
      new THREE.BufferAttribute(
        colorsDark,
        3
      )
    );

    geometry.setAttribute(
      "aColorLight",
      new THREE.BufferAttribute(
        colorsLight,
        3
      )
    );

    const material =
      new THREE.ShaderMaterial({
        transparent: true,

        depthWrite: false,

        /*
          Both themes render against a dark backdrop (deep
          space vs. aurora dusk), so additive blending stays
          correct for either — no per-theme blend-mode swap
          needed.
        */

        blending:
          THREE.AdditiveBlending,

        uniforms: {
          uPixelRatio: {
            value: Math.min(
              window.devicePixelRatio,
              1.6
            ),
          },

          /*
            uThemeT drives the dark -> light mix.

            It is eased toward a target each frame in the
            animation loop rather than snapped, so a theme
            toggle fades the whole galaxy instead of
            popping between two looks.
          */

          uThemeT: {
            value:
              theme === "light" ? 1 : 0,
          },

          uOpacityBoost: {
            value:
              theme === "light" ? 1.08 : 1,
          },

          uGlowMul: {
            value:
              theme === "light" ? 0.85 : 1,
          },
        },

        vertexShader: `
          attribute float aSize;
          attribute float aOpacity;
          attribute vec3 aColorDark;
          attribute vec3 aColorLight;

          varying float vOpacity;
          varying vec3 vColor;

          uniform float uPixelRatio;
          uniform float uThemeT;

          void main() {

            vOpacity = aOpacity;
            vColor = mix(aColorDark, aColorLight, uThemeT);

            vec4 viewPosition =
              modelViewMatrix *
              vec4(position, 1.0);

            gl_Position =
              projectionMatrix *
              viewPosition;

            float perspective =
              7.5 /
              max(
                2.0,
                -viewPosition.z
              );

            gl_PointSize =
              aSize *
              perspective *
              uPixelRatio;

            gl_PointSize =
              clamp(
                gl_PointSize,
                0.7,
                5.5
              );
          }
        `,

        fragmentShader: `
          varying float vOpacity;
          varying vec3 vColor;

          uniform float uOpacityBoost;
          uniform float uGlowMul;

          void main() {

            vec2 center =
              gl_PointCoord -
              vec2(0.5);

            float d =
              length(center);

            if (d > 0.5) {
              discard;
            }

            /*
              Small sharp center with a tiny soft edge.

              Do not create large blurry particles.
            */

            float outer =
              smoothstep(
                0.5,
                0.18,
                d
              );

            float core =
              smoothstep(
                0.17,
                0.0,
                d
              );

            float alpha =
              outer * 0.32 * uGlowMul +
              core * 0.9;

            alpha *= vOpacity * uOpacityBoost;

            vec3 finalColor =
              vColor *
              (
                0.65 +
                core * 0.8
              );

            gl_FragColor =
              vec4(
                finalColor,
                alpha
              );
          }
        `,
      });

    const points =
      new THREE.Points(
        geometry,
        material
      );

    scene.add(points);

    /*
      Cursor state.
    */

    const pointer = {
      x: 100,
      y: 100,

      previousX: 0,
      previousY: 0,

      velocityX: 0,
      velocityY: 0,

      initialized: false,
      active: false,
    };

    function pointerToWorld(
      clientX,
      clientY
    ) {
      const rect =
        mount.getBoundingClientRect();

      const ndcX =
        ((clientX - rect.left) /
          rect.width) *
          2 -
        1;

      const ndcY =
        -(
          ((clientY - rect.top) /
            rect.height) *
            2 -
          1
        );

      const vector =
        new THREE.Vector3(
          ndcX,
          ndcY,
          0.5
        );

      vector.unproject(camera);

      const direction =
        vector
          .sub(camera.position)
          .normalize();

      const distance =
        -camera.position.z /
        direction.z;

      return camera.position
        .clone()
        .add(
          direction.multiplyScalar(
            distance
          )
        );
    }

    function onPointerMove(
      event
    ) {
      const world =
        pointerToWorld(
          event.clientX,
          event.clientY
        );

      if (!pointer.initialized) {
        pointer.previousX =
          world.x;

        pointer.previousY =
          world.y;

        pointer.initialized =
          true;
      }

      const rawVX =
        world.x -
        pointer.previousX;

      const rawVY =
        world.y -
        pointer.previousY;

      pointer.velocityX =
        THREE.MathUtils.lerp(
          pointer.velocityX,
          rawVX,
          0.45
        );

      pointer.velocityY =
        THREE.MathUtils.lerp(
          pointer.velocityY,
          rawVY,
          0.45
        );

      pointer.previousX =
        world.x;

      pointer.previousY =
        world.y;

      pointer.x =
        world.x;

      pointer.y =
        world.y;

      pointer.active =
        true;
    }

    function onPointerLeave() {
      pointer.active =
        false;

      pointer.x = 100;
      pointer.y = 100;

      pointer.velocityX *=
        0.3;

      pointer.velocityY *=
        0.3;
    }

    /*
      Listen to the whole hero area.

      Do not rely only on the canvas because
      hero text and buttons may sit above it.
    */

    const hero =
      mount.parentElement ||
      mount;

    hero.addEventListener(
      "pointermove",
      onPointerMove
    );

    hero.addEventListener(
      "pointerleave",
      onPointerLeave
    );

    const positionAttribute =
      geometry.getAttribute(
        "position"
      );

    const positionArray =
      positionAttribute.array;

    const clock =
      new THREE.Clock();

    let raf = 0;

    /*
      Physics tuning.

      These values are intentional.

      Do not replace the spring system with lerp().
    */

    const BASE_RADIUS =
      1.15;

    const REPULSION =
      0.027;

    const CURSOR_TRANSFER =
      0.12;

    const SPRING =
      0.0032;

    const DAMPING =
      0.94;

    const AMBIENT_DRIFT =
      0.00011;

    const SWIRL =
      0.004;

    function animate() {
      raf =
        requestAnimationFrame(
          animate
        );

      const time =
        clock.getElapsedTime();

      /*
        Ease the dark/light mix toward the current theme
        every frame instead of snapping — roughly 400-700ms
        to settle at this rate. Blending stays additive for
        both themes (both are dark backdrops), so there is
        no GL state to flip here, only color/opacity/glow.
      */

      const themeTarget =
        themeRef.current === "light" ? 1 : 0;

      const themeUniforms =
        material.uniforms;

      themeUniforms.uThemeT.value +=
        (themeTarget - themeUniforms.uThemeT.value) * 0.08;

      themeUniforms.uOpacityBoost.value +=
        (
          (themeTarget ? 1.08 : 1) -
          themeUniforms.uOpacityBoost.value
        ) * 0.08;

      themeUniforms.uGlowMul.value +=
        (
          (themeTarget ? 0.85 : 1) -
          themeUniforms.uGlowMul.value
        ) * 0.08;

      pointer.velocityX *=
        0.9;

      pointer.velocityY *=
        0.9;

      const cursorSpeed =
        Math.sqrt(
          pointer.velocityX *
            pointer.velocityX +
            pointer.velocityY *
              pointer.velocityY
        );

      const cursorForce =
        Math.min(
          cursorSpeed * 10,
          2.4
        );

      for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
      ) {
        const i3 =
          i * 3;

        const particle =
          particles[i];

        let x =
          positionArray[i3];

        let y =
          positionArray[i3 + 1];

        let z =
          positionArray[i3 + 2];

        /*
          Constant tiny movement.

          The galaxy should feel alive even
          when the cursor is idle.
        */

        particle.vx +=
          Math.sin(
            time * 0.2 +
              particle.phase +
              y * 0.5
          ) *
          AMBIENT_DRIFT;

        particle.vy +=
          Math.cos(
            time * 0.17 +
              particle.phase +
              x * 0.45
          ) *
          AMBIENT_DRIFT;

        if (pointer.active) {
          const dx =
            x -
            pointer.x;

          const dy =
            y -
            pointer.y;

          const distanceSquared =
            dx * dx +
            dy * dy;

          /*
            Make radius slightly irregular.

            This prevents the cursor from
            creating a perfect circular hole.
          */

          const radiusNoise =
            Math.sin(
              particle.phase * 2 +
                time * 0.85
            ) *
            0.14;

          const radius =
            BASE_RADIUS *
            (
              1 +
              radiusNoise
            );

          if (
            distanceSquared <
            radius * radius
          ) {
            const distance =
              Math.sqrt(
                distanceSquared
              ) + 0.0001;

            const normalized =
              THREE.MathUtils.clamp(
                distance / radius,
                0,
                1
              );

            const falloff =
              Math.pow(
                1 -
                  normalized,
                2.35
              );

            const directionX =
              dx /
              distance;

            const directionY =
              dy /
              distance;

            /*
              Near particles should react more.
            */

            const depthReaction =
              THREE.MathUtils.mapLinear(
                particle.homeZ,
                -1.5,
                1.5,
                0.65,
                1.25
              );

            const force =
              REPULSION *
              falloff *
              particle.reaction *
              depthReaction *
              (
                1 +
                cursorForce
              );

            /*
              Main repulsion.
            */

            particle.vx +=
              directionX *
              force;

            particle.vy +=
              directionY *
              force;

            /*
              Mouse momentum transfer.

              Fast sweeps should carry particles
              in the cursor direction.
            */

            particle.vx +=
              pointer.velocityX *
              CURSOR_TRANSFER *
              falloff;

            particle.vy +=
              pointer.velocityY *
              CURSOR_TRANSFER *
              falloff;

            /*
              Small tangent force creates
              natural curling at the edge.
            */

            const swirlDirection =
              Math.sin(
                particle.phase
              ) >
              0
                ? 1
                : -1;

            particle.vx +=
              -directionY *
              SWIRL *
              falloff *
              swirlDirection;

            particle.vy +=
              directionX *
              SWIRL *
              falloff *
              swirlDirection;
          }
        }

        /*
          Spring physics back to the original
          galaxy structure.
        */

        particle.vx +=
          (
            particle.homeX -
            x
          ) *
          SPRING;

        particle.vy +=
          (
            particle.homeY -
            y
          ) *
          SPRING;

        particle.vz +=
          (
            particle.homeZ -
            z
          ) *
          SPRING *
          0.6;

        /*
          Momentum damping.
        */

        particle.vx *=
          DAMPING;

        particle.vy *=
          DAMPING;

        particle.vz *=
          DAMPING;

        /*
          Limit extreme velocity.

          Prevents particles from flying away
          permanently during fast cursor sweeps.
        */

        const maxVelocity =
          0.085;

        particle.vx =
          THREE.MathUtils.clamp(
            particle.vx,
            -maxVelocity,
            maxVelocity
          );

        particle.vy =
          THREE.MathUtils.clamp(
            particle.vy,
            -maxVelocity,
            maxVelocity
          );

        x += particle.vx;
        y += particle.vy;
        z += particle.vz;

        positionArray[i3] =
          x;

        positionArray[i3 + 1] =
          y;

        positionArray[i3 + 2] =
          z;
      }

      positionAttribute.needsUpdate =
        true;

      /*
        Extremely subtle global movement.

        It should not look like the whole galaxy
        is rotating.
      */

      points.rotation.z =
        Math.sin(
          time * 0.025
        ) *
        0.004;

      renderer.render(
        scene,
        camera
      );
    }

    if (!reducedMotion) {
      animate();
    } else {
      renderer.render(
        scene,
        camera
      );
    }

    function resize() {
      const width =
        mount.clientWidth;

      const height =
        mount.clientHeight;

      if (
        width === 0 ||
        height === 0
      ) {
        return;
      }

      camera.aspect =
        width /
        height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height
      );

      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio,
          1.6
        )
      );
    }

    window.addEventListener(
      "resize",
      resize
    );

    return () => {
      cancelAnimationFrame(
        raf
      );

      hero.removeEventListener(
        "pointermove",
        onPointerMove
      );

      hero.removeEventListener(
        "pointerleave",
        onPointerLeave
      );

      window.removeEventListener(
        "resize",
        resize
      );

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (
        renderer.domElement
          .parentNode ===
        mount
      ) {
        mount.removeChild(
          renderer.domElement
        );
      }
    };
    // theme is intentionally excluded: this effect must run once and
    // never recreate the scene. Theme changes are read every frame via
    // themeRef instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: 0,
      }}
    />
  );
}
