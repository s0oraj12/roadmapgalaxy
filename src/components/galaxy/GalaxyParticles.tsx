import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
}

const GalaxyParticles: React.FC<Props> = ({ targetPosition, onTargetClick }) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.Line>(null);

  // Generate galaxy geometry including the target star
  const { positions, colors, targetIndex } = useMemo(() => {
    const geometry = generateGalaxyGeometry();
    const targetIdx = geometry.positions.length;
    
    // Position the target star between center and edge (like Sun in Milky Way)
    const targetPos = new THREE.Vector3(4, 0, 4); // Adjust these values to position the star
    const newPositions = new Float32Array([...geometry.positions, targetPos.x, targetPos.y, targetPos.z]);
    const newColors = new Float32Array([...geometry.colors, 1, 1, 1]); // White color for target
    
    return {
      positions: newPositions,
      colors: newColors,
      targetIndex: targetIdx / 3
    };
  }, []);

  // Create line geometry for the connecting line (pointing upward)
  const lineGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(4, 0, 4),    // Start at target star
      new THREE.Vector3(4, 2, 4)     // End above the star
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
    }
    if (lineRef.current) {
      lineRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
    }
  });

  const handleClick = (event: THREE.Event) => {
    event.stopPropagation();
    onTargetClick();
  };

  return (
    <group>
      <points ref={galaxyRef}>
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
        <shaderMaterial
          uniforms={{
            time: { value: 0 },
            targetIndex: { value: targetIndex }
          }}
          vertexShader={`
            uniform float time;
            uniform int targetIndex;
            attribute vec3 color;
            varying vec3 vColor;
            varying float vIsTarget;
            
            void main() {
              vColor = color;
              vIsTarget = float(gl_VertexID == targetIndex);
              
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              
              // Make target star larger
              if (gl_VertexID == targetIndex) {
                mvPosition.xyz *= 1.5;
              }
              
              gl_Position = projectionMatrix * mvPosition;
              gl_PointSize = vIsTarget * 5.0 + (1.0 - vIsTarget) * 2.0;
            }
          `}
          fragmentShader={`
            varying vec3 vColor;
            varying float vIsTarget;
            
            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;
              
              vec3 finalColor = vColor;
              if (vIsTarget > 0.5) {
                finalColor = vec3(1.0); // Pure white for target
              }
              
              gl_FragColor = vec4(finalColor, 1.0 - dist * 2.0);
            }
          `}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Clickable line */}
      <line ref={lineRef} onClick={handleClick}>
        <bufferGeometry attach="geometry" {...lineGeometry} />
        <lineBasicMaterial 
          attach="material" 
          color="white" 
          linewidth={2}
          transparent
          opacity={0.8}
        />
      </line>

      {/* Clickable text */}
      <Text
        position={[4, 2.2, 4]} 
        fontSize={0.5}
        color="white"
        anchorX="center" 
        anchorY="bottom"
        renderOrder={1}
        depthTest={false}
        onClick={handleClick}
      >
        Level1
      </Text>
    </group>
  );
};

export default GalaxyParticles;

