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
  
  // Create a circle texture for round particles
  const circleTexture = new THREE.TextureLoader().load(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGASURBVFiF7ZexSgNBEIa/EwsLsRMrwUZsYim+gh5YiG+gpZ2NvoK+go2lrZ2NjaCdEBAEwU4QRFGj+FvsHizL7mVvL3cgDgzc3s7O/zO7M7sn9X0fgBXgDvgEFDwL4BY4BKa9N+9/ZAfkwE5m8T/AAZC1Bd+MMHl+t1ANzAFPwHgTwAPgDRiKqL8G7KsFxoDnsPKs4dBrYCIB/Lf2jQZwAeyl2Yy8DQEuXeCy/ZoA7/0HB8N6B84T4M/Ar40gk/QhabvG/lrSraS8EPMq6UTSbaH9SNKBpMeK/imwZ2Y/LvBCS3YF8JoAnwP9NvAW+EGwPC6BvYTjOBPBswD/DCyngK8Bz8FFUQmcAYsJ4MvARbHtFjgGhhPAh4ATYLsO/tnMvrTsXM+AqibknQP+kSSZ2bekm4ruc0nXks4lzUual7RR0f9iZg/dtlwzswdJ9xX2J0kzks7M7C0ZvNiBZUnrCfBRM/tu06HQgf/8Ia2KK+AFWM0M3/odaB3/AGXzvzsxl6xqAAAAAElFTkSuQmCC"
  );

  const linePoints = [
    targetPosition,
    targetPosition.clone().add(new THREE.Vector3(0, 1.2, 0))
  ];

  useFrame((state) => {
    if (galaxyRef.current) {
      const rotation = state.clock.elapsedTime * 0.0005;
      galaxyRef.current.rotation.y = rotation;
      
      // Apply gentle wave motion to particles
      const positions = galaxyRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const y = positions[i + 1];
        positions[i + 1] = y + Math.sin(state.clock.elapsedTime * 0.5 + positions[i] * 0.5) * 0.001;
      }
      galaxyRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    if (detailsRef.current) {
      detailsRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
      const progress = Math.min(1, (state.clock.elapsedTime - 2) * 0.5);
      detailsRef.current.scale.setScalar(progress);
      
      if (progress === 1) {
        const wave = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
        detailsRef.current.position.y = targetPosition.y + wave;
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
          size={0.015}  // Made particles smaller
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors={true}
          blending={THREE.AdditiveBlending}
          map={circleTexture}  // Apply round texture
          transparent={true}
          alphaTest={0.1}
        />
      </motion.points>

      {/* Target Star */}
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
            size={0.015}  // Match galaxy particle size
            sizeAttenuation={true}
            depthWrite={false}
            color="#ffffff"
            opacity={hovered ? 1 : 0.8}
            transparent
            blending={THREE.AdditiveBlending}
            map={circleTexture}  // Apply same round texture
            alphaTest={0.1}
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

      {/* Line and Text */}
      <group ref={detailsRef} scale={0}>
        <line geometry={new THREE.BufferGeometry().setFromPoints(linePoints)}>
          <lineBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </line>

        <Text
          position={[targetPosition.x, targetPosition.y + 1.5, targetPosition.z]}
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
