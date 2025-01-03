import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Galaxy from './Galaxy';

const Scene = () => {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas
        camera={{
          position: [0, 3, 10],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
      >
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.5}
          panSpeed={0.5}
          rotateSpeed={0.5}
        />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <Galaxy />
      </Canvas>
    </div>
  );
};

export default Scene;