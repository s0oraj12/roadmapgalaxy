import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
}

const GalaxyParticles: React.FC<Props> = ({ targetPosition, onTargetClick }) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Generate galaxy geometry including the target star
  const { positions, colors } = useMemo(() => {
    const geometry = generateGalaxyGeometry();
    return {
      positions: geometry.positions,
      colors: geometry.colors
    };
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
    }
  });

  const handleClick = (event: THREE.Event) => {
    event.stopPropagation();
    onTargetClick();
  };

  // Target star position (between center and edge)
  const starPosition = new THREE.Vector3(4, 0, 4);

  return (
    <group ref={groupRef}>
      {/* Galaxy particles */}
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
      <group position={starPosition}>
        {/* Glow effect */}
        <sprite scale={[0.5, 0.5, 0.5]}>
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
          onClick={handleClick}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial
            color={hovered ? "#ffffff" : "#ffaa00"}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Line pointing upward */}
        <line onClick={handleClick}>
          <bufferGeometry
            attach="geometry"
            {...new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0, 2, 0)
            ])}
          />
          <lineBasicMaterial
            attach="material"
            color="white"
            linewidth={2}
            transparent
            opacity={0.8}
          />
        </line>

        {/* Text label */}
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="bottom"
          renderOrder={1}
          depthTest={false}
          onClick={handleClick}
        >
          Level1
        </Text>
      </group>
    </group>
  );
};

export default GalaxyParticles;

