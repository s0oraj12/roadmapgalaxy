import * as THREE from 'three';
import { GalaxyConfig } from '../types';

const DEFAULT_CONFIG: GalaxyConfig = {
  particlesCount: 1000000,
  radius: 20,
  branches: 5,
  spin: 1.5,
  randomnessPower: 2.05,
  bulgeSize: 0.25,
  armWidth: 0.3,
  dustLanes: true,
  coreIntensity: 2.5,
  // Adjusted colors for softer fade
  insideColor: '#ffab4d',
  outsideColor: '#1a4580', // Darker blue for less intense outer regions
  dustColor: '#4a2d05'
};

export const generateGalaxyGeometry = (config: Partial<GalaxyConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
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
    dustColor
  } = finalConfig;

  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  const sizes = new Float32Array(particlesCount);
  const centerColor = new THREE.Color(insideColor);
  const outerColor = new THREE.Color(outsideColor);
  const dustLaneColor = new THREE.Color(dustColor);

  // Create central bulge particles (35% of total)
  const bulgeCount = Math.floor(particlesCount * 0.35);
  let currentIndex = 0;

  for (let i = 0; i < bulgeCount; i++) {
    const i3 = currentIndex * 3;
    const r = Math.pow(Math.random(), 2) * radius * bulgeSize;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2;

    positions[i3] = r * Math.sin(theta) * Math.cos(phi);
    positions[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    positions[i3 + 2] = r * Math.cos(theta);

    const intensity = (1 - r / (radius * bulgeSize)) * coreIntensity;
    const mixedColor = new THREE.Color(insideColor);
    mixedColor.multiplyScalar(intensity);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    sizes[currentIndex] = Math.random() * 0.5 + 0.5;
    currentIndex++;
  }

  // Create spiral arm particles
  for (let i = currentIndex; i < particlesCount; i++) {
    const i3 = i * 3;
    const armRadius = (Math.random() * (radius - radius * bulgeSize)) + radius * bulgeSize;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;
    const spinAngle = armRadius * spin;

    const rotationAngle = branchAngle + spinAngle;
    const armOffset = Math.random() * armWidth - armWidth / 2;

    const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

    positions[i3] = (Math.cos(rotationAngle) * armRadius + randomX) + Math.cos(rotationAngle + Math.PI/2) * armOffset;
    positions[i3 + 1] = randomY * (armRadius / radius);
    positions[i3 + 2] = (Math.sin(rotationAngle) * armRadius + randomZ) + Math.sin(rotationAngle + Math.PI/2) * armOffset;

    const mixedColor = new THREE.Color();
    const radiusPercent = Math.pow(armRadius / radius, 1.5); // Added power for softer fade
    
    if (dustLanes && Math.abs(armOffset) < armWidth * 0.3 && Math.random() < 0.3) {
      mixedColor.copy(dustLaneColor);
    } else {
      mixedColor.lerpColors(centerColor, outerColor, radiusPercent);
      // Reduced color variation for outer regions
      const variation = 0.1 * (1 - radiusPercent);
      mixedColor.r += (Math.random() - 0.5) * variation;
      mixedColor.g += (Math.random() - 0.5) * variation;
      mixedColor.b += (Math.random() - 0.5) * variation;
    }

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    // Smaller particles at the edges
    sizes[i] = (Math.random() * 0.5 + 0.25) * (1 - radiusPercent * 0.5);
  }

  return { positions, colors, sizes };
};
