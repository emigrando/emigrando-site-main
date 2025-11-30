"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function WavyBlob() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.25;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <icosahedronGeometry args={[1.4, 4]} />
      <meshStandardMaterial
        metalness={0.5}
        roughness={0.2}
        color={"#6366f1"}
        emissive={"#4f46e5"}
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

function BackgroundGlow() {
  return (
    <mesh receiveShadow position={[0, -2, 0]}>
      <cylinderGeometry args={[5, 5, 0.1, 64]} />
      <meshStandardMaterial
        color={"#0f172a"}
        metalness={0.3}
        roughness={0.9}
      />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} shadows>
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.5} />
        <directionalLight intensity={1.2} position={[4, 6, 3]} castShadow />

        <WavyBlob />
        <BackgroundGlow />
      </Canvas>
    </div>
  );
}
