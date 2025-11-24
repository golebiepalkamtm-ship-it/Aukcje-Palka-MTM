 'use client';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { SimpleChampionsList } from '@/components/champions/SimpleChampionsList';

export default function ChampionsPage() {
  return (
    <UnifiedLayout>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 -mt-24 pb-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="nasze chempiony"
            subtitle="Poznaj nasze wybitne championy gołębi pocztowych. Każdy z nich to wyjątkowy przedstawiciel naszej linii hodowlanej PAŁKA MTM."
            variant="stylized"
          />
        </div>
      </motion.section>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-0">
        <SimpleChampionsList />
      </div>
    </UnifiedLayout>
  );
}
