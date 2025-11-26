'use client';

import GoogleMap from '@/components/contact/GoogleMap';
import { PageHeader } from '@/components/ui/PageHeader';
import { Text3D } from '@/components/ui/Text3D';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

type GlowRef<T extends HTMLElement> = React.RefObject<T> | React.MutableRefObject<T | null>;

const useCardGlow = <T extends HTMLElement>(cardRef: GlowRef<T>) => {
  useEffect(() => {
    const $card = cardRef.current;
    if (!$card) return;

    const centerOfElement = ($el: HTMLElement) => {
      const { width, height } = $el.getBoundingClientRect();
      return [width / 2, height / 2];
    };

    const pointerPositionRelativeToElement = ($el: HTMLElement, e: MouseEvent) => {
      const pos = [e.clientX, e.clientY];
      const { left, top, width, height } = $el.getBoundingClientRect();
      const x = pos[0] - left;
      const y = pos[1] - top;
      const px = Math.min(Math.max((100 / width) * x, 0), 100);
      const py = Math.min(Math.max((100 / height) * y, 0), 100);
      return { pixels: [x, y], percent: [px, py] };
    };

    const angleFromPointerEvent = ($el: HTMLElement, dx: number, dy: number) => {
      let angleDegrees = 0;
      if (dx !== 0 || dy !== 0) {
        const angleRadians = Math.atan2(dy, dx);
        angleDegrees = angleRadians * (180 / Math.PI) + 90;
        if (angleDegrees < 0) {
          angleDegrees += 360;
        }
      }
      return angleDegrees;
    };

    const distanceFromCenter = ($card: HTMLElement, x: number, y: number) => {
      const [cx, cy] = centerOfElement($card);
      return [x - cx, y - cy];
    };

    const closenessToEdge = ($card: HTMLElement, x: number, y: number) => {
      const [cx, cy] = centerOfElement($card);
      const [dx, dy] = distanceFromCenter($card, x, y);
      let k_x = Infinity;
      let k_y = Infinity;
      if (dx !== 0) {
        k_x = cx / Math.abs(dx);
      }
      if (dy !== 0) {
        k_y = cy / Math.abs(dy);
      }
      return Math.min(Math.max(1 / Math.min(k_x, k_y), 0), 1);
    };

    const round = (value: number, precision = 3) => parseFloat(value.toFixed(precision));

    const cardUpdate = (e: MouseEvent) => {
      const position = pointerPositionRelativeToElement($card, e);
      const [px, py] = position.pixels;
      const [dx, dy] = distanceFromCenter($card, px, py);
      const edge = closenessToEdge($card, px, py);
      const angle = angleFromPointerEvent($card, dx, dy);
      
      $card.style.setProperty('--pointer-x', `${round(position.percent[0])}%`);
      $card.style.setProperty('--pointer-y', `${round(position.percent[1])}%`);
      $card.style.setProperty('--pointer-°', `${round(angle)}deg`);
      $card.style.setProperty('--pointer-d', `${round(edge * 100)}`);
      $card.classList.remove('animating');
    };

    $card.addEventListener('pointermove', cardUpdate);

    return () => {
      $card.removeEventListener('pointermove', cardUpdate);
    };
  }, [cardRef]);
};

export default function ContactPageClient() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Wiadomość została wysłana pomyślnie!', {
          duration: 4000,
        });
        setFormData({
          fullName: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Nie udało się wysłać wiadomości', {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Wystąpił błąd podczas wysyłania wiadomości', {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 -mt-28 sm:-mt-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Kontakt"
            subtitle="Skontaktuj się z nami, aby dowiedzieć się więcej o naszych gołębiach i hodowli"
            variant="stylized"
            subtitleClassName="text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
          />
        </div>
      </motion.section>

      {/* Content Sections */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.3,
                  },
                },
              }}
            >
              {(() => {
                const ContactCard = ({ children, index }: { children: React.ReactNode; index: number }) => {
                  const cardRef = useRef<HTMLDivElement>(null);
                  useCardGlow(cardRef);

                  return (
                    <div ref={cardRef} className="achievement-card" style={{ position: 'relative', isolation: 'isolate', overflow: 'visible' }}>
                      <div className="glow" />
                      <div className="relative z-10" style={{ overflow: 'hidden', borderRadius: '1rem' }}>
                        {children}
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    <ContactCard index={0}>
                      <UnifiedCard
                        variant="glass"
                        glow={true}
                        hover={true}
                        className="p-8 text-center w-full h-full flex flex-col"
                      >
                        <div className="w-16 h-16 glass-morphism-strong rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-white">
                          <Phone className="w-8 h-8 text-white/60" />
                        </div>
                        <Text3D variant="glow" intensity="medium" className="text-xl font-bold mb-4">
                          Telefon
                        </Text3D>
                        <p className="text-white/90 mb-4">75 722 47 29</p>
                        <p className="text-white/70 text-sm">Dostępny 8:00 - 20:00</p>
                      </UnifiedCard>
                    </ContactCard>

                    <ContactCard index={1}>
                      <UnifiedCard
                        variant="glass"
                        glow={true}
                        hover={true}
                        className="p-8 text-center w-full h-full flex flex-col"
                      >
                        <div className="w-16 h-16 glass-morphism-strong rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-white">
                          <Mail className="w-8 h-8 text-white/60" />
                        </div>
                        <Text3D variant="gradient" intensity="medium" className="text-xl font-bold mb-4">
                          Email
                        </Text3D>
                        <p className="text-white/90 mb-4">kontakt@palkamtm.pl</p>
                        <p className="text-slate-200 text-sm">Odpowiadamy w ciągu 24h</p>
                      </UnifiedCard>
                    </ContactCard>

                    <ContactCard index={2}>
                      <UnifiedCard
                        variant="glass"
                        glow={true}
                        hover={true}
                        className="p-8 text-center w-full h-full flex flex-col"
                      >
                        <div className="w-16 h-16 glass-morphism-strong rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-white">
                          <MapPin className="w-8 h-8 text-slate-300" />
                        </div>
                        <Text3D variant="neon" intensity="medium" className="text-xl font-bold mb-4">
                          Adres
                        </Text3D>
                        <p className="text-white/90 mb-4">
                          Pałka MTM
                          <br />
                          ul. Stawowa 6<br />
                          59-800 Lubań
                          <br />
                          woj. dolnośląskie
                        </p>
                        <p className="text-slate-200 text-sm">Wizyty po umówieniu</p>
                      </UnifiedCard>
                    </ContactCard>
                  </>
                );
              })()}
            </motion.div>
          </motion.section>

          {/* Google Map */}
          <GoogleMap />

          {/* Contact Form */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <UnifiedCard
              variant="glass"
              glow={true}
              hover={true}
              className="p-8"
            >
              <Text3D
                variant="shimmer"
                intensity="high"
                className="text-3xl md:text-4xl font-bold mb-8 text-center"
              >
                Napisz do nas
              </Text3D>

              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-white/90 text-sm font-medium mb-2"
                    >
                      Imię i nazwisko
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-300"
                      placeholder="Twoje imię i nazwisko"
                      aria-describedby="fullName-description"
                      required
                    />
                    <div id="fullName-description" className="sr-only">
                      Wprowadź swoje imię i nazwisko
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-300"
                      placeholder="twoj@email.pl"
                      aria-describedby="email-description"
