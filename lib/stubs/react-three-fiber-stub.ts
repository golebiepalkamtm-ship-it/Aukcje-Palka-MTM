// Stub dla @react-three/fiber - używany gdy komponent nie potrzebuje React Three Fiber
export const Canvas = () => null;
export const useFrame = () => {};
export const useThree = () => ({ camera: null, gl: null, scene: null });

const fiberStub = {};

export default fiberStub;
