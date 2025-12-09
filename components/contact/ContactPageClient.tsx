'use client';

import GoogleMap from '@/components/contact/GoogleMap';
import { Text3D } from '@/components/ui/Text3D';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import GoldenCard from '@/components/ui/GoldenCard';

import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// use shared GoldenCard from components/ui/GoldenCard for consistent look

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
      <section className="relative z-10 pt-44 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold uppercase tracking-[0.5em] text-white/60 mb-6">Kontakt</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Skontaktuj się z nami, aby dowiedzieć się więcej o naszych gołębiach i hodowli
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <div className="relative px-4 sm:px-6 lg:px-8 pb-20 mt-12">
        <div
          aria-hidden
          className="absolute right-[-80px] bottom-[-80px] w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 70% 70%, rgba(255,245,200,0.35), rgba(255,200,80,0.08) 40%, transparent 70%)',
            filter: 'blur(40px)',
            mixBlendMode: 'soft-light',
            zIndex: 0,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto space-y-24">
          {/* Contact Info */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20 xl:gap-24">
              <GoldenCard className="text-center h-full min-h-[280px] flex flex-col justify-between no-glow">
                <div>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-amber-700/20">
                    <Phone className="w-8 h-8 text-amber-300" />
                  </div>
                  <Text3D variant="glow" intensity="medium" className="text-xl font-bold mb-4" animate={false} hover={false}>
                    Telefon
                  </Text3D>
                  <p className="text-white/90 mb-4">75 722 47 29</p>
                </div>
                <p className="text-white/60 text-sm">Dostępny 8:00 - 20:00</p>
              </GoldenCard>

              <GoldenCard className="text-center h-full min-h-[280px] flex flex-col justify-between no-glow">
                <div>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-amber-700/20">
                    <Mail className="w-8 h-8 text-amber-300" />
                  </div>
                  <Text3D variant="gradient" intensity="medium" className="text-xl font-bold mb-4" animate={false} hover={false}>
                    Email
                  </Text3D>
                  <p className="text-white/90 mb-4">kontakt@palkamtm.pl</p>
                </div>
                <p className="text-white/60 text-sm">Odpowiadamy w ciągu 24h</p>
              </GoldenCard>

              <GoldenCard className="text-center h-full min-h-[280px] flex flex-col justify-between no-glow">
                <div>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-amber-700/20">
                    <MapPin className="w-8 h-8 text-amber-300" />
                  </div>
                  <Text3D variant="neon" intensity="medium" className="text-xl font-bold mb-4" animate={false} hover={false}>
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
                </div>
                <p className="text-white/60 text-sm">Wizyty po umówieniu</p>
              </GoldenCard>
            </div>
          </section>

          {/* Google Map */}
          <div>
            <GoogleMap />
          </div>

          {/* Contact Form */}
          <section>
            <GoldenCard className="no-glow">
              <Text3D
                variant="shimmer"
                intensity="high"
                className="text-3xl md:text-4xl font-bold mb-8 text-center"
                animate={false}
                hover={false}
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
                      className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none"
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
                      className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none"
                      placeholder="twoj@email.pl"
                      aria-describedby="email-description"
                      required
                    />
                    <div id="email-description" className="sr-only">
                      Wprowadź swój adres email
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-white/90 text-sm font-medium mb-2">
                    Temat
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none"
                    placeholder="Temat wiadomości"
                    aria-describedby="subject-description"
                    required
                  />
                  <div id="subject-description" className="sr-only">
                    Wprowadź temat wiadomości
                  </div>
                </div>

                <div className="mb-8">
                  <label htmlFor="message" className="block text-white/90 text-sm font-medium mb-2">
                    Wiadomość
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none resize-none"
                    placeholder="Napisz swoją wiadomość..."
                    aria-describedby="message-description"
                    required
                  ></textarea>
                  <div id="message-description" className="sr-only">
                    Wprowadź treść wiadomości
                  </div>
                </div>

                <div className="text-center">
                  <UnifiedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    intensity="high"
                    glow={false}
                    className="px-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                  </UnifiedButton>
                </div>
              </form>
            </GoldenCard>
          </section>

          {/* Additional Info */}
          <section>
            <GoldenCard className="no-glow">
              <Text3D
                variant="glow"
                intensity="medium"
                className="text-2xl md:text-3xl font-bold mb-6 text-center"
                animate={false}
                hover={false}
              >
                Godziny Pracy
              </Text3D>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 xl:gap-24">
                <div className="relative text-center p-6 md:p-8 overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute right-[-28px] bottom-[-28px] w-40 h-40 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 70% 70%, rgba(255,245,200,0.45), rgba(255,200,80,0.12) 40%, transparent 65%)',
                      filter: 'blur(18px)',
                      mixBlendMode: 'soft-light',
                      zIndex: 0,
                    }}
                  />
                  <div className="relative z-10">
                    <h4 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/60 mb-4">Hodowla</h4>
                    <p className="text-white/90 mb-2">Poniedziałek - Piątek: 8:00 - 18:00</p>
                    <p className="text-white/90 mb-2">Sobota: 9:00 - 15:00</p>
                    <p className="text-white/90">Niedziela: Zamknięte</p>
                  </div>
                </div>
                <div className="relative text-center p-6 md:p-8 overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute right-[-28px] bottom-[-28px] w-40 h-40 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 70% 70%, rgba(255,245,200,0.45), rgba(255,200,80,0.12) 40%, transparent 65%)',
                      filter: 'blur(18px)',
                      mixBlendMode: 'soft-light',
                      zIndex: 0,
                    }}
                  />
                  <div className="relative z-10">
                    <h4 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/60 mb-4">Aukcje Online</h4>
                    <p className="text-white/90 mb-2">24/7 - Dostępne cały czas</p>
                    <p className="text-white/90 mb-2">Wsparcie: 8:00 - 20:00</p>
                    <p className="text-white/90">Email: 24h</p>
                  </div>
                </div>
              </div>
            </GoldenCard>
          </section>
        </div>
      </div>
    </>
  );
}
