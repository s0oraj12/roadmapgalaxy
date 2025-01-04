import { GalaxyConfig } from '../types/galaxyTypes';

export const GALAXY_PRESETS: Record<string, Partial<GalaxyConfig>> = {
  spiral: {
    particlesCount: 200000,
    radius: 12,
    branches: 5,
    spin: 1.5,
    randomnessPower: 2.8,
    bulgeSize: 0.3,
    armWidth: 0.4,
    dustLanes: true,
    coreIntensity: 2.5,
    insideColor: '#ffab4d',
    outsideColor: '#3b7bcc',
    dustColor: '#4a2d05',
    diskHeight: 0.8,
    bulgeHeight: 0.4,
    spiralPitch: 0.2
  },
  barred: {
    particlesCount: 250000,
    radius: 14,
    branches: 2,
    spin: 0.8,
    randomnessPower: 2.5,
    bulgeSize: 0.4,
    armWidth: 0.6,
    dustLanes: true,
    coreIntensity: 3.0,
    insideColor: '#ffd700',
    outsideColor: '#4169e1',
    dustColor: '#32251a',
    diskHeight: 1.0,
    bulgeHeight: 0.5,
    spiralPitch: 0.15,
    barLength: 0.4
  },
  irregular: {
    particlesCount: 180000,
    radius: 10,
    branches: 0,
    spin: 0.2,
    randomnessPower: 4.0,
    bulgeSize: 0.2,
    armWidth: 1.0,
    dustLanes: false,
    coreIntensity: 2.0,
    insideColor: '#ff8c00',
    outsideColor: '#4682b4',
    dustColor: '#2f2f2f',
    diskHeight: 1.2,
    bulgeHeight: 0.3,
    spiralPitch: 0
  }
};
