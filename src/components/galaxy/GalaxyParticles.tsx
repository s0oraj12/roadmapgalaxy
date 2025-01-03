import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
}

const GalaxyParticles = ({ targetPosition, onTargetClick }: Props) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const labelRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.Line>(null);
  const { positions, colors } = generateGalaxyGeometry();
  const [hovered, setHovered] = useState(false);

  // Create line geometry
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 0)
  ]);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
    }
    
    // Rotate label and line with galaxy
    if (labelRef.current && lineRef.current) {
      labelRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
      lineRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
    }

    // Add slight floating animation to the line and label
    if (labelRef.current) {
      labelRef.current.position.y = targetPosition.y + 1.2 + Math.sin(state.clock.elapsedTime) * 0.05;
    }
    if (lineRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.05;
      lineRef.current.scale.y = scale;
    }
  });

  return (
    <group>
      <motion.points
        ref={galaxyRef}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 2, 
          ease: "easeOut",
          type: "spring",
          damping: 20 
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
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors={true}
          blending={THREE.AdditiveBlending}
        />
      </motion.points>

      {/* Target Star */}
      <group position={targetPosition}>
        {/* Bright star point */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={1}
              array={new Float32Array([0, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.02}
            sizeAttenuation={true}
            depthWrite={false}
            color="#ffffff"
            opacity={hovered ? 1 : 0.8}
            transparent
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Clickable area */}
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onTargetClick}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            transparent
            opacity={0}
          />
        </mesh>
      </group>

      {/* Vertical line */}
      <line
        ref={lineRef}
        position={targetPosition}
        geometry={lineGeometry}
      >
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </line>

      {/* Level text */}
      <group
        ref={labelRef}
        position={[targetPosition.x, targetPosition.y + 1.2, targetPosition.z]}
      >
        <Text
          color="white"
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
          opacity={0.8}
        >
          Level 1
        </Text>
      </group>
    </group>
  );
};

export default GalaxyParticles;
