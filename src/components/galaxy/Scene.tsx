// src/components/galaxy/Scene.tsx
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../../store/navigationStore';
import GalaxyParticles from './GalaxyParticles';
import Background from './Background';
import CameraController from './CameraController';

interface Props {
  targetPosition?: THREE.Vector3;
}

const Scene = ({ targetPosition = new THREE.Vector3(5, 0.2, 3) }: Props) => {
  const navigate = useNavigate();
  const { 
    isTransitioning, 
    setIsTransitioning, 
    setCursorStyle,
    setCurrentScene 
  } = useNavigationStore();

  useEffect(() => {
    // Set initial state
    setCurrentScene('galaxy');
    setCursorStyle('default');

    // Cleanup on unmount
    return () => {
      setIsTransitioning(false);
      setCursorStyle('default');
    };
  }, [setCurrentScene, setCursorStyle, setIsTransitioning]);

  const handleStarClick = () => {
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setCurrentScene('roadmap');
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
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0
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
          minPolarAngle={Math.PI * 0.25}
          maxPolarAngle={Math.PI * 0.75}
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
