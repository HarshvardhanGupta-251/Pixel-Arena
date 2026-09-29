import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type DottedSurfaceProps = Omit<React.ComponentProps<"div">, "ref"> & {
  size?: number;
  opacity?: number;
  sizeAttenuation?: boolean;
  vertexColors?: boolean;
};

export function DottedSurface({
  className,
  size = 8,
  opacity = 0.8,
  sizeAttenuation = true,
  vertexColors = true,
  ...props
}: DottedSurfaceProps) {
  let theme = "dark";
  try {
    const themeContext = useTheme();
    theme = themeContext.theme || "dark";
  } catch {
    theme = "dark";
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points[];
    animationId: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const SEPARATION = 150;
    const AMOUNTX = 40;
    const AMOUNTY = 60;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 0);

    containerRef.current.appendChild(renderer.domElement);

    // Create particles
    const particles: THREE.Points[] = [];
    const positions: number[] = [];
    const colors: number[] = [];

    // Create geometry for all particles
    const geometry = new THREE.BufferGeometry();

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const y = 0; // Will be animated
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

        positions.push(x, y, z);
        if (theme === "dark") {
          // Subtle digital green tint mixed with dark tech grey
          if (ix % 7 === 0 && iy % 7 === 0) {
            colors.push(0, 0.9, 0.46); // neon green accent dot
          } else {
            colors.push(0.6, 0.6, 0.6);
          }
        } else {
          colors.push(0, 0, 0);
        }
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // Create material
    const material = new THREE.PointsMaterial({
      size,
      vertexColors,
      color: vertexColors ? undefined : theme === "dark" ? 0xc8c8c8 : 0x000000,
      transparent: true,
      opacity,
      sizeAttenuation,
    });

    // Create points object
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId = 0;

    // Animation function
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (sceneRef.current) sceneRef.current.animationId = animationId;

      const positionAttribute = geometry.attributes.position;
      const posArray = positionAttribute.array as Float32Array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3;

          // Animate Y position with sine waves
          posArray[index + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50;

          i++;
        }
      }

      positionAttribute.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.08;
    };

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles: [points],
      animationId,
      count,
    };

    // Start animation
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);

        // Clean up Three.js objects
        sceneRef.current.scene.traverse((object) => {
          if (object instanceof THREE.Points) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });

        sceneRef.current.renderer.dispose();

        if (containerRef.current && sceneRef.current.renderer.domElement) {
          try {
            containerRef.current.removeChild(
              sceneRef.current.renderer.domElement,
            );
          } catch {
            // ignore if already removed
          }
        }
      }
    };
  }, [theme, size, opacity, sizeAttenuation, vertexColors]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none fixed inset-0 -z-10", className)}
      {...props}
    />
  );
}

export default DottedSurface;
