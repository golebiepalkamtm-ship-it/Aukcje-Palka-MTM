'use client';

import { useEffect, useRef, useState } from 'react';

// Funkcja pomocnicza do wyświetlania flag emoji (natywnie wspierane we wszystkich przeglądarkach)
function getCountryFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Komponent flagi używający emoji
function CountryFlag({ countryCode, name }: { countryCode: string; name: string }) {
  return (
    <span className="text-2xl leading-none" title={name} role="img" aria-label={`Flaga ${name}`}>
      {getCountryFlagEmoji(countryCode)}
    </span>
  );
}

interface Country {
  code: string;
  name: string;
  phoneCode: string;
}

const countries: Country[] = [
  { code: 'AL', name: 'Albania', phoneCode: '+355' },
  { code: 'AM', name: 'Armenia', phoneCode: '+374' },
  { code: 'AT', name: 'Austria', phoneCode: '+43' },
  { code: 'AZ', name: 'Azerbejdżan', phoneCode: '+994' },
  { code: 'BE', name: 'Belgia', phoneCode: '+32' },
  { code: 'BY', name: 'Białoruś', phoneCode: '+375' },
  { code: 'BA', name: 'Bośnia i Hercegowina', phoneCode: '+387' },
  { code: 'BG', name: 'Bułgaria', phoneCode: '+359' },
  { code: 'CA', name: 'Kanada', phoneCode: '+1' },
  { code: 'HR', name: 'Chorwacja', phoneCode: '+385' },
  { code: 'CY', name: 'Cypr', phoneCode: '+357' },
  { code: 'CZ', name: 'Czechy', phoneCode: '+420' },
  { code: 'DK', name: 'Dania', phoneCode: '+45' },
  { code: 'EG', name: 'Egipt', phoneCode: '+20' },
  { code: 'EE', name: 'Estonia', phoneCode: '+372' },
  { code: 'FI', name: 'Finlandia', phoneCode: '+358' },
  { code: 'FR', name: 'Francja', phoneCode: '+33' },
  { code: 'GR', name: 'Grecja', phoneCode: '+30' },
  { code: 'ES', name: 'Hiszpania', phoneCode: '+34' },
  { code: 'NL', name: 'Holandia', phoneCode: '+31' },
  { code: 'IE', name: 'Irlandia', phoneCode: '+353' },
  { code: 'IL', name: 'Izrael', phoneCode: '+972' },
  { code: 'JP', name: 'Japonia', phoneCode: '+81' },
  { code: 'KZ', name: 'Kazachstan', phoneCode: '+7' },
  { code: 'KG', name: 'Kirgistan', phoneCode: '+996' },
  { code: 'LT', name: 'Litwa', phoneCode: '+370' },
  { code: 'LV', name: 'Łotwa', phoneCode: '+371' },
  { code: 'MK', name: 'Macedonia Północna', phoneCode: '+389' },
  { code: 'MT', name: 'Malta', phoneCode: '+356' },
  { code: 'MD', name: 'Mołdawia', phoneCode: '+373' },
  { code: 'MA', name: 'Maroko', phoneCode: '+212' },
  { code: 'DE', name: 'Niemcy', phoneCode: '+49' },
  { code: 'NO', name: 'Norwegia', phoneCode: '+47' },
  { code: 'PL', name: 'Polska', phoneCode: '+48' },
  { code: 'PT', name: 'Portugalia', phoneCode: '+351' },
  { code: 'RO', name: 'Rumunia', phoneCode: '+40' },
  { code: 'RS', name: 'Serbia', phoneCode: '+381' },
  { code: 'SK', name: 'Słowacja', phoneCode: '+421' },
  { code: 'SI', name: 'Słowenia', phoneCode: '+386' },
  { code: 'CH', name: 'Szwajcaria', phoneCode: '+41' },
  { code: 'SE', name: 'Szwecja', phoneCode: '+46' },
  { code: 'TR', name: 'Turcja', phoneCode: '+90' },
  { code: 'UA', name: 'Ukraina', phoneCode: '+380' },
  { code: 'GB', name: 'Wielka Brytania', phoneCode: '+44' },
  { code: 'HU', name: 'Węgry', phoneCode: '+36' },
  { code: 'IT', name: 'Włochy', phoneCode: '+39' },
  { code: 'AE', name: 'Zjednoczone Emiraty Arabskie', phoneCode: '+971' },
];

interface CountrySelectProps {
  value: string;
  onChange: (country: string, phoneCode: string) => void;
  className?: string;
}

export function CountrySelect({ value, onChange, className = '' }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCountry = countries.find(c => c.name === value);

  const handleSelect = (country: Country) => {
    onChange(country.name, country.phoneCode);
    setIsOpen(false);
  };

  // Zamykanie dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-3 justify-between"
        title="Wybierz kraj"
        aria-label="Wybierz kraj"
      >
        <div className="flex items-center gap-3">
          {selectedCountry ? (
            <>
              <CountryFlag countryCode={selectedCountry.code} name={selectedCountry.name} />
              <span className="text-white">{selectedCountry.name}</span>
              <span className="text-white/70">{selectedCountry.phoneCode}</span>
            </>
          ) : (
            <span className="text-white/70">Wybierz kraj</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl max-h-80 overflow-y-auto">
          {countries.map(country => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleSelect(country)}
              className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 ${
                country.name === value ? 'bg-white/10' : ''
              }`}
            >
              <CountryFlag countryCode={country.code} name={country.name} />
              <span className="flex-1 text-white">{country.name}</span>
              <span className="text-white/70">{country.phoneCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { countries };
