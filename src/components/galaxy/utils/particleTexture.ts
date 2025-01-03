import * as THREE from 'three';

export function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; // Increased resolution
  canvas.height = 64;
  
  const context = canvas.getContext('2d')!;
  
  // Create main gradient
  const mainGradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  
  // Enhanced color stops for more realistic star appearance
  mainGradient.addColorStop(0, 'rgba(255,255,255,1)');
  mainGradient.addColorStop(0.2, 'rgba(255,255,255,0.9)');
  mainGradient.addColorStop(0.4, 'rgba(255,255,255,0.5)');
  mainGradient.addColorStop(0.6, 'rgba(255,255,255,0.2)');
  mainGradient.addColorStop(1, 'rgba(255,255,255,0)');

  // Clear canvas
  context.fillStyle = 'rgba(0,0,0,0)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add main glow
  context.fillStyle = mainGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add central bright spot
  const centerGradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 8
  );
  
  centerGradient.addColorStop(0, 'rgba(255,255,255,1)');
  centerGradient.addColorStop(1, 'rgba(255,255,255,0)');
  
  context.fillStyle = centerGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle cross diffraction
  context.strokeStyle = 'rgba(255,255,255,0.1)';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(canvas.width / 2, canvas.height);
  context.moveTo(0, canvas.height / 2);
  context.lineTo(canvas.width, canvas.height / 2);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  // Set texture parameters for better quality
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  
  return texture;
}
