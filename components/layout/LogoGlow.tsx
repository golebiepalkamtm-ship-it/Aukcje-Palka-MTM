'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';

export const LogoGlow = memo(function LogoGlow() {
  return (
    <motion.div
      className="relative z-[100]"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 2.0,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.3,
      }}
      style={{ transformOrigin: 'center' }}
    >
      <Link href="/">
        <motion.div 
          className="relative"
          animate={{
            filter: [
              'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) brightness(1.2)',
              'drop-shadow(0 0 30px rgba(255, 255, 255, 1)) brightness(1.3)',
              'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) brightness(1.2)',
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2.3, // Start glow animation after scale animation completes
          }}
        >
          {/* Główne logo z podświetleniem */}
          <Image
            src="/logo.png"
            alt="Pałka M.T.M. Mistrzowie Sprintu"
            width={240}
            height={240}
            className="h-48 w-auto object-contain cursor-pointer"
            unoptimized
            priority
          />
        </motion.div>
      </Link>
    </motion.div>
  );
});
