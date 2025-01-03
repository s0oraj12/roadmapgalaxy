// components/galaxy/SolarSystem.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

const SolarSystem = () => {
  const systemRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (systemRef.current) {
      systemRef.current.children.forEach((planet, i) => {
        const speed = 0.001 * (i + 1);
        const radius = 2 * (i + 1);
        const time = state.clock.getElapsedTime();
        
        planet.position.x = Math.cos(time * speed) * radius;
        planet.position.z = Math.sin(time * speed) * radius;
      });
    }
  });

  return (
    <motion.group
      ref={systemRef}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Sun */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>

      {/* Planets */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[2 * (i + 1), 0, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial color={`hsl(${i * 50}, 70%, 50%)`} />
        </mesh>
      ))}
    </motion.group>
  );
};

export default SolarSystem;
