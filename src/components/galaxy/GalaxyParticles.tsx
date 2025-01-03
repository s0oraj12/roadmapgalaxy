// components/galaxy/GalaxyParticles.tsx
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
}

const GalaxyParticles = ({ targetPosition, onTargetClick }: Props) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const { positions, colors } = generateGalaxyGeometry();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group>
      <motion.points
        ref={galaxyRef}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors={true}
          blending={THREE.AdditiveBlending}
        />
      </motion.points>

      {/* Target Star */}
      <group position={targetPosition}>
        {/* Glow effect */}
        <sprite
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0, 0]}
        >
          <spriteMaterial
            attach="material"
            map={new THREE.TextureLoader().load('/glow.png')}
            transparent={true}
            blending={THREE.AdditiveBlending}
            color={hovered ? "#ffffff" : "#ffaa00"}
          />
        </sprite>

        {/* Clickable star */}
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onTargetClick}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial
            color={hovered ? "#ffffff" : "#ffaa00"}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
    </group>
  );
};

export default GalaxyParticles;
