'use client';

// Temporarily disabled - missing dependencies @react-three/drei and @react-three/fiber
// import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
// import { Canvas } from '@react-three/fiber';

// Temporarily disabled - missing dependencies
// function PigeonModel() {
//   const { scene } = useGLTF('/models/cf3eab1f-c4c2-43fc-9a8d-0583cf824574.glb');
//   return <primitive object={scene} scale={0.2} position={[0, -0.3, 0]} />;
// }

export default function Pigeon3D() {
  // Temporarily disabled - missing dependencies @react-three/drei and @react-three/fiber
  // Install these packages if you need 3D component: npm install @react-three/drei @react-three/fiber three
  return (
    <div className="w-full h-[450px] flex items-center justify-center">
      <p className="text-white/70">3D Model Component - dependencies not installed</p>
    </div>
  );
}
