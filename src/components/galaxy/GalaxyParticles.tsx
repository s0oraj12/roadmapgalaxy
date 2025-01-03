import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
}

const GalaxyParticles = ({ targetPosition, onTargetClick }: Props) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const labelRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Generate galaxy geometry including the target star
  const { positions, colors, targetIndex } = useMemo(() => {
    const geometry = generateGalaxyGeometry();
    const targetIdx = geometry.positions.length;
    
    // Add target star to the geometry
    const newPositions = new Float32Array([...geometry.positions, targetPosition.x, targetPosition.y, targetPosition.z]);
    const newColors = new Float32Array([...geometry.colors, 1, 1, 1]); // White color for target
    
    return {
      positions: newPositions,
      colors: newColors,
      targetIndex: targetIdx / 3
    };
  }, [targetPosition]);

  // Custom shader material for particles
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        targetIndex: { value: targetIndex },
        hovered: { value: 0 },
      },
      vertexShader: `
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
          gl_PointSize = vIsTarget * (hovered * 4.0 + 2.0) + (1.0 - vIsTarget) * 2.0;
        }
      `,
      fragmentShader: `
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
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [targetIndex]);

  // Animation and interaction
  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
      shaderMaterial.uniforms.time.value = state.clock.getElapsedTime();
      shaderMaterial.uniforms.hovered.value = hovered ? 1.0 : 0.0;
    }

    // Update label position to face camera
    if (labelRef.current) {
      labelRef.current.quaternion.copy(camera.quaternion);
    }
  });

  // Raycaster for target star interaction
  const handlePointerMove = (event: THREE.Event) => {
    const pointIndex = (event as any).index;
    setHovered(pointIndex === targetIndex);
  };

  return (
    <group>
      <motion.points
        ref={galaxyRef}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        onPointerMove={handlePointerMove}
        onPointerOut={() => setHovered(false)}
        onClick={(event) => {
          const pointIndex = (event as any).index;
          if (pointIndex === targetIndex) {
            onTargetClick();
          }
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
        {shaderMaterial}
      </motion.points>

      {/* Label for target star */}
      {hovered && (
        <group 
          ref={labelRef}
          position={[targetPosition.x + 0.5, targetPosition.y + 0.3, targetPosition.z]}
        >
          <Line
            points={[[0, 0, 0], [-0.5, -0.3, 0]]}
            color="white"
            lineWidth={1}
            dashed={false}
          />
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="white"
            anchorX="left"
            anchorY="middle"
          >
            Roadmap
          </Text>
        </group>
      )}
    </group>
  );
};

export default GalaxyParticles;
