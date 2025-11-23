'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export function LogoGlow() {
  return (
    <motion.div
      className="relative z-[100]"
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
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Główne logo z podświetleniem */}
          <Image
            src="/logo.png"
            alt="Pałka M.T.M. Mistrzowie Sprintu"
            width={320}
            height={320}
            className="h-80 w-auto object-contain cursor-pointer"
            style={{ 
              width: 'auto', 
              height: 'auto',
            }}
            unoptimized
            priority
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
