"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SimpleChampionsList } from './SimpleChampionsList';
import ImageModal from '@/components/ImageModal';

export default function ChampionsClient() {
  const [selectedPedigreeImage, setSelectedPedigreeImage] = useState<string | null>(null);
  const [centralChampion, setCentralChampion] = useState<{ pedigreeImage?: string; name?: string } | null>(null);

  return (
    <>
      <motion.section
        // @ts-ignore
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 pt-[100px] pb-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold uppercase tracking-[0.5em] text-white/60 mb-6">Nasze Championy</h1>
          <motion.p
            // @ts-ignore
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto"
          >
            Poznaj nasze wybitne championy gołębi pocztowych. Każdy z nich to wyjątkowy
            przedstawiciel naszej linii hodowlanej PAŁKA MTM.
          </motion.p>
        </div>
      </motion.section>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <SimpleChampionsList
            onPedigreeClick={(img) => setSelectedPedigreeImage(img)}
            onCentralChampionChange={(c) => setCentralChampion(c)}
          />
        </div>
      </div>

      {/* Pedigree Image Modal */}
      {selectedPedigreeImage && (
        <ImageModal
          image={{ id: 'pedigree-image', src: selectedPedigreeImage, alt: 'Rodowód championa' }}
          onClose={() => setSelectedPedigreeImage(null)}
        />
      )}
    </>
  );
}
