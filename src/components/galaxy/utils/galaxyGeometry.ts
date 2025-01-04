import * as THREE from 'three';
import { GalaxyConfig } from '../types';

const DEFAULT_CONFIG: GalaxyConfig = {
  particlesCount: 1000000, // Increased to 1 million
  radius: 12,
  branches: 6, // Increased branches for better particle distribution
  spin: 1.3, // Slightly reduced for better performance with more particles
  randomnessPower: 2.5, // Adjusted for better distribution
  bulgeSize: 0.22, // Reduced for tighter core
  armWidth: 0.3, // Reduced for cleaner spiral arms
  dustLanes: true,
  coreIntensity: 3.0, // Increased for brighter core
  insideColor: '#ff9933', // Adjusted for better visibility with smaller particles
  outsideColor: '#3366cc', // Adjusted for better visibility with smaller particles
  dustColor: '#331a00' // Darker dust lanes for contrast
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

  // Pre-allocate arrays for better performance
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  const sizes = new Float32Array(particlesCount);
  
  // Pre-create colors for better performance
  const centerColor = new THREE.Color(insideColor);
  const outerColor = new THREE.Color(outsideColor);
  const dustLaneColor = new THREE.Color(dustColor);
  const mixedColor = new THREE.Color();

  // Create central bulge particles (25% of total for better density distribution)
  const bulgeCount = Math.floor(particlesCount * 0.25);
  let currentIndex = 0;

  // Optimized bulge generation
  for (let i = 0; i < bulgeCount; i++) {
    const i3 = currentIndex * 3;
    const r = Math.pow(Math.random(), 3) * radius * bulgeSize; // Cubic distribution for denser core
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1); // Better spherical distribution

    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    // Optimized color calculation
    const intensity = Math.pow(1 - r / (radius * bulgeSize), 2) * coreIntensity;
    mixedColor.copy(centerColor).multiplyScalar(intensity);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    sizes[currentIndex] = Math.random() * 0.3 + 0.2; // Varied sizes for depth
    currentIndex++;
  }

  // Optimized spiral arm generation
  const armOffset = Math.PI * 2 / branches;
  for (let i = currentIndex; i < particlesCount; i++) {
    const i3 = i * 3;
    const armRadius = Math.random() * (radius - radius * bulgeSize) + radius * bulgeSize;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;
    
    // Optimized spiral formula
    const rotation = branchAngle + armRadius * spin;
    const randomOffset = Math.pow(Math.random(), randomnessPower);
    const offsetAngle = (Math.random() - 0.5) * armWidth;
    
    // Calculate position with optimized math
    const x = Math.cos(rotation);
    const z = Math.sin(rotation);
    positions[i3] = x * armRadius + Math.cos(rotation + Math.PI/2) * offsetAngle;
    positions[i3 + 1] = (Math.random() - 0.5) * randomOffset * 2;
    positions[i3 + 2] = z * armRadius + Math.sin(rotation + Math.PI/2) * offsetAngle;

    // Optimized color mixing
    const radiusPercent = armRadius / radius;
    if (dustLanes && Math.abs(offsetAngle) < armWidth * 0.25 && Math.random() < 0.3) {
      mixedColor.copy(dustLaneColor);
    } else {
      mixedColor.lerpColors(centerColor, outerColor, radiusPercent);
      // Minimal color variation for performance
      const variation = 0.05;
      mixedColor.r += (Math.random() - 0.5) * variation;
      mixedColor.g += (Math.random() - 0.5) * variation;
      mixedColor.b += (Math.random() - 0.5) * variation;
    }

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    // Smaller sizes for better performance with more particles
    sizes[i] = Math.random() * 0.2 + 0.1;
  }

  return { positions, colors, sizes };
};
