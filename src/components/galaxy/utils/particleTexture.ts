import * as THREE from 'three';

export function createParticleTexture() {
  // Reduced size for better performance
  const canvas = document.createElement('canvas');
  canvas.width = 16; // Reduced from 32
  canvas.height = 16; // Reduced from 32
  
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  
  // Optimized gradient stops for better performance
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(0.6, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  // Set texture parameters for better performance
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  return texture;
}
