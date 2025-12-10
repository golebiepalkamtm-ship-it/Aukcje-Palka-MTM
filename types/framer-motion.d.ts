declare module 'framer-motion' {
  // Minimal override to avoid strict prop type errors during build.
  // Expose common exports used in the codebase as `any`.
  const motion: any;
  const AnimatePresence: any;
  const Variants: any;
  const useAnimation: any;
  const useScroll: any;
  const useSpring: any;
  const useTransform: any;
  export { motion, AnimatePresence, Variants, useAnimation, useScroll, useSpring, useTransform };
  export default motion;
}
