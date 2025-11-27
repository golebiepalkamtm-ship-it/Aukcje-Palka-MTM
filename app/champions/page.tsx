 'use client';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { SimpleChampionsList } from '@/components/champions/SimpleChampionsList';

export default function ChampionsPage() {
  return (
    <UnifiedLayout contentPaddingTop="compact">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 pt-32 pb-4 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="nasze chempiony"
            subtitle="Poznaj nasze wybitne championy gołębi pocztowych. Każdy z nich to wyjątkowy przedstawiciel naszej linii hodowlanej PAŁKA MTM."
            variant="stylized"
            subtitleClassName="text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
          />
        </div>
      </motion.section>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <SimpleChampionsList />
      </div>
    </UnifiedLayout>
  );
}
