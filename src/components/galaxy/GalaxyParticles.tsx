import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
}

const GalaxyParticles = ({ targetPosition, onTargetClick }: Props) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Generate galaxy geometry with target star included
  const { positions, colors } = useMemo(() => {
    const geometry = generateGalaxyGeometry();
    const targetPos = new THREE.Vector3(3, 0, 2); // Position between center and edge

    // Add target star to the galaxy geometry
    const newPositions = new Float32Array([...geometry.positions, targetPos.x, targetPos.y, targetPos.z]);
    const newColors = new Float32Array([...geometry.colors, 1, 0.9, 0.6]); // Warm white color

    return { positions: newPositions, colors: newColors };
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group ref={groupRef}>
      <motion.points
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        onPointerMove={(e) => {
          const index = (e as any).index;
          setHovered(index === positions.length / 3 - 1);
        }}
        onClick={(e) => {
          const index = (e as any).index;
          if (index === positions.length / 3 - 1) onTargetClick();
        }}
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
          size={0.025}
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors={true}
          blending={THREE.AdditiveBlending}
        />
      </motion.points>

      {hovered && (
        <group position={[3, 0, 2]}>
          <line>
            <bufferGeometry
              attach="geometry"
              {...new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 1.5, 0)
              ])}
            />
            <lineBasicMaterial
              color="#8892b0"
              transparent
              opacity={0.6}
              linewidth={1}
            />
          </line>
          <Text
            position={[0, 1.7, 0]}
            fontSize={0.2}
            color="#8892b0"
            anchorX="center"
            anchorY="bottom"
            renderOrder={1}
            depthTest={false}
            font="/fonts/Geist-Regular.ttf"
            characters="LEVEL1"
          >
            LEVEL1
          </Text>
        </group>
      )}
    </group>
  );
};

export default GalaxyParticles;

