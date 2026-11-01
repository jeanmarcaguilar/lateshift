"use client";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useRef, type MutableRefObject } from "react";

// Shared geometries + materials, created once at module scope (never in a loop or .map()).
const std = (color: string, roughness: number) => new THREE.MeshStandardMaterial({ color, roughness });
const mat = { bun: std("#C98A3B", 0.6), patty: std("#3B2318", 0.9), cheese: std("#F5C542", 0.4), lettuce: std("#5E9B3A", 0.7), pickle: std("#6B8E23", 0.5), base: std("#151516", 0.8) };
const geo = {
  topBun: new THREE.SphereGeometry(1.05, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
  bottomBun: new THREE.CylinderGeometry(1, 0.95, 0.24, 40),
  patty: new THREE.CylinderGeometry(1.05, 1.05, 0.22, 40),
  cheese: new THREE.BoxGeometry(2.2, 0.04, 2.2),
  lettuce: new THREE.CylinderGeometry(1.2, 1.15, 0.06, 28),
  pickle: new THREE.CylinderGeometry(0.32, 0.32, 0.05, 20),
  base: new THREE.CylinderGeometry(1.7, 1.8, 0.3, 48),
};
const BASE_Y = [0, 0.24, 0.42, 0.5, 0.6, 0.78]; // bottom bun, patty, pickles, cheese, lettuce, top bun
const smooth = (a: number, b: number, x: number) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

function Burger({ progress }: { progress: MutableRefObject<number> }) {
  const spin = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Group | null)[]>([]);
  const sep = useRef(0);
  useFrame((state, delta) => {
    // Scroll-linked and damped with delta time, so it is refresh-rate independent.
    const p = progress.current;
    const target = smooth(0.08, 0.5, p) * (1 - smooth(0.82, 0.96, p));
    sep.current = THREE.MathUtils.damp(sep.current, target, 4, delta);
    layers.current.forEach((g, i) => {
      if (!g) return;
      g.position.y = BASE_Y[i] + (i - 2.5) * 0.6 * sep.current;
      g.position.z = (i - 2.5) * 0.4 * sep.current;
    });
    if (spin.current) spin.current.rotation.y += delta * 0.25;
    const range = Math.sin(THREE.MathUtils.degToRad(4)) * 6; // about 4 degrees of camera parallax
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * range, 3, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 1.6 + state.pointer.y * range, 3, delta);
    cam.lookAt(0, 0.6, 0);
  });
  const ref = (i: number) => (el: THREE.Group | null) => { layers.current[i] = el; };
  return (
    <group ref={spin}>
      <mesh geometry={geo.base} material={mat.base} position={[0, -0.4, 0]} />
      <group ref={ref(0)}><mesh geometry={geo.bottomBun} material={mat.bun} /></group>
      <group ref={ref(1)}><mesh geometry={geo.patty} material={mat.patty} /></group>
      <group ref={ref(2)}>
        <mesh geometry={geo.pickle} material={mat.pickle} position={[0.5, 0, 0.2]} />
        <mesh geometry={geo.pickle} material={mat.pickle} position={[-0.45, 0, 0.35]} />
        <mesh geometry={geo.pickle} material={mat.pickle} position={[0, 0, -0.55]} />
      </group>
      <group ref={ref(3)}><mesh geometry={geo.cheese} material={mat.cheese} rotation={[0, Math.PI / 4, 0]} /></group>
      <group ref={ref(4)}><mesh geometry={geo.lettuce} material={mat.lettuce} /></group>
      <group ref={ref(5)}><mesh geometry={geo.topBun} material={mat.bun} scale={[1, 0.75, 1]} /></group>
    </group>
  );
}

export default function Scene({ progress, active }: { progress: MutableRefObject<number>; active: boolean }) {
  const fine = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: fine }} camera={{ position: [0, 1.6, 6], fov: 35 }} frameloop={active ? "always" : "never"}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[-4, 5, 3]} intensity={2.4} color="#FFB36B" />{/* warm key, upper left */}
      <directionalLight position={[4, -2, 3]} intensity={0.7} color="#6FA8FF" />{/* cool fill, lower right */}
      <pointLight position={[0, 2, -3]} intensity={6} color="#FF5A1F" />{/* amber rim */}
      <Burger progress={progress} />
      <ContactShadows position={[0, -0.55, 0]} opacity={0.6} scale={8} blur={2.5} frames={1} />{/* baked once */}
    </Canvas>
  );
}
