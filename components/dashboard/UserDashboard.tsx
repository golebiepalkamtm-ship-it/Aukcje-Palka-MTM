'use client';

import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { getPhoneCodeForCountry } from '@/lib/country-codes';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
// ...existing code...
import { sendEmailVerification } from 'firebase/auth';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  Camera,
  CheckCircle,
  Edit3,
  Gavel,
  Heart,
  Key,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Settings,
  Shield,
  Star,
  Trophy,
  User,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debug, error, isDev } from '@/lib/logger';

export function UserDashboard() {
  const { user, dbUser, signOut } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [auctionsSubTab, setAuctionsSubTab] = useState<
    'my-auctions' | 'watched' | 'bids' | 'ended' | 'sold'
  >('my-auctions');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Polska',
    phoneCode: '+48',
  });
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [auctionsData, _setAuctionsData] = useState({
    myAuctions: [],
    watchedAuctions: [],
    myBids: [],
    endedAuctions: [],
    soldAuctions: [],
  });

  // Usunięto console.log aby zmniejszyć spam w konsoli

  const tabs = useMemo(
    () => [
      { id: 'profile', label: 'Profil', icon: User, requiresVerification: false },
      { id: 'auctions', label: 'Moje aukcje', icon: Gavel, requiresVerification: true },
      { id: 'messages', label: 'Wiadomości', icon: MessageSquare, requiresVerification: false },
      { id: 'achievements', label: 'Osiągnięcia', icon: Trophy, requiresVerification: false },
      { id: 'references', label: 'Referencje', icon: Star, requiresVerification: false },
      { id: 'meetings', label: 'Spotkania', icon: Users, requiresVerification: false },
      { id: 'security', label: 'Bezpieczeństwo', icon: Shield, requiresVerification: false },
      { id: 'notifications', label: 'Powiadomienia', icon: Bell, requiresVerification: false },
      { id: 'settings', label: 'Ustawienia', icon: Settings, requiresVerification: false },
    ],
    []
  );

  // Używamy ref do śledzenia czy już pobraliśmy profil (zapisujemy UID użytkownika)
  const hasFetchedProfile = useRef<string | false>(false);

  const fetchUserProfile = useCallback(async () => {
    if (!user?.uid || hasFetchedProfile.current === user.uid) return;

    try {
      hasFetchedProfile.current = user.uid; // Zapisz UID zamiast true
      const token = await user.getIdToken();
      const response = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIsProfileComplete(data.user.isProfileVerified);
      }
    } catch (err) {
      error('Błąd podczas pobierania profilu:', err instanceof Error ? err.message : err);
      hasFetchedProfile.current = false; // Reset przy błędzie
    }
  }, [user]);

  // Obsługa parametru tab z URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }

    // Automatyczne otwarcie trybu edycji gdy jest parametr edit=true
    const editParam = searchParams.get('edit');
    if (editParam === 'true' && tab === 'profile') {
      setIsEditingProfile(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // tabs jest memoized z pustą tablicą, więc nie jest potrzebny

  // Inicjalizacja danych profilu - tylko raz przy załadowaniu
  useEffect(() => {
    if (!user?.uid) return;

    // Reset ref gdy zmieni się użytkownik
    if (hasFetchedProfile.current !== false && hasFetchedProfile.current !== user.uid) {
      hasFetchedProfile.current = false;
    }

    if (user && dbUser && hasFetchedProfile.current !== user.uid) {
      // Określ kod kierunkowy na podstawie kraju w danych lub domyślnie Polska
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const country = (dbUser as any)?.country || 'Polska';
      const phoneCode = getPhoneCodeForCountry(country);

      const newDisplayName =
        dbUser.firstName && dbUser.lastName
          ? `${dbUser.firstName} ${dbUser.lastName}`
          : user.displayName || '';

      setProfileData({
        displayName: newDisplayName,
        phoneNumber: dbUser.phoneNumber || user.phoneNumber || '',
        address: dbUser.address || '',
        city: dbUser.city || '',
        postalCode: dbUser.postalCode || '',
        country: country,
        phoneCode: phoneCode,
      });
      if (isDev) debug('Zainicjalizowano dane profilu z bazy:', dbUser);

      // Pobierz dane profilu z bazy danych tylko raz
      fetchUserProfile();
    } else if (user && !dbUser && hasFetchedProfile.current !== user.uid) {
      setProfileData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Polska',
        phoneCode: '+48',
      });
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, dbUser?.id]); // Używamy tylko konkretnych identyfikatorów

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Nie jesteś zalogowany</h1>
          <Link
            href="/auth/register"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
          >
            Zaloguj się
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Panel Użytkownika</h1>
        <p className="text-white/70">Zarządzaj swoim kontem i ustawieniami</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            {/* User Info */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">
                {user.displayName || 'Użytkownik'}
              </h2>
              <p className="text-white/70 text-sm">{user.email}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm">Aktywne</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isDisabled = tab.requiresVerification && !isProfileComplete;
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : isDisabled
                          ? 'text-white/30 cursor-not-allowed opacity-50'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    title={
                      isDisabled
                        ? 'Wymaga uzupełnienia profilu i weryfikacji telefonu przez SMS'
                        : ''
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {isDisabled && <Shield className="w-3 h-3 ml-auto text-yellow-400" />}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Wyloguj się</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Informacje o profilu</h3>
                  <button
                    onClick={() => {
                      if (isDev) debug('Kliknięto edytuj profil, aktualny stan:', isEditingProfile);
                      if (isDev) debug('Aktualne dane profilu:', profileData);
                      setIsEditingProfile(!isEditingProfile);
                      if (isDev) debug('Nowy stan edycji:', !isEditingProfile);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditingProfile ? 'Anuluj' : 'Edytuj profil'}</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Podstawowe informacje */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-white/70 text-sm">Imię i nazwisko</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileData.displayName}
                          onChange={e =>
                            setProfileData({ ...profileData, displayName: e.target.value })
                          }
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Wpisz imię i nazwisko"
                          title="Wpisz imię i nazwisko"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                          <User className="w-4 h-4 text-blue-400" />
                          <span className="text-white">
                            {profileData.displayName || 'Nie ustawiono'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/70 text-sm">Email</label>
                      <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-white">{user.email}</span>
                        {user.emailVerified ? (
                          <div title="Email zweryfikowany" className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-xs">Zweryfikowany</span>
                          </div>
                        ) : (
                          <div title="Email niezweryfikowany" className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 text-xs">Niezweryfikowany</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Numer telefonu */}
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Numer telefonu</label>
                    <div className="flex items-center gap-3">
                      {isEditingProfile ? (
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-white/70 text-sm whitespace-nowrap">
                            {profileData.phoneCode}
                          </span>
                          <input
                            type="tel"
                            value={profileData.phoneNumber
                              .replace(profileData.phoneCode, '')
                              .trim()}
                            onChange={e => {
                              const value = e.target.value.replace(/\D/g, '');
                              setProfileData({
                                ...profileData,
                                phoneNumber: `${profileData.phoneCode} ${value}`.trim(),
                              });
                            }}
                            className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="123 456 789"
                            title="Wpisz numer telefonu"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex-1">
                          <Phone className="w-4 h-4 text-green-400" />
                          <span className="text-white">
                            {profileData.phoneNumber || 'Nie ustawiono'}
                          </span>
                        </div>
                      )}
                      {profileData.phoneNumber && (
                        <button
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                          title="Zweryfikuj numer telefonu"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Tutaj będzie logika weryfikacji SMS
                            if (isDev)
                              debug(
                                'Rozpocznij weryfikację SMS dla numeru:',
                                profileData.phoneNumber
                              );
                          }}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Adres zamieszkania */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Adres zamieszkania</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Ulica i numer</label>
                        {isEditingProfile ? (
                          <AddressAutocomplete
                            value={profileData.address}
                            onChange={value => setProfileData({ ...profileData, address: value })}
                            placeholder="Wpisz nazwę ulicy..."
                            type="street"
                            country={profileData.country}
                            onCityChange={
                              profileData.country === 'Polska'
                                ? city => setProfileData({ ...profileData, city })
                                : undefined
                            }
                            onPostalCodeChange={
                              profileData.country === 'Polska'
                                ? postalCode => setProfileData({ ...profileData, postalCode })
                                : undefined
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-white">
                              {profileData.address || 'Nie ustawiono'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Miasto</label>
                        {isEditingProfile ? (
                          <AddressAutocomplete
                            value={profileData.city}
                            onChange={value => setProfileData({ ...profileData, city: value })}
                            placeholder="Wpisz nazwę miasta..."
                            type="city"
                            country={profileData.country}
                            onPostalCodeChange={
                              profileData.country === 'Polska'
                                ? postalCode => setProfileData({ ...profileData, postalCode })
                                : undefined
                            }
                            onStreetChange={
                              profileData.country === 'Polska'
                                ? street => setProfileData({ ...profileData, address: street })
                                : undefined
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-white">
                              {profileData.city || 'Nie ustawiono'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Kod pocztowy</label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            value={profileData.postalCode}
                            onChange={e =>
                              setProfileData({ ...profileData, postalCode: e.target.value })
                            }
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="00-000"
                            title="Wpisz kod pocztowy"
                            pattern="[0-9]{2}-[0-9]{3}"
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-white">
                              {profileData.postalCode || 'Nie ustawiono'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Kraj</label>
                        {isEditingProfile ? (
                          <CountrySelect
                            value={profileData.country}
                            onChange={(country, phoneCode) => {
                              // Wyciągnij numer bez kodu kierunkowego
                              let numberWithoutCode = profileData.phoneNumber;
                              if (numberWithoutCode.startsWith('+')) {
                                // Usuń istniejący kod kierunkowy (wszystkie cyfry po + do pierwszej spacji lub końca)
                                numberWithoutCode = numberWithoutCode
                                  .replace(/^\+\d+\s*/, '')
                                  .trim();
                              }

                              setProfileData({
                                ...profileData,
                                country,
                                phoneCode,
                                phoneNumber: numberWithoutCode
                                  ? `${phoneCode} ${numberWithoutCode}`
                                  : '',
                              });
                            }}
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-white">{profileData.country}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informacje o koncie */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Informacje o koncie</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Data utworzenia konta</label>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span className="text-white">
                            {user.metadata?.creationTime
                              ? new Date(user.metadata.creationTime).toLocaleDateString('pl-PL')
                              : 'Nieznana'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Ostatnie logowanie</label>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <span className="text-white">
                            {user.metadata?.lastSignInTime
                              ? new Date(user.metadata.lastSignInTime).toLocaleDateString('pl-PL')
                              : 'Nieznane'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Przyciski akcji */}
                {isEditingProfile && (
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={() => {
                        // Tutaj będzie logika zapisywania
                        debug('Zapisywanie profilu:', profileData);
                        setIsEditingProfile(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Zapisz zmiany</span>
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
                    >
                      <span>Anuluj</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'auctions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {user?.emailVerified ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white">Moje aukcje</h3>
                      <div className="flex gap-2">
                        <Link
                          href="/auctions"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                        >
                          <Search className="w-4 h-4" />
                          <span>Przeglądaj</span>
                        </Link>
                        <Link
                          href="/seller/create-auction"
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Utwórz</span>
                        </Link>
                      </div>
                    </div>

                    {/* Statystyki */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <div className="flex items-center gap-3">
                          <Gavel className="w-5 h-5 text-blue-400" />
                          <div>
                            <h4 className="text-white font-semibold">Moje aukcje</h4>
                            <p className="text-white/70 text-sm">
                              {auctionsData.myAuctions.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-pink-400" />
                          <div>
                            <h4 className="text-white font-semibold">Obserwowane</h4>
                            <p className="text-white/70 text-sm">
                              {auctionsData.watchedAuctions.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <div>
                            <h4 className="text-white font-semibold">Moje licytacje</h4>
                            <p className="text-white/70 text-sm">{auctionsData.myBids.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="w-5 h-5 text-purple-400" />
                          <div>
                            <h4 className="text-white font-semibold">Sprzedane</h4>
                            <p className="text-white/70 text-sm">
                              {auctionsData.soldAuctions.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Podzakładki */}
                    <div className="flex gap-2 mb-6 border-b border-white/10">
                      {[
                        { id: 'my-auctions', label: 'Moje aukcje', icon: Gavel },
                        { id: 'watched', label: 'Obserwowane', icon: Heart },
                        { id: 'bids', label: 'Moje licytacje', icon: TrendingUp },
                        { id: 'ended', label: 'Zakończone', icon: Clock },
                        { id: 'sold', label: 'Sprzedane', icon: Trophy },
                      ].map(subTab => {
                        const Icon = subTab.icon;
                        return (
                          <button
                            key={subTab.id}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onClick={() => setAuctionsSubTab(subTab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${
                              auctionsSubTab === subTab.id
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-white/70 hover:text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{subTab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Zawartość podzakładki */}
                    <div className="space-y-4">
                      {auctionsSubTab === 'my-auctions' && (
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-4">
                            Moje aktywne aukcje
                          </h4>
                          {auctionsData.myAuctions.length > 0 ? (
                            <div className="space-y-3">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {auctionsData.myAuctions.map((auction: any) => (
                                <div
                                  key={auction.id}
                                  className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="text-white font-semibold">{auction.title}</h5>
                                      <p className="text-white/70 text-sm">
                                        Aktualna cena: {auction.currentPrice} zł
                                      </p>
                                    </div>
                                    <Link
                                      href={`/auctions/${auction.id}`}
                                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                      Zobacz
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-white/70 mb-4">
                                Nie masz jeszcze żadnych aktywnych aukcji
                              </p>
                              <Link
                                href="/seller/create-auction"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                              >
                                <Plus className="w-4 h-4" />
                                Utwórz pierwszą aukcję
                              </Link>
                            </div>
                          )}
                        </div>
                      )}

                      {auctionsSubTab === 'watched' && (
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-4">
                            Obserwowane aukcje
                          </h4>
                          {auctionsData.watchedAuctions.length > 0 ? (
                            <div className="space-y-3">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {auctionsData.watchedAuctions.map((auction: any) => (
                                <div
                                  key={auction.id}
                                  className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="text-white font-semibold">{auction.title}</h5>
                                      <p className="text-white/70 text-sm">
                                        Aktualna cena: {auction.currentPrice} zł
                                      </p>
                                    </div>
                                    <Link
                                      href={`/auctions/${auction.id}`}
                                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                      Zobacz
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-white/70">
                                Nie obserwujesz jeszcze żadnych aukcji
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {auctionsSubTab === 'bids' && (
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-4">
                            Aukcje w których biorę udział
                          </h4>
                          {auctionsData.myBids.length > 0 ? (
                            <div className="space-y-3">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {auctionsData.myBids.map((bid: any) => (
                                <div
                                  key={bid.id}
                                  className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="text-white font-semibold">
                                        {bid.auction?.title || 'Aukcja'}
                                      </h5>
                                      <p className="text-white/70 text-sm">
                                        Moja oferta: {bid.amount} zł
                                        {bid.isWinning && (
                                          <span className="ml-2 text-green-400">• Wygrywam</span>
                                        )}
                                      </p>
                                    </div>
                                    <Link
                                      href={`/auctions/${bid.auctionId}`}
                                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                      Zobacz
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-white/70">
                                Nie bierzesz jeszcze udziału w żadnych aukcjach
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {auctionsSubTab === 'ended' && (
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-4">
                            Zakończone aukcje
                          </h4>
                          {auctionsData.endedAuctions.length > 0 ? (
                            <div className="space-y-3">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {auctionsData.endedAuctions.map((auction: any) => (
                                <div
                                  key={auction.id}
                                  className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="text-white font-semibold">{auction.title}</h5>
                                      <p className="text-white/70 text-sm">
                                        Zakończona:{' '}
                                        {new Date(auction.endTime).toLocaleDateString('pl-PL')}
                                      </p>
                                    </div>
                                    <Link
                                      href={`/auctions/${auction.id}`}
                                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                      Zobacz
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-white/70">Brak zakończonych aukcji</p>
                            </div>
                          )}
                        </div>
                      )}

                      {auctionsSubTab === 'sold' && (
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-4">
                            Sprzedane aukcje
                          </h4>
                          {auctionsData.soldAuctions.length > 0 ? (
                            <div className="space-y-3">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {auctionsData.soldAuctions.map((auction: any) => (
                                <div
                                  key={auction.id}
                                  className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="text-white font-semibold">{auction.title}</h5>
                                      <p className="text-white/70 text-sm">
                                        Sprzedane za: {auction.currentPrice} zł
                                      </p>
                                    </div>
                                    <Link
                                      href={`/auctions/${auction.id}`}
                                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                      Zobacz
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-white/70">Brak sprzedanych aukcji</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-4">Dostęp ograniczony</h3>
                    <p className="text-white/70 mb-6 max-w-md mx-auto">
                      Aby uzyskać dostęp do aukcji, musisz uzupełnić swój profil i zweryfikować
                      numer telefonu przez SMS.
                    </p>
                    <Link
                      href="?tab=profile"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                      <span>Uzupełnij profil i zweryfikuj telefon</span>
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Wiadomości</h3>

                <div className="space-y-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="text-white font-semibold">Skrzynka odbiorcza</h4>
                        <p className="text-white/70 text-sm">Komunikuj się z innymi hodowcami</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">Brak nowych wiadomości</h4>
                          <p className="text-white/70 text-sm">Sprawdź ponownie później</p>
                        </div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href="/messages"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Otwórz wiadomości</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Osiągnięcia</h3>

                <div className="space-y-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <div>
                        <h4 className="text-white font-semibold">Twoje osiągnięcia</h4>
                        <p className="text-white/70 text-sm">Zbieraj odznaki i osiągnięcia</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <h4 className="text-white font-semibold">Pierwsza aukcja</h4>
                      </div>
                      <p className="text-white/70 text-sm">Utwórz swoją pierwszą aukcję</p>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full w-0"></div>
                      </div>
                    </div>

                    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Star className="w-5 h-5 text-blue-400" />
                        <h4 className="text-white font-semibold">Aktywny hodowca</h4>
                      </div>
                      <p className="text-white/70 text-sm">Bądź aktywny przez 30 dni</p>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full w-[15%]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href="/achievements"
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-300"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Zobacz wszystkie</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'references' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Referencje</h3>

                <div className="space-y-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-green-400" />
                      <div>
                        <h4 className="text-white font-semibold">Twoje referencje</h4>
                        <p className="text-white/70 text-sm">Zobacz opinie innych hodowców</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">Brak referencji</h4>
                          <p className="text-white/70 text-sm">
                            Zacznij handlować, aby otrzymać pierwsze opinie
                          </p>
                        </div>
                        <div className="text-yellow-400 text-sm">0/5</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href="/references"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                    >
                      <Star className="w-4 h-4" />
                      <span>Zobacz referencje</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'meetings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Spotkania hodowców</h3>

                <div className="space-y-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-white font-semibold">Spotkania i wydarzenia</h4>
                        <p className="text-white/70 text-sm">Dołącz do społeczności hodowców</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">Brak nadchodzących spotkań</h4>
                          <p className="text-white/70 text-sm">Sprawdź ponownie później</p>
                        </div>
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href="/breeder-meetings"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
                    >
                      <Users className="w-4 h-4" />
                      <span>Zobacz spotkania</span>
                    </Link>
                    <Link
                      href="/breeder-meetings/dodaj-zdjecie"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Dodaj zdjęcie</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Bezpieczeństwo</h3>

                {showChangePassword ? (
                  <ChangePasswordForm
                    onSuccess={() => setShowChangePassword(false)}
                    onCancel={() => setShowChangePassword(false)}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="text-white font-semibold">Konto zabezpieczone</h4>
                          <p className="text-white/70 text-sm">
                            Twoje konto jest chronione przez Firebase Authentication
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-blue-400" />
                          <div>
                            <h4 className="text-white font-semibold">Weryfikacja email</h4>
                            <p className="text-white/70 text-sm">
                              {user.emailVerified
                                ? 'Email zweryfikowany'
                                : 'Email niezweryfikowany'}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs ${
                            user.emailVerified
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {user.emailVerified ? 'Zweryfikowany' : 'Niezweryfikowany'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <div className="flex items-center gap-3">
                          <Key className="w-4 h-4 text-purple-400" />
                          <div>
                            <h4 className="text-white font-semibold">Hasło</h4>
                            <p className="text-white/70 text-sm">Zarządzaj swoim hasłem</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowChangePassword(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                        >
                          Zmień hasło
                        </button>
                      </div>

                      {!user.emailVerified && (
                        <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-yellow-400" />
                            <div>
                              <h4 className="text-white font-semibold">Weryfikacja email</h4>
                              <p className="text-white/70 text-sm">
                                Wyślij ponownie email weryfikacyjny
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await sendEmailVerification(user);
                                debug('Email weryfikacyjny wysłany pomyślnie');
                                toast.success('Email weryfikacyjny został wysłany ponownie!', {
                                  duration: 4000,
                                  position: 'bottom-right',
                                });
                              } catch (err) {
                                error(
                                  'Błąd wysyłania email:',
                                  err instanceof Error ? err.message : err
                                );
                                toast.error(
                                  'Wystąpił błąd podczas wysyłania email. Spróbuj ponownie.',
                                  {
                                    duration: 4000,
                                    position: 'bottom-right',
                                  }
                                );
                              }
                            }}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-300"
                          >
                            Wyślij ponownie
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Powiadomienia</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="text-white font-semibold">Powiadomienia email</h4>
                        <p className="text-white/70 text-sm">
                          Otrzymuj powiadomienia o nowych aukcjach i aktualizacjach
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <span className="text-white">Nowe aukcje</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        defaultChecked
                        aria-label="Włącz powiadomienia o nowych aukcjach"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <span className="text-white">Aktualizacje konta</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        defaultChecked
                        aria-label="Włącz powiadomienia o aktualizacjach konta"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <span className="text-white">Powiadomienia SMS</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        aria-label="Włącz powiadomienia SMS"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Ustawienia</h3>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <div>
                        <h4 className="text-white font-semibold">Język</h4>
                        <p className="text-white/70 text-sm">Wybierz język interfejsu</p>
                      </div>
                      <select
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        aria-label="Wybierz język interfejsu"
                      >
                        <option value="pl">Polski</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <div>
                        <h4 className="text-white font-semibold">Motyw</h4>
                        <p className="text-white/70 text-sm">Wybierz motyw aplikacji</p>
                      </div>
                      <select
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        aria-label="Wybierz motyw aplikacji"
                      >
                        <option value="dark">Ciemny</option>
                        <option value="light">Jasny</option>
                        <option value="auto">Automatyczny</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                      <div>
                        <h4 className="text-white font-semibold">Tryb deweloperski</h4>
                        <p className="text-white/70 text-sm">
                          Włącz dodatkowe informacje debugowania
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle"
                        aria-label="Włącz tryb deweloperski"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300">
                      Zapisz ustawienia
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
