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
  const [isVisible, setIsVisible] = useState(false);

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.5, 0)  // Made line a bit longer for better visibility
  ]);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
    }
    
    if (labelRef.current && lineRef.current) {
      labelRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
      lineRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
    }

    if (labelRef.current && isVisible) {
      labelRef.current.position.y = targetPosition.y + 1.2 + Math.sin(state.clock.elapsedTime) * 0.05;
    }
    if (lineRef.current && isVisible) {
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
        onAnimationStart={() => setIsVisible(false)}
        onAnimationComplete={() => setIsVisible(true)}
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

      {isVisible && (
        <>
          {/* Target Star */}
          <group 
            position={targetPosition}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={onTargetClick}
          >
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

            {/* Invisible clickable mesh */}
            <mesh>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>

          {/* Vertical line */}
          <line
            ref={lineRef}
            position={targetPosition}
            geometry={lineGeometry}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={onTargetClick}
          >
            <lineBasicMaterial
              color="#ffffff"
              transparent
              opacity={hovered ? 0.8 : 0.6}
              blending={THREE.AdditiveBlending}
              linewidth={2}
            />
          </line>

          {/* Level text */}
          <group
            ref={labelRef}
            position={[targetPosition.x, targetPosition.y + 1.2, targetPosition.z]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={onTargetClick}
          >
            <Text
              color="white"
              fontSize={0.2}
              anchorX="center"
              anchorY="middle"
              opacity={hovered ? 1 : 0.8}
            >
              Level 1
            </Text>
          </group>
        </>
      )}
    </group>
  );
};

export default GalaxyParticles;
