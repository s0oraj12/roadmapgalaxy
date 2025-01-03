import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Line, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
}

const GalaxyParticles: React.FC<Props> = ({ targetPosition, onTargetClick }) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Generate galaxy geometry including the target star
  const { positions, colors, targetIndex } = useMemo(() => {
    const geometry = generateGalaxyGeometry();
    const targetIdx = geometry.positions.length;
    
    // Add target star at a specific position (similar to sun in milky way)
    const targetPos = new THREE.Vector3(2, 0, 2); // Adjust these values to position the star
    const newPositions = new Float32Array([...geometry.positions, targetPos.x, targetPos.y, targetPos.z]);
    const newColors = new Float32Array([...geometry.colors, 1, 1, 1]); // White color for target
    
    return {
      positions: newPositions,
      colors: newColors,
      targetIndex: targetIdx / 3
    };
  }, []);

  // Shader uniforms
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    targetIndex: { value: targetIndex },
    hovered: { value: 0 },
  }), [targetIndex]);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
      uniforms.time.value = state.clock.getElapsedTime();
      uniforms.hovered.value = hovered ? 1.0 : 0.0;
    }
  });

  const handlePointerMove = useCallback((event: THREE.Intersection) => {
    const pointIndex = event.index;
    setHovered(pointIndex === targetIndex);
  }, [targetIndex]);

  const handleClick = useCallback((event: THREE.Intersection) => {
    const pointIndex = event.index;
    if (pointIndex === targetIndex) {
      onTargetClick();
    }
  }, [targetIndex, onTargetClick]);

  // Calculate label position relative to the target star
  const getLabelPosition = () => {
    if (!galaxyRef.current) return new THREE.Vector3(2, -0.5, 2);
    
    const targetPos = new THREE.Vector3(2, 0, 2);
    targetPos.applyMatrix4(galaxyRef.current.matrixWorld);
    return new THREE.Vector3(targetPos.x, targetPos.y - 0.5, targetPos.z);
  };

  return (
    <group>
      <points
        ref={galaxyRef}
        onPointerMove={handlePointerMove}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
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
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={`
            uniform float time;
            uniform int targetIndex;
            uniform float hovered;
            attribute vec3 color;
            varying vec3 vColor;
            varying float vIsTarget;
            
            void main() {
              vColor = color;
              vIsTarget = float(gl_VertexID == targetIndex);
              
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              
              // Make target star pulse when hovered
              if (gl_VertexID == targetIndex) {
                float scale = 1.0 + sin(time * 5.0) * 0.2 * hovered;
                mvPosition.xyz *= scale;
              }
              
              gl_Position = projectionMatrix * mvPosition;
              gl_PointSize = vIsTarget * (hovered * 4.0 + 3.0) + (1.0 - vIsTarget) * 2.0;
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
                finalColor = mix(vec3(1.0), vec3(0.9, 0.95, 1.0), dist * 2.0);
              }
              
              gl_FragColor = vec4(finalColor, 1.0 - dist * 2.0);
            }
          `}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Label with line for target star */}
      {hovered && (
        <Billboard
          follow={true}
          position={getLabelPosition()}
        >
          <Line
            points={[
              [0, 0.5, 0], // Start from above the label
              [0, 0, 0]    // End at label position
            ]}
            color="white"
            lineWidth={2}
            transparent
            opacity={0.8}
          />
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="bottom"
            renderOrder={1}
            depthTest={false}
          >
            Level1
          </Text>
        </Billboard>
      )}
    </group>
  );
};

export default GalaxyParticles;

