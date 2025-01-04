// src/components/galaxy/GalaxyControls.tsx
import React from 'react';
import { useControls } from 'leva';
import { GalaxyConfig } from './types';

interface GalaxyControlsProps {
  onChange: (config: Partial<GalaxyConfig>) => void;
  onAutoRotateToggle?: () => void;
}

export const GalaxyControls: React.FC<GalaxyControlsProps> = ({ 
  onChange,
  onAutoRotateToggle 
}) => {
  const controls = useControls({
    galaxyType: {
      value: 'spiral',
      options: ['spiral', 'barred', 'irregular'],
      label: 'Galaxy Type'
    },
    branches: { value: 5, min: 2, max: 8, step: 1 },
    radius: { value: 12, min: 5, max: 20, step: 0.5 },
    dustLanes: true,
    hasActiveNucleus: false,
    starFormationRate: { value: 1, min: 0.1, max: 2, step: 0.1 },
    diskHeight: { value: 0.8, min: 0.1, max: 2, step: 0.1 },
    spiralPitch: { value: 0.2, min: 0.1, max: 0.5, step: 0.05 },
    coreIntensity: { value: 2.5, min: 1, max: 5, step: 0.1 },
    autoRotate: true
  });

  React.useEffect(() => {
    onChange(controls);
  }, [controls, onChange]);

  React.useEffect(() => {
    if (onAutoRotateToggle && controls.autoRotate !== undefined) {
      onAutoRotateToggle();
    }
  }, [controls.autoRotate, onAutoRotateToggle]);

  return null;
};
