import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';
import { createParticleTexture } from './utils/particleTexture';

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
}

const GalaxyParticles = ({ targetPosition, onTargetClick }: Props) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const detailsRef = useRef<THREE.Group>(null);
  const targetRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState(false);
  
  // Generate galaxy geometry with enhanced settings
  const { positions, colors, sizes } = useMemo(() => generateGalaxyGeometry({
    particlesCount: 150000,
    radius: 12,
    branches: 5,
    spin: 1.5,
    randomnessPower: 2.8,
    bulgeSize: 0.3,
    armWidth: 0.4,
    dustLanes: true,
    coreIntensity: 2.5,
    insideColor: '#ffab4d',
    outsideColor: '#3b7bcc',
    dustColor: '#4a2d05'
  }), []);

  // Create optimized particle texture
  const particleTexture = useMemo(() => createParticleTexture(), []);

  // Create instanced particles for better performance
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    return geometry;
  }, [positions, colors, sizes]);

  // Line points for target indicator
  const linePoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.2, 0)
  ], []);

  // Animation and interaction handling
  useFrame((state) => {
    if (galaxyRef.current) {
      // Smooth rotation based on mouse position
      const mouseX = (state.mouse.x * 0.1);
      const mouseY = (state.mouse.y * 0.1);
      
      // Base rotation + mouse interaction
      galaxyRef.current.rotation.y += 0.0002 + mouseX * 0.0001;
      galaxyRef.current.rotation.x = mouseY * 0.2;
      
      // Add slight wobble for more organic movement
      galaxyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
    
    if (detailsRef.current) {
      detailsRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
      const progress = Math.min(1, (state.clock.elapsedTime - 2) * 0.5);
      detailsRef.current.scale.setScalar(progress);
      
      if (progress === 1) {
        // Smooth floating animation
        detailsRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.02;
      }
    }

    // Animate target star
    if (targetRef.current) {
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      targetRef.current.scale.setScalar(pulseScale);
    }
  });

  return (
    <>
      {/* Main Galaxy */}
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
        <primitive object={particles} />
        <pointsMaterial
          size={0.02} // Increased size for better visibility
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors={true}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
          transparent={true}
          alphaMap={particleTexture}
          alphaTest={0.001}
          opacity={1} // Ensure full opacity
        />
      </motion.points>

      {/* Lighting */}
      <ambientLight intensity={0.5} /> {/* Increased ambient light */}
      <pointLight position={[0, 0, 0]} intensity={2} distance={15} decay={2} /> {/* Increased point light */}

      {/* Target Star */}
      <group position={targetPosition}>
        <points ref={targetRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={1}
              array={new Float32Array([0, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            sizeAttenuation={true}
            depthWrite={false}
            color="#ffffff"
            opacity={hovered ? 1.5 : 1.2}
            transparent={true}
            blending={THREE.AdditiveBlending}
            map={particleTexture}
          />
        </points>

        {/* Clickable area */}
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onTargetClick}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Target Details */}
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

      {/* Background particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={new Float32Array(Array.from({ length: 3000 }, () => (Math.random() - 0.5) * 50))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.01}
          sizeAttenuation={true}
          color="#ffffff"
          opacity={0.6}
          transparent={true}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
        />
      </points>

      {/* Add EffectComposer after all objects */}
      <EffectComposer>
        <Bloom
          intensity={0.5} // Reduced intensity
          luminanceThreshold={0} // Lowered threshold to capture more light
          luminanceSmoothing={0.9}
          mipmapBlur={true}
        />
      </EffectComposer>
    </>
  );
};

export default GalaxyParticles;
