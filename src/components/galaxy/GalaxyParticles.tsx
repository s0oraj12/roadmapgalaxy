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
  const targetGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [galaxyScale, setGalaxyScale] = useState(0);
  const { positions, colors } = generateGalaxyGeometry();

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 0)
  ]);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
    }
    
    if (targetGroupRef.current) {
      targetGroupRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
      targetGroupRef.current.position.y = targetPosition.y + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      targetGroupRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime) * 0.05;
    }

    // Smooth galaxy scale animation
    setGalaxyScale(prev => {
      const target = 1;
      return THREE.MathUtils.lerp(prev, target, 0.02);
    });
  });

  return (
    <group>
      <points ref={galaxyRef} scale={galaxyScale}>
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
      </points>

      {/* Target Group */}
      <group 
        ref={targetGroupRef}
        position={targetPosition}
        scale={galaxyScale}
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

        {/* Vertical line */}
        <line
          geometry={lineGeometry}
        >
          <lineBasicMaterial
            color="#ffffff"
            transparent
            opacity={hovered ? 0.6 : 0.4}
            blending={THREE.AdditiveBlending}
          />
        </line>

        {/* Level text */}
        <group position={[0, 1.2, 0]}>
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

        {/* Optimized click detection area */}
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onTargetClick}
        >
          <boxGeometry args={[0.2, 2, 0.2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </group>
  );
};

export default GalaxyParticles;
