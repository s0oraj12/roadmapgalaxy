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
  const detailsRef = useRef<THREE.Group>(null);
  const { positions, colors } = generateGalaxyGeometry();
  const [hovered, setHovered] = useState(false);
  
  // Create circular texture for particles
  const particleTexture = new THREE.TextureLoader().load('/circle.svg');
  
  const linePoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.2, 0)
  ];

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
    }
    
    if (detailsRef.current) {
      detailsRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
      const progress = Math.min(1, (state.clock.elapsedTime - 2) * 0.5);
      detailsRef.current.scale.setScalar(progress);
      
      if (progress === 1) {
        detailsRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.02;
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
          map={particleTexture}
          transparent={true}
          alphaTest={0.001}
        />
      </motion.points>

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
            transparent={true}
            blending={THREE.AdditiveBlending}
            map={particleTexture}
            alphaTest={0.001}
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

      <group ref={detailsRef} position={targetPosition} scale={0}>
        <line geometry={new THREE.BufferGeometry().setFromPoints(linePoints)}>
          <lineBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </line>

        <Text
          position={[0, 1.5, 0]}
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
    </group>
  );
};

export default GalaxyParticles;
