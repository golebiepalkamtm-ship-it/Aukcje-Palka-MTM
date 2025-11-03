import { motion, type HTMLMotionProps } from 'framer-motion';

export function MotionButton(props: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, backgroundColor: '#facc15' }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 16 }}
      {...props}
    />
  );
}
