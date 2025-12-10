
'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Błąd wysyłania formularza:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      content: '+48 123 456 789',
      link: 'tel:+48123456789',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'kontakt@palkamtm.pl',
      link: 'mailto:kontakt@palkamtm.pl',
    },
    {
      icon: MapPin,
      title: 'Adres',
      content: 'Lubań, Dolny Śląsk, Polska',
      link: null,
    },
    {
      icon: Clock,
      title: 'Godziny pracy',
      content: 'Pn-Pt: 9:00 - 17:00',
      link: null,
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Tło */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/hero-bg.jpg"
          alt="Tło"
          fill
          className="object-cover"
          priority
          quality={95}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-slate-900/30" />
      </div>

      {/* Główna zawartość */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Nagłówek */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Skontaktuj się z nami
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Masz pytania? Chętnie pomożemy!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Informacje kontaktowe */}
          <div className="space-y-6">
            {/* Karta z informacjami */}
            <div className="backdrop-blur-md bg-white/15 border border-white/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-amber-400" />
                Dane kontaktowe
              </h2>

              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="group">
                    {item.link ? (
                      <a
                        href={item.link}
                        className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/20"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white/70 text-sm font-medium mb-1">
                            {item.title}
                          </h3>
                          <p className="text-white text-lg font-semibold">
                            {item.content}
                          </p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/20">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white/70 text-sm font-medium mb-1">
                            {item.title}
                          </h3>
                          <p className="text-white text-lg font-semibold">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dodatkowe informacje */}
            <div className="backdrop-blur-md bg-white/15 border border-white/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Szybka odpowiedź
              </h3>
              <p className="text-white/80 leading-relaxed">
                Odpowiadamy na wszystkie wiadomości w ciągu 24 godzin w dni robocze.
                W pilnych sprawach prosimy o kontakt telefoniczny.
              </p>
            </div>
          </div>

          {/* Formularz kontaktowy */}
          <div>
            <div className="backdrop-blur-md bg-white/15 border border-white/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Send className="w-8 h-8 text-amber-400" />
                Wyślij wiadomość
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none backdrop-blur-sm"
                    placeholder="Jan Kowalski"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none backdrop-blur-sm"
                    placeholder="jan.kowalski@example.com"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Temat
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none backdrop-blur-sm"
                    placeholder="Temat wiadomości"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Wiadomość
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none backdrop-blur-sm resize-none"
                    placeholder="Wpisz swoją wiadomość..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </button>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-green-300 text-center">
                    Wiadomość została wysłana pomyślnie!
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-center">
                    Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
