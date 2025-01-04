import * as THREE from 'three';
import { GalaxyConfig } from '../types';

const DEFAULT_CONFIG: GalaxyConfig = {
  particlesCount: 50000,
  radius: 10,
  branches: 3,
  spin: 5,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984'
};

export const generateGalaxyGeometry = (config: Partial<GalaxyConfig> = {}) => {
  const {
    particlesCount,
    radius,
    branches,
    spin,
    randomnessPower,
    insideColor,
    outsideColor
  } = { ...DEFAULT_CONFIG, ...config };

  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);

  const centerColor = new THREE.Color(insideColor);
  const outerColor = new THREE.Color(outsideColor);

  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 10;
    const spinAngle = radius * spin;
    const branchAngle = ((i % branches) * Math.PI * 2) / branches;

    const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
    const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
    const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * 0.3;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = new THREE.Color();
    mixedColor.lerpColors(centerColor, outerColor, radius / 10);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  return { positions, colors };
};
