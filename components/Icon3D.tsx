"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type IconVariant =
  | "migration"
  | "education"
  | "social"
  | "legal"
  | "docs"
  | "compliance"
  | "support"
  | "contact";

interface Icon3DProps {
  variant: IconVariant;
  primaryColor?: string;
  accentColor?: string;
}

function Glyph({ variant, color }: { variant: IconVariant; color: string }) {
  const matProps = {
    color,
    metalness: 0.5,
    roughness: 0.2,
  };

  switch (variant) {
    case "migration":
      return (
        <group>
          {/* Flecha derecha */}
          <mesh position={[0.15, 0.05, 0]}>
            <boxGeometry args={[0.5, 0.08, 0.08]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[0.43, 0.05, 0]}>
            <coneGeometry args={[0.08, 0.16, 16]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          {/* Flecha izquierda */}
          <mesh position={[-0.15, -0.05, 0]}>
            <boxGeometry args={[0.5, 0.08, 0.08]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[-0.43, -0.05, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.08, 0.16, 16]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );
    case "education":
      return (
        <group>
          {/* Birrete */}
          <mesh position={[0, 0.06, 0]} rotation={[0, 0.4, 0.15]}>
            <boxGeometry args={[0.7, 0.04, 0.7]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[0.05, -0.08, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.2, 20]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );
    case "social":
      return (
        <group>
          {/* Círculo + barra tipo símbolo de apoyo / dinero */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.32, 0.09, 16, 32]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.7, 0.08]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );
    case "legal":
      return (
        <group>
          {/* Barra superior */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.7, 0.08, 0.08]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          {/* Base */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.08]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          {/* Platillos de balanza */}
          <mesh position={[-0.32, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[0.32, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );
    case "docs":
      return (
        <group>
          {/* Hoja + esquina doblada */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.6, 0.8, 0.08]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[0.12, 0.25, 0.02]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.35, 0.25, 0.06]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );
    case "compliance":
      return (
        <group>
          {/* Check dentro de “sello” */}
          <mesh position={[0, 0.05, 0]}>
            <torusGeometry args={[0.35, 0.09, 16, 32]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.16, 0.4, 0.08]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[0.1, -0.25, 0]}>
            <boxGeometry args={[0.24, 0.12, 0.08]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );
    case "support":
      return (
        <group>
          {/* Dos figuras simplificadas una al lado de la otra */}
          <mesh position={[-0.2, 0.1, 0]}>
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[0.2, 0.1, 0]}>
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[0.7, 0.18, 0.08]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );
    case "contact":
    default:
      return (
        <group>
          {/* Sobre de carta */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.7, 0.5, 0.08]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh position={[0, 0.08, 0.02]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.7, 0.1, 0.06]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );
  }
}

function IconGroup({
  variant,
  primaryColor,
  accentColor,
}: {
  variant: IconVariant;
  primaryColor: string;
  accentColor: string;
}) {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.x = Math.sin(t * 0.6) * 0.2;
      group.current.rotation.y = Math.cos(t * 0.4) * 0.25;
    }
  });

  return (
    <group ref={group}>
      {/* Base */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.18, 0.9]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.4}
          roughness={0.25}
        />
      </mesh>

      {/* Placa superior tipo vidrio */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[1.2, 0.2, 0.8]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.1}
          roughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glifo */}
      <group position={[0, 0.05, 0]}>
        <Glyph variant={variant} color="#f9fafb" />
      </group>
    </group>
  );
}

export default function Icon3D({
  variant,
  primaryColor = "#4f46e5",
  accentColor = "#6366f1",
}: Icon3DProps) {
  return (
    <div className="h-10 w-10">
      <Canvas
        camera={{ position: [0, 0.7, 3], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.6} />
        <directionalLight intensity={1} position={[3, 4, 2]} castShadow />
        <IconGroup
          variant={variant}
          primaryColor={primaryColor}
          accentColor={accentColor}
        />
      </Canvas>
    </div>
  );
}
