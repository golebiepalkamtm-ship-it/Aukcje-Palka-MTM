'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import ImageModal from '@/components/ImageModal';

export default function GoldenPairSection() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  // Placeholder - można rozszerzyć o dynamiczne ładowanie z API
  const photos: string[] = [];
  const pedigrees: string[] = [];

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold uppercase tracking-[0.5em] text-white/60 mb-6">
            Złota Para
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Nasza wyjątkowa para championów - fundament naszej linii hodowlanej PAŁKA MTM.
          </p>
        </motion.section>

        {photos.length === 0 && pedigrees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/70 text-lg">
              Zawartość Złotej Pary będzie dostępna wkrótce.
            </p>
          </div>
        ) : (
          <>
            {photos.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Zdjęcia</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photos.map((photo, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage({ src: photo, alt: `Zdjęcie ${index + 1}` })}
                    >
                      <Image
                        src={photo}
                        alt={`Zdjęcie ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {pedigrees.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Rodowody</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pedigrees.map((pedigree, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage({ src: pedigree, alt: `Rodowód ${index + 1}` })}
                    >
                      <Image
                        src={pedigree}
                        alt={`Rodowód ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {selectedImage && (
          <ImageModal
            image={{
              id: 'golden-pair-image',
              src: selectedImage.src,
              alt: selectedImage.alt,
            }}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    </div>
  );
}

