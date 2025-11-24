 'use client';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { motion } from 'framer-motion';
import { SimpleChampionsList } from '@/components/champions/SimpleChampionsList';

export default function ChampionsPage() {
  return (
    <UnifiedLayout>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 -mt-24 pb-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold uppercase tracking-[0.5em] text-white/60 mb-6">nasze chempiony</h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto"
          >
            Poznaj nasze wybitne championy gołębi pocztowych. Każdy z nich to wyjątkowy
            przedstawiciel naszej linii hodowlanej PAŁKA MTM.
          </motion.p>
        </div>
      </motion.section>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-0">
        <SimpleChampionsList />
      </div>
    </UnifiedLayout>
  );
}
