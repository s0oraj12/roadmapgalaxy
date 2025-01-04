import * as THREE from 'three';
import { GalaxyConfig } from '../types/galaxyTypes';
import { GALAXY_PRESETS } from './galaxyPresets';

export const generateGalaxyGeometry = (config: Partial<GalaxyConfig> = {}) => {
  const baseConfig = GALAXY_PRESETS[config.galaxyType || 'spiral'];
  const finalConfig = { ...baseConfig, ...config };

  const {
    particlesCount,
    radius,
    branches,
    spin,
    randomnessPower,
    bulgeSize,
    armWidth,
    dustLanes,
    coreIntensity,
    insideColor,
    outsideColor,
    dustColor,
    hasActiveNucleus,
    starFormationRate,
    diskHeight,
    bulgeHeight,
    spiralPitch,
    barLength
  } = finalConfig;

  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  const sizes = new Float32Array(particlesCount);
  
  const centerColor = new THREE.Color(insideColor);
  const outerColor = new THREE.Color(outsideColor);
  const dustLaneColor = new THREE.Color(dustColor);

  // Bulge generation with Sérsic profile
  const bulgeCount = Math.floor(particlesCount * 0.3);
  let currentIndex = 0;

  for (let i = 0; i < bulgeCount; i++) {
    const i3 = currentIndex * 3;
    
    // Sérsic profile implementation
    const n = 4; // Sérsic index
    const r = Math.pow(Math.random(), 1/n) * radius * bulgeSize;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * bulgeHeight;
    positions[i3 + 2] = r * Math.cos(phi);

    // Enhanced core brightness for active nucleus
    const intensity = hasActiveNucleus 
      ? (1 - r/(radius * bulgeSize)) * coreIntensity * 2
      : (1 - r/(radius * bulgeSize)) * coreIntensity;

    const mixedColor = new THREE.Color(insideColor);
    mixedColor.multiplyScalar(intensity);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    sizes[currentIndex] = hasActiveNucleus && r < bulgeSize * 0.2
      ? Math.random() * 0.8 + 0.7
      : Math.random() * 0.5 + 0.5;

    currentIndex++;
  }

  // Disk and arm generation
  for (let i = currentIndex; i < particlesCount; i++) {
    const i3 = i * 3;
    
    if (branches === 0) {
      // Irregular galaxy distribution
      const r = Math.random() * radius;
      const theta = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * diskHeight * 2;

      positions[i3] = r * Math.cos(theta);
      positions[i3 + 1] = height;
      positions[i3 + 2] = r * Math.sin(theta);
    } else {
      // Spiral or barred galaxy distribution
      const armRadius = Math.random() * radius;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const pitchAngle = Math.log(armRadius) * spiralPitch;
      
      // Bar formation for barred galaxies
      const isInBar = config.galaxyType === 'barred' && 
                     armRadius < radius * (barLength || 0.3);
      const rotation = isInBar
        ? branchAngle
        : branchAngle + pitchAngle + armRadius * spin;

      // Enhanced dust lane formation
      const armOffset = Math.random() * armWidth - armWidth / 2;
      const height = Math.random() * Math.exp(-armRadius / (radius * 0.3)) * diskHeight;

      // Structured randomness based on position
      const randomScale = Math.pow(Math.random(), randomnessPower) * 
                         (1 + armRadius / radius);
      const randomX = randomScale * (Math.random() < 0.5 ? 1 : -1);
      const randomY = randomScale * (Math.random() < 0.5 ? 1 : -1) * 0.5;
      const randomZ = randomScale * (Math.random() < 0.5 ? 1 : -1);

      positions[i3] = (Math.cos(rotation) * armRadius + randomX) + 
                     (isInBar ? Math.cos(branchAngle) * armRadius * 0.5 : 0);
      positions[i3 + 1] = height + randomY;
      positions[i3 + 2] = (Math.sin(rotation) * armRadius + randomZ) + 
                     (isInBar ? Math.sin(branchAngle) * armRadius * 0.5 : 0);
    }

    // Enhanced color mixing with star formation regions
    const mixedColor = new THREE.Color();
    const radiusPercent = Math.sqrt(
      positions[i3] * positions[i3] + 
      positions[i3 + 2] * positions[i3 + 2]
    ) / radius;

    if (dustLanes && 
        Math.abs(positions[i3 + 1]) < diskHeight * 0.2 && 
        Math.random() < 0.3) {
      mixedColor.copy(dustLaneColor);
      // Add reddening effect
      mixedColor.r *= 1.2;
      sizes[i] = Math.random() * 0.3 + 0.2;
    } else {
      mixedColor.lerpColors(centerColor, outerColor, radiusPercent);
      
      // Star formation regions
      const isStarForming = Math.random() < starFormationRate * 0.2 && 
                           radiusPercent > 0.3 && 
                           radiusPercent < 0.8;
      
      if (isStarForming) {
        mixedColor.r *= 1.2;
        mixedColor.g *= 1.1;
        sizes[i] = Math.random() * 0.8 + 0.6;
      } else {
        sizes[i] = Math.random() * 0.4 + 0.2;
      }

      // Natural color variation
      const variation = 0.1;
      mixedColor.r += (Math.random() - 0.5) * variation;
      mixedColor.g += (Math.random() - 0.5) * variation;
      mixedColor.b += (Math.random() - 0.5) * variation;
    }

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  return { positions, colors, sizes };
};
