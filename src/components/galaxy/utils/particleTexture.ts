import * as THREE from 'three';

export function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d')!;
  
  // Create multiple layers for more realistic star appearance
  // Base glow
  const baseGlow = context.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );
  baseGlow.addColorStop(0, 'rgba(255,255,255,1)');
  baseGlow.addColorStop(0.4, 'rgba(255,255,255,0.8)');
  baseGlow.addColorStop(0.8, 'rgba(255,255,255,0.2)');
  baseGlow.addColorStop(1, 'rgba(255,255,255,0)');
  
  context.fillStyle = baseGlow;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add central bright spot
  const centerGlow = context.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 8
  );
  centerGlow.addColorStop(0, 'rgba(255,255,255,1)');
  centerGlow.addColorStop(1, 'rgba(255,255,255,0)');
  
  context.fillStyle = centerGlow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
