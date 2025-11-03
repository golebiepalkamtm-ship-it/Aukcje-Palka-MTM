import { motion } from 'framer-motion';

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: '0 8px 40px #08f5' }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="rounded-xl bg-slate-800"
    >
      {children}
    </motion.div>
  );
}
