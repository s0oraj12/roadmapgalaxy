import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';
import { createParticleTexture } from './utils/particleTexture';

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
}

const GalaxyParticles = ({ targetPosition, onTargetClick }: Props) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const detailsRef = useRef<THREE.Group>(null);
  
  // Use useMemo to prevent regeneration on every render
  const galaxyData = useMemo(() => generateGalaxyGeometry(), []);
  const [hovered, setHovered] = useState(false);
  
  // Optimize particle texture
  const particleTexture = useMemo(() => {
    const texture = createParticleTexture();
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);
  
  const linePoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.2, 0)
  ], []);

  useFrame((state) => {
    if (galaxyRef.current) {
      // Reduced rotation speed for smoother performance
      galaxyRef.current.rotation.y += 0.0003;
    }
    
    if (detailsRef.current) {
      detailsRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
      const progress = Math.min(1, (state.clock.elapsedTime - 2) * 0.5);
      detailsRef.current.scale.setScalar(progress);
      
      if (progress === 1) {
        detailsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
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
            count={galaxyData.positions.length / 3}
            array={galaxyData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={galaxyData.colors.length / 3}
            array={galaxyData.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.004} // Reduced size for 1M particles
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors={true}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
          opacity={0.8} // Reduced opacity for better performance
          transparent={true}
          alphaTest={0.01} // Added for better performance
          fog={false} // Disabled fog for performance
        />
      </motion.points>

      {/* Target Star - optimized for performance */}
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
            size={0.015}
            sizeAttenuation={true}
            depthWrite={false}
            color="#ffffff"
            opacity={hovered ? 1.2 : 1}
            transparent={true}
            blending={THREE.AdditiveBlending}
            map={particleTexture}
          />
        </points>

        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onTargetClick}
        >
          <sphereGeometry args={[0.05, 6, 6]} /> {/* Reduced segments */}
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Optimized details group */}
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
