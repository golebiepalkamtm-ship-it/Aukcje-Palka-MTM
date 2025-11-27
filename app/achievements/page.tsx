
'use client';
import {
  AchievementTimeline,
  achievementsTimelineData,
} from '@/components/achievements/AchievementTimeline';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';

export default function AchievementsPage() {
  return (
    <UnifiedLayout>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 pt-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Chronologiczne trofea 2001–2024"
            subtitle="Kompletna oś czasu obejmująca wyniki Oddziału Lubań 092, Łużyce Lubań 0446, Kwisa 0489, Okręgu Jelenia Góra, Regionu V i MP."
            variant="stylized"
            subtitleClassName="text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
          />
        </div>
      </motion.section>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-0">
        <AchievementTimeline items={achievementsTimelineData} />
      </div>
    </UnifiedLayout>
  );
}
