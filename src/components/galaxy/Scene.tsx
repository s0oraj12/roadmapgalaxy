import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import GalaxyParticles from './GalaxyParticles';
import Background from './Background';
import CameraController from './CameraController';

const Scene = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const targetPosition = new THREE.Vector3(5, 0.2, 3);

  const handleStarClick = () => {
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    navigate('/roadmap');
  };

  return (
    <div className="h-screen w-full bg-black">
      <Canvas
        camera={{
          position: [0, 3, 10],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
      >
        <CameraController
          targetPosition={targetPosition}
          isTransitioning={isTransitioning}
          onTransitionComplete={handleTransitionComplete}
        />

        <OrbitControls
          enabled={!isTransitioning}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.5}
          panSpeed={0.5}
          rotateSpeed={0.5}
        />
        
        <Background />

        <GalaxyParticles
          targetPosition={targetPosition}
          onTargetClick={handleStarClick}
        />
      </Canvas>
    </div>
  );
};

export default Scene;

