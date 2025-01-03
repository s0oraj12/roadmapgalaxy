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
  const [showDetails, setShowDetails] = useState(false);

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.2, 0)
  ]);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
    }

    if (showDetails) {
      if (labelRef.current) {
        labelRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
        labelRef.current.position.y = targetPosition.y + 1.5 + Math.sin(state.clock.elapsedTime) * 0.05;
      }
      if (lineRef.current) {
        lineRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
      }
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
        onAnimationComplete={() => {
          setTimeout(() => setShowDetails(true), 200);
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

      {/* Target Star - Part of initial load */}
      <group position={targetPosition}>
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

        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onTargetClick}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Line and Text - Appear after galaxy loads */}
      {showDetails && (
        <motion.group
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
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

          <group
            ref={labelRef}
            position={[targetPosition.x, targetPosition.y + 1.5, targetPosition.z]}
          >
            <Text
              color="white"
              fontSize={0.2}
              anchorX="center"
              anchorY="middle"
              opacity={0.8}
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
              onClick={onTargetClick}
            >
              Level 1
            </Text>
          </group>
        </motion.group>
      )}
    </group>
  );
};

export default GalaxyParticles;
