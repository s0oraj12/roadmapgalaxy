export interface GalaxyConfig {
  particlesCount: number;
  radius: number;
  branches: number;
  spin: number;
  randomnessPower: number;
  bulgeSize: number;
  armWidth: number;
  dustLanes: boolean;
  coreIntensity: number;
  insideColor: string;
  outsideColor: string;
  dustColor: string;
  galaxyType: 'spiral' | 'barred' | 'irregular';
  hasActiveNucleus: boolean;
  starFormationRate: number;
  diskHeight: number;
  bulgeHeight: number;
  spiralPitch: number;
  barLength?: number;
}
