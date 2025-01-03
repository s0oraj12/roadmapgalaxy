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
  const targetRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState(false);
  
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

  const particleTexture = useMemo(() => createParticleTexture(), []);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    return geom;
  }, [positions, colors, sizes]);

  const linePoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.2, 0)
  ], []);

  useFrame((state) => {
    if (galaxyRef.current) {
      const mouseX = (state.mouse.x * 0.1);
      const mouseY = (state.mouse.y * 0.1);
      galaxyRef.current.rotation.y += 0.0002 + mouseX * 0.0001;
      galaxyRef.current.rotation.x = mouseY * 0.2;
      galaxyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
    
    if (detailsRef.current) {
      detailsRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
      const progress = Math.min(1, (state.clock.elapsedTime - 2) * 0.5);
      detailsRef.current.scale.setScalar(progress);
      
      if (progress === 1) {
        detailsRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.02;
      }
    }

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
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={new Float32Array(positions)}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={new Float32Array(colors)}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={sizes.length}
            array={new Float32Array(sizes)}
            itemSize={1}
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
          alphaMap={particleTexture}
          alphaTest={0.001}
        />
      </motion.points>

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

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={2} distance={15} decay={2} />
    </>
  );
};

export default GalaxyParticles;
